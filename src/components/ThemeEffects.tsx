
'use client';

import { useState, useEffect } from 'react';
import { getHeroData } from '@/lib/firebase-service';

const createElements = (
    num: number, 
    className: string, 
    char: string | React.ReactNode, 
    randStyle: () => React.CSSProperties
) => {
    return Array.from({ length: num }).map((_, i) => (
        <div key={i} className={className} style={randStyle()}>
            {char}
        </div>
    ));
};

const createFireworkElements = (num: number) => {
    return Array.from({ length: num }).map((_, i) => {
        const style = {
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 50 + 20}%`,
            animationDelay: `${Math.random() * 2}s`,
        };
        const particleCount = Math.floor(Math.random() * 5) + 8; // 8 to 12 particles
        return (
            <div key={i} className="firework" style={style}>
                {Array.from({ length: particleCount }).map((_, j) => (
                    <div key={j} style={{ transform: `rotate(${j * (360 / particleCount)}deg)` }} />
                ))}
            </div>
        );
    });
};

export function ThemeEffects() {
    const [theme, setTheme] = useState('');
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    useEffect(() => {
        const applyThemeFromSettings = (settings: { theme?: string, animationsEnabled?: boolean }) => {
            const activeTheme = settings.theme || 'default';
            const animationsOn = settings.animationsEnabled !== false;

            document.documentElement.classList.forEach(className => {
                if (className.startsWith('theme-')) {
                    document.documentElement.classList.remove(className);
                }
            });
            if (activeTheme !== 'default') {
                document.documentElement.classList.add(`theme-${activeTheme}`);
            }
            
            setTheme(activeTheme);
            setAnimationsEnabled(animationsOn);
            localStorage.setItem('mkenya-skilled-theme', activeTheme);
            localStorage.setItem('mkenya-skilled-animations', String(animationsOn));
        }

        // Fetch from DB on initial load to get latest settings
        getHeroData().then(applyThemeFromSettings);

        // Also add an event listener for when another tab updates the settings
        const handleStorageChange = () => {
             const storedTheme = localStorage.getItem('mkenya-skilled-theme') || 'default';
             const storedAnimations = localStorage.getItem('mkenya-skilled-animations') !== 'false';
             applyThemeFromSettings({ theme: storedTheme, animationsEnabled: storedAnimations });
        };

        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);

    }, []);

    if (!animationsEnabled) return null;

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
        return createFireworkElements(15);
    };

    return (
        <div className="theme-effects-container">
            {theme === 'theme-christmas' && <div className="snow">{renderSnow()}</div>}
            {theme === 'theme-valentines' && <div className="hearts">{renderHearts()}</div>}
            {theme === 'theme-new-year' && <div className="fireworks">{renderFireworks()}</div>}
        </div>
    );
}
