'use client';

import { useEffect, useRef, useState } from 'react';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    description: string;
    avatar?: string;
}

interface TeamCarouselProps {
    members: TeamMember[];
    title?: string;
    subtitle?: string;
    speed?: number; // pixels per second
}

export default function TeamCarousel({ 
    members, 
    title = "Project Team",
    subtitle = "Meet the people who made it happen",
    speed = 30 
}: TeamCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || members.length === 0) return;

        let animationId: number;
        let lastTime: number | null = null;

        const animate = (currentTime: number) => {
            if (lastTime === null) {
                lastTime = currentTime;
            }

            if (!isPaused) {
                const delta = currentTime - lastTime;
                const pixelsToMove = (speed * delta) / 1000;

                scrollContainer.scrollLeft += pixelsToMove;

                // Reset to beginning when we've scrolled through the first set
                const maxScroll = scrollContainer.scrollWidth / 2;
                if (scrollContainer.scrollLeft >= maxScroll) {
                    scrollContainer.scrollLeft = 0;
                }
            }

            lastTime = currentTime;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isPaused, speed, members.length]);

    if (members.length === 0) return null;

    // Duplicate members for seamless loop
    const duplicatedMembers = [...members, ...members];

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto mb-10">
                <div className="text-center">
                    <h2 className="font-serif text-4xl font-bold mb-4 text-gray-900">
                        {title}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Carousel Container */}
            <div 
                className="relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Gradient Overlays for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

                {/* Scrolling Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-hidden"
                    style={{ scrollBehavior: 'auto' }}
                >
                    {duplicatedMembers.map((member, index) => (
                        <div
                            key={`${member.id}-${index}`}
                            className="flex-shrink-0 w-80 bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {member.avatar ? (
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-16 h-16 rounded-full object-cover ring-2 ring-yellow-100"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-yellow-100">
                                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                                        {member.name}
                                    </h3>
                                    <p className="text-yellow-600 font-medium text-sm">
                                        {member.role}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="mt-4 text-gray-600 text-sm leading-relaxed line-clamp-3">
                                {member.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pause indicator */}
            {isPaused && (
                <div className="text-center mt-4">
                    <span className="text-xs text-gray-400">Paused - move mouse away to resume</span>
                </div>
            )}
        </section>
    );
}

