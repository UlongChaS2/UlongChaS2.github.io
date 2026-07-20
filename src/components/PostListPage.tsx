import * as React from 'react';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import AboutCTA from 'src/components/AboutCTA';
import { IconChevronRight } from 'src/components/icons';
import { pickAccent, postLabel } from 'src/styles/accents';
import {
  PageWrapper,
  PageHeader,
  PageTitle,
  PageSubtitle,
  PostList,
  PostRowLink,
  RowThumb,
  RowBody,
  RowTitle,
  RowExcerpt,
  RowMeta,
  RowAction,
  EmptyState,
} from 'src/styles/PageStyles';

// ============================================================
// PostListPage — study / project 목록 공통 뼈대
// 카드 대신 행으로 쌓는다. 썸네일·화살표는 고정 폭 슬롯이라
// 글 길이가 달라도 세로 정렬이 흐트러지지 않는다.
// ============================================================

export interface ListPost {
  id: string;
  frontmatter: {
    title: string;
    date: string;
    category: string;
    keywords?: (string | null)[] | null;
  };
  excerpt: string;
  fields: { slug: string };
  timeToRead?: number | null;
}

interface PostListPageProps {
  title: string;
  subtitle: string;
  posts: ListPost[];
  emptyMessage: string;
}

const PostListPage: React.FC<PostListPageProps> = ({ title, subtitle, posts, emptyMessage }) => (
  <>
    <GlobalStyles />
    <Layout>
      <PageWrapper>
        <PageHeader>
          <PageTitle>{title}</PageTitle>
          <PageSubtitle>
            {subtitle} 총 {posts.length}개.
          </PageSubtitle>
        </PageHeader>

        {posts.length > 0 ? (
          <PostList>
            {posts.map((post) => (
              <PostRowLink
                key={post.id}
                to={`/${post.frontmatter.category}${post.fields.slug}`}
                style={pickAccent(post.fields.slug)}
              >
                <RowThumb>{postLabel(post.frontmatter.keywords, post.frontmatter.category)}</RowThumb>
                <RowBody>
                  <RowTitle>{post.frontmatter.title}</RowTitle>
                  <RowExcerpt>{post.excerpt}</RowExcerpt>
                  <RowMeta>
                    {post.frontmatter.date} · {post.timeToRead || 5}분
                  </RowMeta>
                </RowBody>
                <RowAction>
                  <IconChevronRight size={15} />
                </RowAction>
              </PostRowLink>
            ))}
          </PostList>
        ) : (
          <EmptyState>
            <p>{emptyMessage}</p>
          </EmptyState>
        )}
      </PageWrapper>

      <AboutCTA />
    </Layout>
  </>
);

export default PostListPage;
