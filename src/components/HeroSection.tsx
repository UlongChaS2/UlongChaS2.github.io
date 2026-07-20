import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { motion } from 'framer-motion';
import { currentYearTheme } from 'src/themes/years/2026';

// ============================================================
// HeroSection — Paper artboard SN-0 (desktop) / TA-0 (mobile)
// ============================================================

const HeroWrapper = styled.section`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg);
  overflow: hidden;
  isolation: isolate;
`;

const YearBackdrop = styled(motion.div)`
  position: absolute;
  left: -2vw;
  bottom: -4vw;
  z-index: 0;
  font-family: var(--font-base);
  font-size: var(--fs-hero);
  font-weight: var(--fw-black);
  line-height: 0.85;
  letter-spacing: -0.06em;
  color: var(--color-text-primary);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
`;

const Decor = styled.div`
  position: absolute;
  top: 6vh;
  right: 4vw;
  width: clamp(280px, 32vw, 480px);
  height: clamp(280px, 32vw, 480px);
  z-index: 0;
  pointer-events: none;

  @media (max-width: 767px) {
    top: auto;
    bottom: 8vh;
    right: -8vw;
    width: 260px;
    height: 260px;
  }
`;

const DecorBlob = styled.div`
  position: absolute;
  right: 0;
  top: 8%;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: var(--color-accent-muted);
`;

const DecorCircle = styled.div`
  position: absolute;
  left: 6%;
  top: 0;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: var(--color-sage);
`;

const DecorHalf = styled.div`
  position: absolute;
  left: 0;
  top: 24%;
  width: 38%;
  height: 19%;
  background: var(--color-accent-warm);
  border-radius: 200px 200px 0 0;
  transform: rotate(-90deg);
  transform-origin: center;
`;

const DecorRing = styled.div`
  position: absolute;
  right: 8%;
  bottom: 4%;
  width: 28%;
  height: 28%;
  border-radius: 50%;
  border: 2px solid var(--color-accent);
`;

const DecorDot = styled.div`
  position: absolute;
  right: 22%;
  top: 38%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent);
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(120px, 18vh, 200px) var(--space-6) var(--space-20);
  display: grid;
  grid-template-columns: minmax(260px, 360px) 1fr;
  gap: var(--space-12);
  align-items: center;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-8);
    padding: 140px var(--space-6) var(--space-20);
  }
`;

const CharacterCard = styled(motion.div)`
  width: 280px;
  height: 360px;
  background: var(--color-accent-muted);
  border: 2px solid var(--color-accent);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;

  @media (max-width: 767px) {
    width: 220px;
    height: 280px;
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const CopyLine1 = styled(motion.p)`
  font-size: var(--fs-title);
  color: var(--color-text-secondary);
  letter-spacing: -0.02em;
  margin: 0;
`;

const CopyLine2 = styled(motion.h1)`
  font-size: var(--fs-hero-sub);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  letter-spacing: -0.03em;
  line-height: 1.3;
  margin: 0;
  word-break: keep-all;
`;

const CtaRow = styled(motion.div)`
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
  flex-wrap: wrap;
`;

const baseCta = `
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 14px 24px;
  border-radius: var(--radius-full);
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: transform var(--transition-fast), background var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    transform: translateY(-1px);
  }
`;

const PrimaryCta = styled(Link)`
  ${baseCta};
  background: var(--color-accent);
  color: #FFFFFF;
  border: 2px solid var(--color-accent);

  &:hover {
    background: var(--color-accent-warm);
    border-color: var(--color-accent-warm);
  }
`;

const SecondaryCta = styled(Link)`
  ${baseCta};
  background: transparent;
  color: var(--color-accent);
  border: 2px solid var(--color-accent);

  &:hover {
    background: var(--color-accent-muted);
  }
`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const HeroSection: React.FC = () => {
  return (
    <HeroWrapper aria-label="Hero">
      <YearBackdrop
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {currentYearTheme.year}
      </YearBackdrop>

      <Decor aria-hidden>
        <DecorBlob />
        <DecorCircle />
        <DecorHalf />
        <DecorRing />
        <DecorDot />
      </Decor>

      <Content>
        <CharacterCard
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          aria-hidden
        >
          character
        </CharacterCard>

        <Copy>
          <CopyLine1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            따뜻하게, 실험적으로 —
          </CopyLine1>
          <CopyLine2
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {currentYearTheme.year}년의 나. 이것저것 만들고, 기록합니다.
          </CopyLine2>

          <CtaRow
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <PrimaryCta to="/study/">Study 보기 →</PrimaryCta>
            <SecondaryCta to="/project/">Project 보기 →</SecondaryCta>
          </CtaRow>
        </Copy>
      </Content>
    </HeroWrapper>
  );
};

export default HeroSection;
