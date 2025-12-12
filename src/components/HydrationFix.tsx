'use client';

import { useEffect, useState, ReactNode } from 'react';

interface HydrationFixProps {
    children: ReactNode;
}

/**
 * This component suppresses hydration warnings by only rendering children
 * after the component has mounted on the client.
 * 
 * It renders an empty div during SSR and initial hydration to ensure
 * server and client HTML match exactly.
 */
export default function HydrationFix({ children }: HydrationFixProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // During SSR and initial hydration, render nothing
    // After mount, render children
    if (!isClient) {
        return null;
    }

    return <>{children}</>;
}

