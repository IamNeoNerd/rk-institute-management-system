'use client';

import { ReactNode } from 'react';

interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6; // For visual styling different from semantic level
}

const AccessibleHeading = ({ 
  level, 
  children, 
  className = '', 
  id,
  visualLevel 
}: AccessibleHeadingProps) => {
  // Semantic heading element
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Visual styling based on visualLevel or level
  const displayLevel = visualLevel || level;
  
  const getHeadingStyles = (level: number) => {
    const baseStyles = "font-bold text-gray-900 leading-tight";
    
    switch (level) {
      case 1:
        return `${baseStyles} text-4xl lg:text-5xl`;
      case 2:
        return `${baseStyles} text-3xl lg:text-4xl`;
      case 3:
        return `${baseStyles} text-2xl lg:text-3xl`;
      case 4:
        return `${baseStyles} text-xl lg:text-2xl`;
      case 5:
        return `${baseStyles} text-lg lg:text-xl`;
      case 6:
        return `${baseStyles} text-base lg:text-lg`;
      default:
        return `${baseStyles} text-2xl`;
    }
  };

  return (
    <HeadingTag 
      id={id}
      className={`${getHeadingStyles(displayLevel)} ${className}`}
    >
      {children}
    </HeadingTag>
  );
};

export default AccessibleHeading;
