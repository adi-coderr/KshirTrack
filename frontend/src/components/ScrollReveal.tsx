'use client';

import React, { useEffect, useRef, useState } from 'react';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'bidirectional';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'bidirectional',
  delay = 0,
  duration = 750,
  threshold = 0.05,
  className = '',
  as: Component = 'div',
  style,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down');
  const lastScrollY = useRef(0);

  // Track scroll direction continuously
  useEffect(() => {
    setIsClient(true);
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const curr = window.scrollY;
      if (curr > lastScrollY.current + 3) {
        setScrollDir('down');
      } else if (curr < lastScrollY.current - 3) {
        setScrollDir('up');
      }
      lastScrollY.current = curr;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver for bidirectional entrance when scrolling up or down
  useEffect(() => {
    if (!isClient) return;
    const node = ref.current;
    if (!node || typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          // Reset when scrolled outside the viewport so it can re-animate when scrolled back
          const rect = entry.boundingClientRect;
          if (rect.bottom < 0 || rect.top > window.innerHeight) {
            setIsInView(false);
          }
        }
      },
      {
        threshold: [0, threshold],
        rootMargin: '0px 0px -60px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isClient, threshold]);

  // Determine direction class based on scroll motion
  let dirClass = 'from-bottom';
  if (direction === 'bidirectional') {
    dirClass = scrollDir === 'down' ? 'from-bottom' : 'from-top';
  } else if (direction === 'down') {
    dirClass = 'from-top';
  } else if (direction === 'left') {
    dirClass = 'from-left';
  } else if (direction === 'right') {
    dirClass = 'from-right';
  }

  // Before hydration on client, render visible so SSR / initial paint is instantaneous
  const statusClass = !isClient
    ? 'reveal-visible'
    : isInView
    ? 'reveal-visible'
    : `reveal-hidden ${dirClass}`;

  const combinedClassName = [
    'scroll-reveal-container',
    statusClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dynamicStyles: React.CSSProperties = {
    ...style,
    transitionDelay: isInView ? `${delay}ms` : '0ms',
    transitionDuration: `${duration}ms`,
  };

  return (
    <Component
      ref={ref}
      className={combinedClassName}
      style={dynamicStyles}
      {...props}
    >
      {children}
    </Component>
  );
};
