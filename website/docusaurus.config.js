// @ts-check
const {themes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Comms Platform',
  tagline: 'Deliver communications across every channel with a unified API',
  favicon: 'img/favicon.ico',
  url: 'https://docs.comms.example.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: [
    'docusaurus-theme-openapi-docs',
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: 'docs',
          docItemComponent: '@theme/ApiItem',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'default',
        config: {
          commsApi: {
            specPath: 'examples/comms-api.yaml',
            outputDir: 'docs/rest-apis',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Comms Platform',
        style: 'dark',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/your-org/comms-platform',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Getting Started', to: '/docs/getting-started/quick-start' },
              { label: 'REST API', to: '/docs/rest-apis' },
              { label: 'Kafka Events', to: '/docs/events-kafka' },
              { label: 'File Integrations', to: '/docs/file-transfers' },
            ],
          },
          {
            title: 'Channels',
            items: [
              { label: 'Email', to: '/docs/getting-started/concepts#email' },
              { label: 'SMS', to: '/docs/getting-started/concepts#sms' },
              { label: 'Push', to: '/docs/getting-started/concepts#push' },
              { label: 'Documents', to: '/docs/getting-started/concepts#documents' },
            ],
          },
          {
            title: 'Support',
            items: [
              { label: 'GitHub Issues', href: 'https://github.com/your-org/comms-platform/issues' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Comms Platform. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'java', 'python', 'csharp', 'kotlin'],
      },
    }),
};

module.exports = config;
