import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Social2Game API',
  tagline: 'Documentation for iGaming operators',
  favicon: 'img/favicon.ico',
  url: 'https://docs.social2game.com',
  baseUrl: '/',
  organizationName: 'social2game',
  projectName: 'api-docs',
  onBrokenLinks: 'throw',
  i18n: { defaultLocale: 'es', locales: ['es'] },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: 'dark', respectPrefersColorScheme: true },
    navbar: {
      title: 'Social2Game',
      items: [
        { href: 'https://app.social2game.com', label: 'Back Office', position: 'right' },
        { href: 'https://app.social2game.com/signup', label: 'Empezar gratis', position: 'right' },
      ],
    },
    footer: {
      copyright: `© ${new Date().getFullYear()} Social2Game`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'python', 'javascript'],
    },
  },
};

export default config;
