import React, {useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import styles from './index.module.css';

/**
 * The hero diagram shows Refract's core idea: one state change is refracted
 * into exactly the components that read it, and nothing else re-renders.
 */
function PrismDiagram() {
  const rays = [
    {y: 62, color: 'var(--rf-red)', label: '<Counter />'},
    {y: 128, color: 'var(--rf-amber)', label: '<CartBadge />'},
    {y: 194, color: 'var(--rf-green)', label: 'total (derived)'},
  ];
  return (
    <svg className={styles.prism} viewBox="0 0 560 300" role="img" aria-labelledby="prism-title prism-desc">
      <title id="prism-title">How a refraction updates the UI</title>
      <desc id="prism-desc">
        Calling count.set(5) sends one update into the refraction. It reaches the Counter, the cart
        badge and a derived total, which read count. The Header does not read count, so it does not
        re-render.
      </desc>

      <text x="4" y="140" className={styles.prismCode}>count.set(5)</text>
      <line x1="4" y1="153" x2="200" y2="153" className={styles.beamIn} />

      {rays.map((r, i) => (
        <g key={r.label} style={{animationDelay: `${0.55 + i * 0.12}s`}} className={styles.rayGroup}>
          <line x1="262" y1={142 + i * 9} x2="388" y2={r.y} stroke={r.color} className={styles.ray} />
          <circle cx="392" cy={r.y} r="5" fill={r.color} />
          <text x="406" y={r.y + 5} className={styles.prismLabel}>{r.label}</text>
        </g>
      ))}

      <g className={styles.untouched}>
        <circle cx="392" cy="256" r="5" />
        <text x="406" y="261" className={styles.prismLabel}>{'<Header />'}</text>
        <text x="406" y="282" className={styles.prismNote}>doesn’t read count</text>
      </g>

      <path d="M230 40 160 240h140L230 40Z" className={styles.prismBody} />
      <text x="230" y="222" textAnchor="middle" className={styles.prismName}>count</text>
    </svg>
  );
}

const CONCEPTS: {id: string; name: string; summary: string; link: string; code: string}[] = [
  {
    id: 'refractions',
    name: 'Refractions',
    summary: 'Reactive state. Read it with .value and change it with .set().',
    link: '/docs/concepts/refractions',
    code: `import { useRefraction, derive } from "refract";

export const cart = useRefraction([]);
export const count = derive(() => cart.value.length);

cart.update((items) => [...items, { id: 1, name: "Lamp" }]);
count.value; // 1`,
  },
  {
    id: 'lenses',
    name: 'Lenses',
    summary: 'The object a component uses to create its state and effects.',
    link: '/docs/concepts/lenses',
    code: `const TodoList = createComponent(({ lens }) => {
  const todos = lens.useRefraction([]);

  lens.useEffect(() => {
    fetchTodos().then(todos.set);
  }, []);

  return <ul>{todos.value.map((t) => <li key={t.id}>{t.title}</li>)}</ul>;
});`,
  },
  {
    id: 'optics',
    name: 'Optics',
    summary: 'Functions that package state and effects so components can share them.',
    link: '/docs/concepts/optics',
    code: `export function useMousePosition() {
  const pos = useRefraction({ x: 0, y: 0 });

  useOptic(() => {
    const onMove = (e) => pos.set({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return pos;
}`,
  },
  {
    id: 'effects',
    name: 'Effects',
    summary: 'Code that runs after rendering, such as fetching data or starting a timer.',
    link: '/docs/concepts/side-effects',
    code: `lens.useFlash(() => input.value.focus()); // once, before paint

lens.useEffect(() => {                       // after paint
  const id = setInterval(() => now.set(new Date()), 1000);
  return () => clearInterval(id);
}, []);`,
  },
];

function ConceptTabs() {
  const [active, setActive] = useState(CONCEPTS[0].id);
  const concept = CONCEPTS.find((c) => c.id === active)!;
  const move = (delta: number) => {
    const i = CONCEPTS.findIndex((x) => x.id === active);
    const target = CONCEPTS[(i + delta + CONCEPTS.length) % CONCEPTS.length];
    setActive(target.id);
    document.getElementById(`tab-${target.id}`)?.focus();
  };
  return (
    <section className={styles.concepts} aria-labelledby="concepts-title">
      <div className={styles.conceptsIntro}>
        <h2 id="concepts-title">Core concepts</h2>
        <p>Most of the API builds on these four ideas.</p>
      </div>
      <div className={styles.conceptsBody}>
        <div role="tablist" aria-label="Core concepts" aria-orientation="vertical" className={styles.tablist}>
          {CONCEPTS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={c.id === active}
              aria-controls={`panel-${c.id}`}
              tabIndex={c.id === active ? 0 : -1}
              onClick={() => setActive(c.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); move(1); }
                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
              }}>
              <span className={styles.tabName}>{c.name}</span>
              <span className={styles.tabSummary}>{c.summary}</span>
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${concept.id}`} aria-labelledby={`tab-${concept.id}`} className={styles.tabPanel}>
          <CodeBlock language="jsx">{concept.code}</CodeBlock>
          <Link to={concept.link} className={styles.panelLink}>
            Read about {concept.name.toLowerCase()}
          </Link>
        </div>
      </div>
    </section>
  );
}

const PATH = [
  {title: 'Install Refract', text: 'Create a new app, or add Refract to an existing Vite project.', to: '/docs/getting-started/installation'},
  {title: 'Follow the quick start', text: 'Build a small app and learn about state, props and effects. It takes about ten minutes.', to: '/docs/getting-started/quick-start'},
  {title: 'Read the core concepts', text: 'How components, refractions, lenses and optics work together.', to: '/docs/concepts/components'},
  {title: 'Use the API reference', text: 'Every export, with its parameters, return value and examples.', to: '/docs/api'},
];

function InstallCommand() {
  const cmd = 'npm create refract@latest my-app';
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.install}>
      <code>
        <span aria-hidden="true" className={styles.dollar}>$ </span>
        {cmd}
      </code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(cmd);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="Documentation for Refract, a JavaScript framework for building user interfaces.">
      <main className={styles.home}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <h1>Refract documentation</h1>
            <p className={styles.lede}>
              Refract is a JavaScript framework for building user interfaces. Components are plain
              functions, and state lives in refractions. When a refraction changes, Refract re-renders
              the components that use it and nothing else.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/docs/getting-started/quick-start">
                Quick start
              </Link>
              <Link className={styles.secondary} to="/docs">
                Read the introduction
              </Link>
            </div>
            <InstallCommand />
          </div>
          <PrismDiagram />
        </header>

        <ConceptTabs />

        <section className={styles.path} aria-labelledby="path-title">
          <h2 id="path-title">Where to start</h2>
          <ol>
            {PATH.map((step) => (
              <li key={step.title}>
                <Link to={step.to}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepText}>{step.text}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.ask}>
          <div>
            <h2>Ask a question</h2>
            <p>
              The docs assistant searches these pages and answers with the matching section, an
              example, and links to where it found them.
            </p>
          </div>
          <button
            type="button"
            className="button button--primary button--lg"
            onClick={() => window.dispatchEvent(new CustomEvent('refract:open-assistant'))}>
            Open the assistant
          </button>
        </section>
      </main>
    </Layout>
  );
}
