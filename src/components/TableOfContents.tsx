import * as React from 'react';
import styled from '@emotion/styled';
import { theme } from 'src/styles/theme';

const TOCContainer = styled.aside<{ isOpen: boolean }>`
  position: fixed;
  right: ${(props) => (props.isOpen ? '0' : '-300px')};
  top: 100px;
  width: 280px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: ${theme.spacing.lg};
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: ${theme.borderRadius.lg};
  transition: right ${theme.transition.base};
  z-index: 50;
  box-shadow: ${theme.shadow.lg};

  /* 태블릿 미만: 모바일 */
  @media (max-width: calc(${theme.breakpoints.desktop} - 1px)) {
    box-shadow: ${theme.shadow.xl};
  }

  /* 데스크톱 이상: 우측에 고정 */
  @media (min-width: ${theme.breakpoints.desktop}) {
    right: 20px;
    box-shadow: ${theme.shadow.md};
  }

  /* 화면이 충분히 넓을 때: 컨텐츠 옆에 위치 */
  @media (min-width: 1600px) {
    right: calc((100vw - 1200px) / 2 - 100px);
  }

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: ${theme.borderRadius.full};

    &:hover {
      background: var(--color-text-tertiary);
    }
  }
`;

const TOCTitle = styled.h3`
  font-size: ${theme.fontSize.base};
  font-weight: ${theme.fontWeight.bold};
  color: var(--color-text-primary);
  margin: 0 0 ${theme.spacing.md} 0;
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid var(--color-border);
`;

const TOCList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TOCItem = styled.li<{ level: number; isActive: boolean }>`
  margin-left: ${(props) => (props.level - 1) * 12}px;
  margin-bottom: ${theme.spacing.xs};

  a {
    display: block;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    color: ${(props) => (props.isActive ? theme.colors.primary : 'var(--color-text-secondary)')};
    text-decoration: none;
    font-size: ${theme.fontSize.sm};
    border-left: 2px solid ${(props) => (props.isActive ? theme.colors.primary : 'transparent')};
    transition: all ${theme.transition.fast};
    line-height: 1.4;

    &:hover {
      color: ${theme.colors.primary};
      background-color: var(--color-hover);
      border-left-color: ${theme.colors.primary};
    }
  }
`;

const TOCToggleButton = styled.button<{ isOpen: boolean }>`
  position: fixed;
  right: 20px;
  top: 100px;
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSize.xl};
  box-shadow: ${theme.shadow.lg};
  z-index: 51;
  transition: all ${theme.transition.base};

  &:hover {
    transform: scale(1.1);
    box-shadow: ${theme.shadow.xl};
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
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
    // HTML에서 heading 추출
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const extractedHeadings: Heading[] = [];
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      let id = heading.id;

      // ID가 없으면 생성
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

    // 실제 DOM에도 ID 추가
    setTimeout(() => {
      const contentHeadings = document.querySelectorAll(
        '.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6',
      );
      contentHeadings.forEach((heading, index) => {
        if (extractedHeadings[index]) {
          heading.id = extractedHeadings[index].id;
        }
      });
    }, 100);
  }, [html]);

  React.useEffect(() => {
    // 스크롤 시 활성 섹션 추적
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: 0,
      },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // 헤더 높이만큼 오프셋
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setIsOpen(false); // 모바일에서 클릭 후 닫기
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      <TOCToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} aria-label="목차 토글">
        {isOpen ? '✕' : '📑'}
      </TOCToggleButton>

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
    </>
  );
};

export default TableOfContents;
