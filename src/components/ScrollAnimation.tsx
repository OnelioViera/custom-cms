'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade' | 'zoom' | 'blur';

interface ScrollAnimationProps {
    children: ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
    once?: boolean;
}

export default function ScrollAnimation({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 600,
    threshold = 0.1,
    className = '',
    once = true,
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, once]);

    const getInitialStyles = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            opacity: 0,
            transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        };

        switch (animation) {
            case 'fade-up':
                return { ...base, transform: 'translateY(40px)' };
            case 'fade-down':
                return { ...base, transform: 'translateY(-40px)' };
            case 'fade-left':
                return { ...base, transform: 'translateX(40px)' };
            case 'fade-right':
                return { ...base, transform: 'translateX(-40px)' };
            case 'zoom':
                return { ...base, transform: 'scale(0.9)' };
            case 'blur':
                return { ...base, filter: 'blur(10px)', transform: 'translateY(20px)' };
            case 'fade':
            default:
                return base;
        }
    };

    const getVisibleStyles = (): React.CSSProperties => ({
        opacity: 1,
        transform: 'translate(0) scale(1)',
        filter: 'blur(0)',
    });

    return (
        <div
            ref={ref}
            className={className}
            style={isVisible ? { ...getInitialStyles(), ...getVisibleStyles() } : getInitialStyles()}
        >
            {children}
        </div>
    );
}

// Stagger container for animating multiple children with delays
interface StaggerContainerProps {
    children: ReactNode[];
    animation?: AnimationType;
    staggerDelay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
    childClassName?: string;
}

export function StaggerContainer({
    children,
    animation = 'fade-up',
    staggerDelay = 100,
    duration = 600,
    threshold = 0.1,
    className = '',
    childClassName = '',
}: StaggerContainerProps) {
    return (
        <div className={className}>
            {children.map((child, index) => (
                <ScrollAnimation
                    key={index}
                    animation={animation}
                    delay={index * staggerDelay}
                    duration={duration}
                    threshold={threshold}
                    className={childClassName}
                >
                    {child}
                </ScrollAnimation>
            ))}
        </div>
    );
}

