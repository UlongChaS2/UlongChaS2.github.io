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
    title: `UlongChaS2.log`,
    description: `개발 공부와 프로젝트를 기록하는 블로그`,
    author: `@ulongchas2`,
    siteUrl: `https://ulongchas2.github.io/`,
  },
  trailingSlash: 'always',
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-emotion`,
    {
      // 모든 글이 한 줄 요약 인용구로 시작한다. 구분자를 그 뒤에 두면
      // 카드에 쓰이는 excerpt가 딱 그 요약문이 된다. 구분자가 없으면
      // excerpt는 본문을 평문으로 눌러서 헤딩("개요")까지 문장에 섞는다.
      resolve: `gatsby-transformer-remark`,
      options: {
        excerpt_separator: `<!--more-->`,
        // 코드 블록 구문 하이라이팅. Prism 기본 테마 CSS는 import하지 않고
        // .token.* 색을 tokens.css 변수로 직접 매핑한다(PostStyles.ts).
        plugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              // 인라인 코드(`foo`)는 기존 브랜드 뱃지 스타일을 그대로 쓴다.
              // 켜두면 prism이 language-text 클래스를 덧붙여 스타일이 흔들린다.
              noInlineHighlight: true,
            },
          },
        ],
      },
    },
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
        name: `UlongChaS2.log`,
        short_name: `UlongChaS2.log`,
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
