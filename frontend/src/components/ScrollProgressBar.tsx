'use client';

import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    const calculateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollProgress(Math.min(100, Math.max(0, progress)));
          setShowBackToTop(scrollTop > 240);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', calculateScroll, { passive: true });
    calculateScroll();

    return () => window.removeEventListener('scroll', calculateScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Dynamic Scroll Progress Bar Fixed to Top Edge */}
      <div
        className="scroll-progress-bar-track"
        aria-hidden="true"
      >
        <div
          className="scroll-progress-bar-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Scroll to Top Pill / Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`scroll-to-top-btn ${showBackToTop ? 'visible' : ''}`}
        title="Scroll back to top"
        aria-label="Scroll to top"
      >
        <ChevronUp size={18} strokeWidth={2.5} />
        <span className="scroll-to-top-text">Top</span>
      </button>
    </>
  );
};
