const path = require("path");

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  // 1. DSG 페이지 생성
  createPage({
    path: "/using-dsg",
    component: require.resolve("./src/templates/using-dsg.js"),
    context: {},
    defer: true, // Deferred Static Generation 설정
  });

  // 2. 마크다운 파일 기반 페이지 생성
  const blogPostTemplate = path.resolve(`src/templates/markdown-template.js`);

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw new Error(result.errors);
  }

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path, // 마크다운 파일의 경로를 기반으로 페이지 생성
      component: blogPostTemplate, // 마크다운 템플릿 파일 사용
      context: {
        path: node.frontmatter.path,
      },
    });
  });
};
