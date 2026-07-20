import * as React from 'react';
import styled from '@emotion/styled';

// ============================================================
// TableOfContents — Emotion 기반 (CSS var() 토큰 사용)
// Stitch MCP 디자인 참조: Dev.log Table of Contents Sidebar
// ============================================================

const TOCWrapper = styled.div`
  @media (min-width: 1024px) {
    position: sticky;
    top: 128px;
    align-self: flex-start;
  }
`;

/**
 * 카드 자체는 스크롤하지 않는다.
 * 컨테이너가 스크롤하면 스크롤바가 패딩 영역까지 훑고 지나가서
 * 항목이 카드 모서리에 붙어 잘린 것처럼 보인다.
 * 높이만 여기서 제한하고 실제 스크롤은 TOCList가 맡는다.
 */
const TOCContainer = styled.aside<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* 모바일: 슬라이드 인 패널 */
  @media (max-width: 1023px) {
    position: fixed;
    right: ${(props) => (props.isOpen ? '0' : '-300px')};
    top: 100px;
    width: 280px;
    max-height: calc(100vh - 120px);
    padding: var(--space-6);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    transition: right var(--transition-base);
    z-index: var(--z-sticky);
    box-shadow: var(--shadow-lg);
  }

  /* 데스크톱: 우측 고정 카드 (Sticky는 TOCWrapper에서 처리) */
  @media (min-width: 1024px) {
    width: 240px;
    max-height: calc(100vh - 200px);
    padding: var(--space-6);
    border: none;
    background: var(--color-bg-subtle);
    box-shadow: none;
    border-radius: 18px;
  }
`;

const TOCTitle = styled.h3`
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-3) 0;
  padding-bottom: var(--space-2);
  letter-spacing: 0.04em;

  /* 모바일에서만 구분선 표시 */
  @media (max-width: 1023px) {
    border-bottom: 2px solid var(--color-border-default);
  }
`;

const TOCList = styled.ul`
  list-style: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  /* 목차가 길면 여기서만 스크롤한다. min-height:0이 없으면
     flex 항목이 내용만큼 늘어나서 스크롤이 아예 걸리지 않는다. */
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* 스크롤바가 항목 글자에 닿지 않도록 오른쪽에 자리를 비워둔다 */
  padding: 0 var(--space-2) 0 0;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border-strong);
    border-radius: var(--radius-full);

    &:hover {
      background: var(--color-text-tertiary);
    }
  }
`;

const TOCItem = styled.li<{ level: number; isActive: boolean }>`
  margin-left: ${(props) => (props.level - 1) * 12}px;

  a {
    display: block;
    padding: var(--space-1) var(--space-2);
    padding-left: ${(props) => (props.level > 2 ? 'var(--space-4)' : 'var(--space-2)')};
    color: ${(props) => (props.isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)')};
    text-decoration: none;
    font-size: var(--fs-body-sm);
    font-weight: ${(props) => (props.isActive ? 'var(--fw-medium)' : 'var(--fw-normal)')};
    border-left: 2px solid
      ${(props) => (props.isActive ? 'var(--color-brand-primary)' : 'transparent')};
    background-color: ${(props) => (props.isActive ? 'var(--color-brand-subtle)' : 'transparent')};
    transition: all var(--transition-fast);
    line-height: var(--lh-normal);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;

    &:hover {
      color: var(--color-brand-primary);
      background-color: var(--color-interactive-hover);
      border-left-color: var(--color-brand-primary);
    }
  }
`;

const TOCToggleButton = styled.button<{ isOpen: boolean }>`
  position: fixed;
  right: 20px;
  bottom: 20px;
  top: auto;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-brand-primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-title-md);
  box-shadow: var(--shadow-lg);
  z-index: calc(var(--z-sticky) + 1);
  transition: all var(--transition-base);

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-card-hover);
  }

  &:active {
    transform: scale(0.95);
  }

  /* 데스크톱에서 숨김 */
  @media (min-width: 1024px) {
    display: none;
  }
`;

// 데스크톱에서 오버레이 닫기용 배경
const Backdrop = styled.div<{ isOpen: boolean }>`
  display: none;

  @media (max-width: 1023px) {
    display: ${(props) => (props.isOpen ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: calc(var(--z-sticky) - 1);
  }
`;

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  html: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ html }) => {
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [activeId, setActiveId] = React.useState<string>('');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4');

    const extractedHeadings: Heading[] = [];
    headingElements.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      let id = heading.id;

      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^a-z0-9가-힣]+/g, '-')
          .replace(/^-|-$/g, '');
        heading.id = id;
      }

      extractedHeadings.push({ id, text, level });
    });

    setHeadings(extractedHeadings);

    setTimeout(() => {
      const contentHeadings = document.querySelectorAll(
        '.post-content h1, .post-content h2, .post-content h3, .post-content h4',
      );
      contentHeadings.forEach((heading, index) => {
        if (extractedHeadings[index]) {
          heading.id = extractedHeadings[index].id;
        }
      });
    }, 100);
  }, [html]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // 가장 위쪽에 보이는 항목을 active로
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: 0,
      },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <TOCWrapper>
      <TOCToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} aria-label="목차 토글">
        {isOpen ? '✕' : '📑'}
      </TOCToggleButton>

      <Backdrop isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <TOCContainer isOpen={isOpen}>
        <TOCTitle>목차</TOCTitle>
        <TOCList>
          {headings.map((heading) => (
            <TOCItem key={heading.id} level={heading.level} isActive={activeId === heading.id}>
              <a href={`#${heading.id}`} onClick={(e) => handleClick(e, heading.id)}>
                {heading.text}
              </a>
            </TOCItem>
          ))}
        </TOCList>
      </TOCContainer>
    </TOCWrapper>
  );
};

export default TableOfContents;
