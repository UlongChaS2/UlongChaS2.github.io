const { createFilePath } = require(`gatsby-source-filesystem`); // 슬러그 생성 함수
const path = require("path");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  
  // 마크다운 파일의 slug 필드를 생성
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });
    
    // 각 노드에 slug 필드 추가
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  // Deferred Static Generation 예시 페이지 생성
  createPage({
    path: "/using-dsg",
    component: require.resolve("./src/templates/using-dsg.js"),
    context: {},
    defer: true, // Deferred Static Generation 설정
  });

  // 마크다운 템플릿 설정
  const blogPostTemplate = path.resolve(`src/templates/markdown-template.js`);

  // GraphQL로 모든 마크다운 파일 정보 가져오기
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              date
            }
          }
        }
      }
    }
  `);

  // 오류 처리
  if (result.errors) {
    throw new Error(result.errors);
  }

  // 마크다운 파일마다 페이지 생성
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.fields.slug, // 생성된 slug를 경로로 사용
      component: blogPostTemplate,
      context: {
        slug: node.fields.slug, // 슬러그를 템플릿에 전달하여 사용
      },
    });
  });
};
