import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}) => {


    // Note: Using inline styles for dynamic variables if needed, but here relying on global CSS vars defined in index.css
    // Since we are not using Tailwind for the colors directly (custom vars), we map them manually if clsx/tailwind class names don't match.
    // Actually, I am using some tailwind-like utility classes. I should verify if Tailwind is installed. 
    // Wait, I did NOT install Tailwind. I said "Going vanilla for now" in task.md.
    // BUT I am using `clsx` and class strings that LOOK like Tailwind.
    // Without Tailwind, `bg-red-600` etc won't work unless I define them or use inline styles.
    // RE-EVALUATION: I should stick to the "Vanilla CSS" plan or inline styles for the component to be safe, 
    // OR define these utility classes in index.css.

    // Given the "Vanilla CSS" constraint and "No Tailwind unless requested", I should use CSS Modules or just standard classes.
    // I will use standard BEM-like classes or just scoped styles.
    // Let's rewrite this to use the `btn` classes I defined in index.css and add more there if needed.

    return (
        <button
            className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <Loader2 style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem', width: '16px', height: '16px' }} />
            )}
            {!isLoading && leftIcon && <span style={{ marginRight: '0.5rem', display: 'inline-flex' }}>{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span style={{ marginLeft: '0.5rem', display: 'inline-flex' }}>{rightIcon}</span>}
        </button>
    );
};
