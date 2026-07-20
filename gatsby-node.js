const { createFilePath } = require(`gatsby-source-filesystem`); // 슬러그 생성 함수
const path = require('path');

/**
 * frontmatter 스키마를 명시한다.
 * thumbnail / keywords는 선택 필드라서, 아무 글도 쓰지 않으면
 * Gatsby가 타입을 추론하지 못해 쿼리가 통째로 실패한다.
 */
exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter
    }
    type MarkdownRemarkFrontmatter {
      title: String
      date: Date @dateformat
      category: String
      keywords: [String]
      thumbnail: File @fileByRelativePath
      featuredImage: File @fileByRelativePath
    }
  `);
};

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
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
        nodes {
          fields {
            slug
            category
          }
          frontmatter {
            title
            date
          }
        }
      }
    }
  `);

  const nodes = result.data.allMarkdownRemark.nodes;
  const currentYear = new Date().getFullYear();

  // 이전/다음 글은 같은 카테고리 안에서만 이어준다.
  // 스터디 글을 읽다가 프로젝트 글로 넘어가면 맥락이 끊긴다.
  const byCategory = nodes.reduce((acc, node) => {
    const category = node.fields.category;
    (acc[category] = acc[category] || []).push(node);
    return acc;
  }, {});

  const templates = { study: studyTemplate, project: projectTemplate };

  Object.entries(byCategory).forEach(([category, categoryNodes]) => {
    const component = templates[category];
    if (!component) return;

    categoryNodes.forEach((node, index) => {
      const postDate = new Date(node.frontmatter.date);
      const isOldPost = postDate.getFullYear() < currentYear - 1; // 1년 이상 지난 글은 DSG 적용

      // 목록은 최신순이므로 index가 클수록 과거 글이다.
      const newer = categoryNodes[index - 1];
      const older = categoryNodes[index + 1];

      const toLink = (target) =>
        target ? { title: target.frontmatter.title, path: `/${category}${target.fields.slug}` } : null;

      createPage({
        path: `/${category}${node.fields.slug}`,
        component,
        context: {
          slug: node.fields.slug,
          previous: toLink(older),
          next: toLink(newer),
        },
        defer: isOldPost, // ✅ 1년 이상 지난 글만 DSG 적용
      });
    });
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
