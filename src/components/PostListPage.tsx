import * as React from 'react';
import Layout from 'src/components/GlobalLayout';
import { IconChevronRight } from 'src/components/icons';
import { pickAccent, postLabel } from 'src/styles/accents';
import {
  PageWrapper,
  PageHeader,
  PageTitle,
  PageSubtitle,
  ChipRow,
  Chip,
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
//
// 상단 태그 칩으로 keywords 필터. 서버가 없는 정적 사이트라
// 클라이언트에서 거른다. 상세 글의 #태그를 누르면 /{category}/?tag=X
// 로 들어오는데, 그 쿼리를 초기 선택으로 반영한다.
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

/** 목록 상단에 노출할 태그 최대 개수. 나머지는 상세 글에서만 접근한다. */
const MAX_CHIPS = 10;

const cleanKeywords = (post: ListPost): string[] =>
  (post.frontmatter.keywords ?? []).filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

const PostListPage: React.FC<PostListPageProps> = ({ title, subtitle, posts, emptyMessage }) => {
  const [selected, setSelected] = React.useState<string | null>(null);

  // 상세에서 태그를 누르고 넘어온 경우 URL의 ?tag= 를 초기 선택으로 반영.
  React.useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get('tag');
    if (tag) setSelected(tag);
  }, []);

  // 태그 빈도 집계 → 상위 것만 칩으로 노출.
  const topTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => cleanKeywords(p).forEach((k) => counts.set(k, (counts.get(k) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_CHIPS).map(([t]) => t);
  }, [posts]);

  const filtered = selected ? posts.filter((p) => cleanKeywords(p).includes(selected)) : posts;

  const choose = (tag: string | null) => {
    setSelected(tag);
    // URL도 함께 갱신해 두면 새로고침·공유에도 필터가 유지된다.
    const path = window.location.pathname;
    window.history.replaceState(null, '', tag ? `${path}?tag=${encodeURIComponent(tag)}` : path);
  };

  // 선택된 태그가 상위 목록 밖이면(상세에서 넘어온 희귀 태그) 칩을 하나 덧붙인다.
  const chips = selected && !topTags.includes(selected) ? [selected, ...topTags] : topTags;

  return (
    <Layout>
      <PageWrapper>
        <PageHeader>
          <PageTitle>{title}</PageTitle>
          <PageSubtitle>
            {subtitle} 총 {posts.length}개.
          </PageSubtitle>
        </PageHeader>

        {topTags.length > 0 && (
          <ChipRow>
            <Chip type="button" selected={!selected} onClick={() => choose(null)}>
              전체
            </Chip>
            {chips.map((tag) => (
              <Chip key={tag} type="button" selected={selected === tag} onClick={() => choose(tag)}>
                {tag}
              </Chip>
            ))}
          </ChipRow>
        )}

        {filtered.length > 0 ? (
          <PostList>
            {filtered.map((post) => (
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
            <p>{selected ? `'${selected}' 태그의 글이 아직 없어요.` : emptyMessage}</p>
          </EmptyState>
        )}
      </PageWrapper>
    </Layout>
  );
};

export default PostListPage;
