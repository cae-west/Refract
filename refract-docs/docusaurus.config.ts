import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// The site URL and base path are read from the environment so the same config
// works on GitHub Pages (https://<user>.github.io/Refract/) and on Netlify or
// Vercel (served from the domain root). See README.md → "Deploy".
const siteUrl = process.env.SITE_URL ?? 'https://refract-docs.netlify.app';
const baseUrl = process.env.BASE_URL ?? '/';
const repoUrl =
  process.env.REPO_URL ??
  'https://github.com/Technical-writing-mentorship-program/Refract';

const config: Config = {
  title: 'Refract',
  tagline:
    'A reactive, composable JavaScript framework for building user interfaces with clarity.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl,
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    mermaid: true,
    hooks: {onBrokenMarkdownLinks: 'throw'},
  },

  i18n: {defaultLocale: 'en', locales: ['en']},

  headTags: [
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,650;12..96,750&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap',
      },
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `${repoUrl}/edit/main/refract-docs/`,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  plugins: ['./plugins/docs-assistant-index'],

  customFields: {
    // Optional: URL of a serverless function that turns retrieved doc sections
    // into a written answer with an LLM. Leave unset to answer from the docs
    // directly (no API key or server needed). See README.md.
    assistantEndpoint: process.env.ASSISTANT_ENDPOINT ?? '',
  },

  themeConfig: {
    image: 'img/refract-social.png',
    colorMode: {respectPrefersColorScheme: true},
    docs: {sidebar: {hideable: true, autoCollapseCategories: true}},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
    announcementBar: {
      id: 'release-1-4',
      content:
        `Refract 1.4 is out, with stream-backed refractions and persistent state. <a href="${baseUrl}docs/resources/changelog">See what’s new</a>.`,
      isCloseable: true,
    },
    navbar: {
      title: 'Refract',
      logo: {alt: 'Refract prism logo', src: 'img/logo.svg', srcDark: 'img/logo-dark.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'learn', position: 'left', label: 'Learn'},
        {type: 'docSidebar', sidebarId: 'api', position: 'left', label: 'API reference'},
        {type: 'docSidebar', sidebarId: 'guides', position: 'left', label: 'Guides'},
        {to: '/docs/resources/faq', label: 'FAQ', position: 'left'},
        {type: 'html', position: 'right', value: '<span class="navbar-version">v1.4</span>'},
        {href: repoUrl, position: 'right', className: 'header-github-link', 'aria-label': 'GitHub repository'},
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Introduction', to: '/docs'},
            {label: 'Quick start', to: '/docs/getting-started/quick-start'},
            {label: 'Core concepts', to: '/docs/concepts/components'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'API reference', to: '/docs/api'},
            {label: 'Configuration', to: '/docs/api/config'},
            {label: 'Glossary', to: '/docs/resources/glossary'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Contributing', to: '/docs/resources/contributing'},
            {label: 'GitHub', href: repoUrl},
            {label: 'Changelog', to: '/docs/resources/changelog'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Refract. Documentation released under the Apache 2.0 license.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash', 'json', 'diff'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
