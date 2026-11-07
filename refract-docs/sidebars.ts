import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  learn: [
    'index',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/project-structure',
        'getting-started/typescript',
      ],
    },
    {
      type: 'category',
      label: 'Core concepts',
      collapsed: false,
      items: [
        'concepts/components',
        'concepts/refractions',
        'concepts/lenses',
        'concepts/optics',
        'concepts/side-effects',
        'concepts/reactivity-model',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        'resources/faq',
        'resources/troubleshooting',
        'resources/get-help',
        'resources/glossary',
        'resources/contributing',
        'resources/changelog',
      ],
    },
  ],
  guides: [
    'guides/index',
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: false,
      items: ['guides/counter-app', 'guides/todo-list', 'guides/global-theme'],
    },
    {
      type: 'category',
      label: 'How-to guides',
      collapsed: false,
      items: [
        'guides/animations',
        'guides/streams',
        'guides/testing',
        'guides/migrating-from-react',
      ],
    },
  ],
  api: [
    'api/index',
    {
      type: 'category',
      label: 'Application',
      collapsed: false,
      items: ['api/create-app', 'api/create-component', 'api/lens'],
    },
    {
      type: 'category',
      label: 'State',
      collapsed: false,
      items: ['api/use-refraction', 'api/derive', 'api/batch', 'api/from-stream'],
    },
    {
      type: 'category',
      label: 'Effects and optics',
      collapsed: false,
      items: ['api/use-effect', 'api/use-optic', 'api/use-flash', 'api/use-transition'],
    },
    {
      type: 'category',
      label: 'Tooling',
      collapsed: false,
      items: ['api/config', 'api/cli'],
    },
  ],
};

export default sidebars;
