'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
                <p className="text-gray-600 mb-8">An error occurred. Please try again.</p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
