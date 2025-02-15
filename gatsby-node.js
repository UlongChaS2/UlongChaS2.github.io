const { createFilePath } = require(`gatsby-source-filesystem`); // 슬러그 생성 함수
const path = require('path');

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark` || node.internal.type === `Mdx`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });

    // 부모 노드 확인 후 category 필드 추가
    const parentNode = getNode(node.parent);
    if (parentNode && parentNode.sourceInstanceName) {
      createNodeField({
        node,
        name: 'category',
        value: parentNode.sourceInstanceName, // "study" 또는 "project"
      });
    } else {
      console.warn(`🚨 [gatsby-node] 부모 노드가 없거나 sourceInstanceName이 없습니다: ${node.id}`);
    }
  }
};

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const studyTemplate = path.resolve(`src/templates/study-template.tsx`);
  const projectTemplate = path.resolve(`src/templates/project-template.tsx`);

  const result = await graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
              category
            }
            frontmatter {
              date
            }
          }
        }
      }
    }
  `);

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const postDate = new Date(node.frontmatter.date);
    const currentYear = new Date().getFullYear();
    const isOldPost = postDate.getFullYear() < currentYear - 1; // 1년 이상 지난 글은 DSG 적용

    if (node.fields.category === 'study') {
      createPage({
        path: `/study${node.fields.slug}`,
        component: studyTemplate,
        context: {
          slug: node.fields.slug,
        },
        defer: isOldPost, // ✅ 1년 이상 지난 글만 DSG 적용
      });
    } else if (node.fields.category === 'project') {
      createPage({
        path: `/project${node.fields.slug}`,
        component: projectTemplate,
        context: {
          slug: node.fields.slug,
        },
        defer: isOldPost, // ✅ 1년 이상 지난 글만 DSG 적용
      });
    }
  });
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
      },
    },
  });
};
