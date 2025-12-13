'use client';

import { Star, Monitor, Quote, User } from 'lucide-react';

interface TestimonialPreviewProps {
    data: {
        quote: string;
        authorName: string;
        authorTitle: string;
        authorCompany: string;
        authorImage: string;
        rating: number;
        featured: boolean;
    };
}

export default function TestimonialPreview({ data }: TestimonialPreviewProps) {
    const hasContent = data.quote || data.authorName;

    // Strip HTML tags for preview
    const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <div className="bg-white overflow-hidden h-full flex flex-col">
            {/* Preview Header */}
            <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Live Preview</span>
                <div className="flex gap-1.5 ml-auto">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
                {hasContent ? (
                    <div className="max-w-md mx-auto">
                        {/* Card Preview */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
                            {/* Featured Badge */}
                            {data.featured && (
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                        Featured
                                    </span>
                                </div>
                            )}

                            {/* Quote Icon */}
                            <Quote className="w-8 h-8 text-yellow-500 mb-4" />

                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${
                                            star <= data.rating
                                                ? 'text-yellow-500 fill-yellow-500'
                                                : 'text-gray-200'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Quote Text */}
                            <div className="mb-6">
                                {data.quote ? (
                                    <p className="text-gray-700 italic leading-relaxed">
                                        &quot;{stripHtml(data.quote)}&quot;
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic">
                                        &quot;Your testimonial quote will appear here...&quot;
                                    </p>
                                )}
                            </div>

                            {/* Author Info */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                {data.authorImage ? (
                                    <img
                                        src={data.authorImage}
                                        alt={data.authorName || 'Author'}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {data.authorName || 'Author Name'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {data.authorTitle || 'Title'}
                                        {data.authorCompany && `, ${data.authorCompany}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* How it looks on homepage */}
                        <div className="mt-8">
                            <p className="text-xs text-gray-500 text-center mb-3">
                                How it appears on the homepage:
                            </p>
                            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < data.rating
                                                    ? 'text-yellow-500 fill-yellow-500'
                                                    : 'text-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4 italic text-sm line-clamp-3">
                                    &quot;{stripHtml(data.quote) || 'Testimonial quote...'}&quot;
                                </p>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">
                                        {data.authorName || 'Author Name'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {data.authorTitle || 'Title'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                            <Quote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Start typing to see preview</p>
                            <p className="text-xs mt-1">Your changes will appear here in real-time</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

