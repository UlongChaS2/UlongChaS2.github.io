import * as React from 'react';
import styled from '@emotion/styled';
import Layout from '../components/GlobalLayout';
import PostThumbnail from 'src/components/PostThumbnail';
import { THUMB_REGISTRY } from 'src/components/thumbs';
import { pickAccent, pickVariant } from 'src/styles/accents';

// ============================================================
// /thumbs — 썸네일 일러스트 전수 점검용 갤러리 (비공개 유틸 페이지)
// 새 그림을 추가하거나 손볼 때 여기서 한눈에 확인한다.
// 어디에도 링크하지 않고 noindex를 건다.
// ============================================================

const Grid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-6) var(--space-20);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
`;

const Cell = styled.div`
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
`;

const CellName = styled.div`
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--fs-caption);
  color: var(--color-text-tertiary);
`;

const ThumbsPage = () => (
  <Layout>
    <Grid>
      {Object.keys(THUMB_REGISTRY).map((slug) => (
        <Cell key={slug} style={pickAccent(`/${slug}/`)}>
          <PostThumbnail
            slug={slug}
            variant={pickVariant(null, null, slug, slug)}
            label={slug.split('-')[0]}
          />
          <CellName>{slug}</CellName>
        </Cell>
      ))}
    </Grid>
  </Layout>
);

export const Head = () => (
  <>
    <title>thumbs preview</title>
    <meta name="robots" content="noindex" />
  </>
);

export default ThumbsPage;
