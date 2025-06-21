'use client';

import { useEffect, useState, ReactNode } from 'react';

interface MotionProps {
  children: ReactNode;
  initial?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  animate?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

// SSR-Safe Motion Component - Pure CSS Animations
export function Motion({
  children,
  initial = {},
  animate = {},
  transition = {},
  className = '',
  style = {},
  ...props
}: MotionProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger animation after mount with safety check
    const delay = (transition && transition.delay) || 0;
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [transition]);

  // Generate CSS transform and opacity values with safety checks
  const getInitialStyle = () => {
    const transforms = [];
    let opacity = initial && initial.opacity !== undefined ? initial.opacity : undefined;

    if (initial && initial.x !== undefined) transforms.push(`translateX(${initial.x}px)`);
    if (initial && initial.y !== undefined) transforms.push(`translateY(${initial.y}px)`);
    if (initial && initial.scale !== undefined) transforms.push(`scale(${initial.scale})`);

    const duration = (transition && transition.duration) || 0.3;
    const ease = (transition && transition.ease) || 'ease-out';

    return {
      transform: transforms.length > 0 ? transforms.join(' ') : undefined,
      opacity,
      transition: mounted ? `all ${duration}s ${ease}` : 'none',
    };
  };

  const getAnimateStyle = () => {
    const transforms = [];
    let opacity = animate && animate.opacity !== undefined ? animate.opacity : undefined;

    if (animate && animate.x !== undefined) transforms.push(`translateX(${animate.x}px)`);
    if (animate && animate.y !== undefined) transforms.push(`translateY(${animate.y}px)`);
    if (animate && animate.scale !== undefined) transforms.push(`scale(${animate.scale})`);

    return {
      transform: transforms.length > 0 ? transforms.join(' ') : 'none',
      opacity,
    };
  };

  const combinedStyle = {
    ...style,
    ...(mounted && isAnimating ? getAnimateStyle() : getInitialStyle()),
  };

  return (
    <div className={className} style={combinedStyle} {...props}>
      {children}
    </div>
  );
}

// Common animation presets
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 }
};

// Export as default for easy replacement
export default Motion;
