import React from 'react';

type NeonTextProps = {
    color?: 'emerald' | 'crimson' | 'purple' | 'blue';
    href?: string;
    className?: string;
    rightIcon?: React.ReactNode;
    children: React.ReactNode;
};

function NeonText({ color, href, className, rightIcon, children }: NeonTextProps) {
    const textColor = color
        ? {
              emerald: 'hsl(145, 100%, 50%)',
              crimson: 'hsl(348, 100%, 50%)',
              purple: 'hsl(300, 100%, 80%)',
              blue: 'hsl(200, 100%, 70%)',
          }[color]
        : 'hsl(200, 100%, 70%)'; // Default blue

    const containerStyle: React.CSSProperties = {
        fontFamily: 'monospace',
        fontSize: '12px',
        opacity: '0.5',
        color: textColor,
    };

    const neonStyle: React.CSSProperties = {
        textShadow: `0 0 10px ${textColor}, 0 0 20px ${textColor}, 0 0 30px ${textColor}`,
    };

    return (
        <p className={`inline-flex neon-text ${className}`} style={containerStyle}>
            {href ? (
                <a href={href} style={neonStyle}>
                    {" "}
                    {children}
                    {rightIcon}
                    {" "}
                </a>
            ) : (
                <span style={neonStyle}>
                    {" "}
                    {children}
                    {rightIcon}
                    {" "}
                </span>
            )}
        </p>
    );
}

export { NeonText };
