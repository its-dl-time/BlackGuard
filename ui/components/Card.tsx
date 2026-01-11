import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-white border border-neutral-300 shadow-sm rounded-none p-8 ${className}`}>
      {title && (
        <h3 className="text-xs font-black text-black mb-6 uppercase tracking-widest border-b border-neutral-200 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;