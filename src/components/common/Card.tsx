import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    padding?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = '1.5rem', style, ...props }) => {
    return (
        <div
            className={`card ${className}`}
            style={{ padding, ...style }}
            {...props}
        >
            {children}
        </div>
    );
};
