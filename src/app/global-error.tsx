'use client';

import * as React from 'react';

export default function GlobalError({
    reset,
}: {
    error?: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html suppressHydrationWarning>
            <body suppressHydrationWarning>
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                            Something went wrong!
                        </h2>
                        <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                            An error occurred. Please try again.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#d97706',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
