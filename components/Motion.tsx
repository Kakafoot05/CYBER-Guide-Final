import React from 'react';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full w-full animate-fade-in">{children}</div>
);

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  width?: 'fit-content' | '100%';
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  width = 'fit-content',
  className = '',
}) => {
  const style: React.CSSProperties = {
    width,
    ...(delay > 0
      ? {
          animationDelay: `${delay}s`,
          animationFillMode: 'both',
        }
      : {}),
  };

  return (
    <div className={`animate-fade-in-up ${className}`} style={style}>
      {children}
    </div>
  );
};

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '' }) => <div className={className}>{children}</div>;

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`animate-fade-in-up ${className}`}>{children}</div>;
