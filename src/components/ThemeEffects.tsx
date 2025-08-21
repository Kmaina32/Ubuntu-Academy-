
'use client';

import { useState, useEffect } from 'react';

const createElements = (
    num: number, 
    className: string, 
    char: string, 
    randStyle: () => React.CSSProperties
) => {
    return Array.from({ length: num }).map((_, i) => (
        <div key={i} className={className} style={randStyle()}>
            {char}
        </div>
    ));
};

export function ThemeEffects() {
    const [theme, setTheme] = useState('');

    useEffect(() => {
        // Set initial theme
        const activeTheme = document.documentElement.className.match(/theme-[\w-]+/)?.[0] || '';
        setTheme(activeTheme);

        // Observer for class changes on <html>
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const newTheme = (mutation.target as HTMLElement).className.match(/theme-[\w-]+/)?.[0] || '';
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true, 
        });

        return () => observer.disconnect();
    }, []);

    const renderSnow = () => {
        const randStyle = () => ({
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random(),
        });
        return createElements(50, 'snowflake', '❄', randStyle);
    };

    const renderHearts = () => {
         const randStyle = () => ({
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 5 + 3}s`,
            animationDelay: `${Math.random() * 3}s`,
        });
        return createElements(20, 'heart', '❤', randStyle);
    };

    const renderFireworks = () => {
         const randStyle = () => ({
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 50 + 20}%`,
            animationDelay: `${Math.random() * 2}s`,
        });
        return createElements(15, 'firework', '', randStyle);
    };

    return (
        <div className="theme-effects-container">
            {theme === 'theme-christmas' && <div className="snow">{renderSnow()}</div>}
            {theme === 'theme-valentines' && <div className="hearts">{renderHearts()}</div>}
            {theme === 'theme-new-year' && <div className="fireworks">{renderFireworks()}</div>}
        </div>
    );
}
