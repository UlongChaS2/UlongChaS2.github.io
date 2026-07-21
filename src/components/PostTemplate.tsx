import * as React from 'react';
import { Link } from 'gatsby';
import { GatsbyImage, IGatsbyImageData, getImage } from 'gatsby-plugin-image';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import TableOfContents from 'src/components/TableOfContents';
import Comments from 'src/components/Comments';
import {
  PostContainer,
  PostHeader,
  PostHeaderContent,
  PostCategoryBadge,
  FeaturedImage,
  PostTitle,
  PostMeta,
  PostLayout,
  PostContentWrapper,
  PostContent,
  PostNavigation,
  NavLink,
} from 'src/styles/PostStyles';

// ============================================================
// PostTemplate — study / project 상세 공통 뼈대
// ============================================================

export interface AdjacentPost {
  title: string;
  path: string;
}

interface PostTemplateProps {
  title: string;
  category: string;
  date: string;
  timeToRead: number;
  html: string;
  featuredImage?: IGatsbyImageData | null;
  previous?: AdjacentPost | null;
  next?: AdjacentPost | null;
}

const PostTemplate: React.FC<PostTemplateProps> = ({
  title,
  category,
  date,
  timeToRead,
  html,
  featuredImage,
  previous,
  next,
}) => {
  const image = featuredImage ? getImage(featuredImage) : null;

  return (
    <>
      <GlobalStyles />
      <Layout>
        <PostContainer>
          <PostHeader>
            <PostHeaderContent>
              <PostCategoryBadge>{category}</PostCategoryBadge>
              <PostTitle>{title}</PostTitle>
              <PostMeta>
                <span className="author">정유정</span>
                <span className="dot" />
                <time>{date}</time>
                <span className="dot" />
                <span>{timeToRead || 5}분이면 읽어요</span>
              </PostMeta>
            </PostHeaderContent>

            {image && (
              <FeaturedImage>
                <GatsbyImage image={image} alt={title} />
              </FeaturedImage>
            )}
          </PostHeader>

          <PostLayout>
            <PostContentWrapper>
              <PostContent className="post-content" dangerouslySetInnerHTML={{ __html: html }} />

              {(previous || next) && (
                <PostNavigation>
                  {previous && (
                    <Link to={previous.path} style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>
                      <NavLink as="div" className="prev">
                        <span className="label">이전 글</span>
                        <span className="title">{previous.title}</span>
                      </NavLink>
                    </Link>
                  )}
                  {next && (
                    <Link to={next.path} style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>
                      <NavLink as="div" className="next">
                        <span className="label">다음 글</span>
                        <span className="title">{next.title}</span>
                      </NavLink>
                    </Link>
                  )}
                </PostNavigation>
              )}
            </PostContentWrapper>

            <TableOfContents html={html} />
          </PostLayout>

          <Comments />
        </PostContainer>
      </Layout>
    </>
  );
};

export default PostTemplate;
