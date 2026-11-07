import React, {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {AssistantEngine, type Answer, type Index, type Paragraph} from './engine';
import styles from './styles.module.css';

type Message =
  | {id: number; role: 'user'; text: string}
  | {id: number; role: 'assistant'; answer: Answer; llmText?: string};

const SUGGESTIONS = [
  'How do I install Refract?',
  'What is the difference between useEffect and useOptic?',
  'How do I share state between components?',
  'Why didn’t my array update?',
];

// How long to wait for the optional LLM endpoint before using the local answer.
const LLM_TIMEOUT_MS = 15000;

let enginePromise: Promise<AssistantEngine> | null = null;
function loadEngine(): Promise<AssistantEngine> {
  enginePromise ??= import('@refract/assistant-index').then(
    (mod) => new AssistantEngine((mod.default ?? mod) as Index),
  );
  return enginePromise;
}

/** Renders `inline code` inside plain-text answers. */
function Inline({text}: {text: string}): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}

function Para({p}: {p: Paragraph}) {
  if (p.type === 'p') return <p><Inline text={p.text} /></p>;
  if (p.type === 'list')
    return <ul>{p.items.map((it, i) => <li key={i}><Inline text={it} /></li>)}</ul>;
  const [head, ...rows] = p.rows;
  return (
    <ul className={styles.tableList} aria-label={head}>
      {rows.slice(0, 8).map((r, i) => <li key={i}><Inline text={r} /></li>)}
    </ul>
  );
}

function AssistantMessage({answer, llmText}: {answer: Answer; llmText?: string}) {
  return (
    <div className={styles.bubbleAssistant}>
      {llmText ? (
        llmText.split(/\n{2,}/).map((t, i) => <p key={i}><Inline text={t} /></p>)
      ) : (
        <>
          <p className={answer.kind === 'answer' ? styles.from : undefined}>{answer.intro}</p>
          {answer.paragraphs.map((p, i) => <Para key={i} p={p} />)}
          {answer.code && (
            <div className={styles.code}>
              <CodeBlock language={answer.code.lang}>{answer.code.code}</CodeBlock>
            </div>
          )}
        </>
      )}
      {answer.sources.length > 0 && (
        <div className={styles.sources}>
          <span className={styles.sourcesLabel}>{answer.kind === 'fallback' ? 'Start here' : 'Sources'}</span>
          <ul>
            {answer.sources.map((s) => (
              <li key={s.url}>
                <Link to={s.url}>
                  {s.page}
                  {s.heading && <span className={styles.sourceHeading}> › {s.heading}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PrismIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3 3 19h18L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M1 12.5h6.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.6 11.4 23 9M16.3 12.7l6.7.8M17 14l6 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function DocsAssistant() {
  const {siteConfig} = useDocusaurusContext();
  const endpoint = (siteConfig.customFields?.assistantEndpoint as string) || '';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      loadEngine().catch(() => setStatus('The assistant could not load its index. Reload the page to try again.'));
      inputRef.current?.focus();
    }
  }, [open]);

  // Other parts of the site (such as the homepage) can open the assistant.
  useEffect(() => {
    const openFromEvent = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string | undefined>).detail;
      if (q) setInput(q);
    };
    window.addEventListener('refract:open-assistant', openFromEvent);
    return () => window.removeEventListener('refract:open-assistant', openFromEvent);
  }, []);

  // Scroll so the start of the newest message is visible; long answers are
  // read from the top, not the bottom.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const last = list.lastElementChild as HTMLElement | null;
    const top = last ? last.offsetTop - list.offsetTop - 8 : list.scrollHeight;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({top, behavior: reduce ? 'auto' : 'smooth'});
  }, [messages, busy]);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput('');
    setMessages((m) => [...m, {id: nextId.current++, role: 'user', text: q}]);
    setBusy(true);
    try {
      const engine = await loadEngine();
      const answer = engine.answer(q);
      let llmText: string | undefined;
      // Optional: if an LLM endpoint is configured, let it write the answer
      // from the retrieved sections. Falls back to the local answer on error,
      // on a malformed response, or if the endpoint takes too long.
      if (endpoint && answer.kind === 'answer') {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question: q, context: answer.contextText}),
            signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
          });
          if (res.ok) {
            const data = await res.json();
            if (typeof data?.answer === 'string' && data.answer.trim()) llmText = data.answer;
          }
        } catch {
          /* use the local answer */
        }
      }
      await new Promise((r) => setTimeout(r, 250));
      setMessages((m) => [...m, {id: nextId.current++, role: 'assistant', answer, llmText}]);
      setStatus(answer.kind === 'fallback' ? 'No matching section found.' : `Answer ready. ${answer.sources.length} sources.`);
    } catch {
      setStatus('The assistant could not load its index. Reload the page to try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={styles.launcher}
        aria-expanded={open}
        aria-controls="refract-assistant"
        onClick={() => (open ? close() : setOpen(true))}>
        <PrismIcon />
        <span>Ask Refract</span>
      </button>

      {open && (
        <section id="refract-assistant" className={styles.panel} role="dialog" aria-label="Ask Refract docs assistant">
          <header className={styles.header}>
            <div>
              <h2>Ask Refract</h2>
              <p>Answers come from this documentation, with links to each source.</p>
            </div>
            <button type="button" className={styles.close} onClick={close} aria-label="Close assistant">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className={styles.messages} ref={listRef}>
            {messages.length === 0 && (
              <div className={styles.empty}>
                <p>Ask a question about Refract in your own words. Try one of these:</p>
                <div className={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className={styles.bubbleUser}>{m.text}</div>
              ) : (
                <AssistantMessage key={m.id} answer={m.answer} llmText={m.llmText} />
              ),
            )}
            {busy && (
              <div className={styles.typing} aria-hidden="true">
                <span /><span /><span />
              </div>
            )}
          </div>

          <div className="sr-only" aria-live="polite">{status}</div>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}>
            <label htmlFor="assistant-input" className="sr-only">Your question</label>
            <textarea
              id="assistant-input"
              ref={inputRef}
              rows={1}
              value={input}
              placeholder="How do I fetch data in an optic?"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            <button type="submit" disabled={!input.trim() || busy}>Ask</button>
          </form>
        </section>
      )}
    </>
  );
}
