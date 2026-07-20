/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */

const wrapESMPlugin = (name) =>
  function wrapESM(opts) {
    return async (...args) => {
      const mod = await import(name);
      const plugin = mod.default(opts);
      return plugin(...args);
    };
  };

module.exports = {
  siteMetadata: {
    title: `Dev.log`,
    description: `개발 공부와 프로젝트를 기록하는 블로그`,
    author: `@ulongchas2`,
    siteUrl: `https://ulongchas2.github.io/`,
  },
  trailingSlash: 'always',
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-emotion`,
    `gatsby-transformer-remark`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `study`,
        path: `${__dirname}/src/contents/study/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `project`,
        path: `${__dirname}/src/contents/project/`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Dev.log`,
        short_name: `Dev.log`,
        start_url: `/`,
        background_color: `#FFFFFF`,
        theme_color: `#3182F6`,
        display: `minimal-ui`,
        // 모서리를 깎지 않은 정사각형을 넘긴다. iOS는 홈 화면에서 한 번 더
        // 깎기 때문에, 둥근 아이콘을 주면 모서리가 두 번 잘려 뭉개진다.
        icon: `src/images/icon.png`,
      },
    },
  ],
};
