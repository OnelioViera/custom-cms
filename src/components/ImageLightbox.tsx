'use client';

import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageLightboxProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ImageLightbox({ src, alt, className = '' }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Thumbnail with zoom indicator */}
            <div 
                className={`relative cursor-pointer group ${className}`}
                onClick={() => setIsOpen(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                        <ZoomIn className="w-6 h-6 text-gray-700" />
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Image */}
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Caption */}
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-lg">
                        {alt}
                    </p>
                </div>
            )}
        </>
    );
}

