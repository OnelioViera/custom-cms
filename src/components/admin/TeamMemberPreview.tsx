'use client';

import { Monitor, User, Users } from 'lucide-react';

interface TeamMemberPreviewProps {
    data: {
        name: string;
        role: string;
        description: string;
        avatar: string;
        order: number;
    };
}

export default function TeamMemberPreview({ data }: TeamMemberPreviewProps) {
    const hasContent = data.name || data.role;

    // Strip HTML tags for preview
    const stripHtml = (html: string) => {
        if (typeof window === 'undefined') return html;
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Get initials for avatar placeholder
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-100 to-gray-50 p-6">
                {hasContent ? (
                    <div className="space-y-6">
                        {/* Card Preview - How it appears in carousel */}
                        <div>
                            <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wide">
                                Carousel Card Preview
                            </p>
                            <div className="max-w-sm mx-auto bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {data.avatar ? (
                                            <img
                                                src={data.avatar}
                                                alt={data.name || 'Avatar'}
                                                className="w-16 h-16 rounded-full object-cover ring-2 ring-yellow-100"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-yellow-100">
                                                {data.name ? getInitials(data.name) : <User className="w-8 h-8" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-lg truncate">
                                            {data.name || 'Team Member Name'}
                                        </h3>
                                        <p className="text-yellow-600 font-medium text-sm">
                                            {data.role || 'Role / Position'}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="mt-4 text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    {data.description ? stripHtml(data.description) : 'Description of their work and contributions will appear here...'}
                                </p>
                            </div>
                        </div>

                        {/* How it looks in context */}
                        <div>
                            <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wide">
                                In Carousel Context
                            </p>
                            <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 overflow-hidden">
                                <div className="flex gap-3 overflow-hidden">
                                    {/* Previous card (faded) */}
                                    <div className="flex-shrink-0 w-48 opacity-40 scale-95">
                                        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                                <div>
                                                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                                    <div className="h-2 w-12 bg-gray-100 rounded mt-1"></div>
                                                </div>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                                <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current card */}
                                    <div className="flex-shrink-0 w-48">
                                        <div className="bg-white rounded-lg border-2 border-yellow-400 p-3 shadow-md">
                                            <div className="flex items-center gap-2">
                                                {data.avatar ? (
                                                    <img src={data.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {data.name ? getInitials(data.name) : '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                                        {data.name || 'Name'}
                                                    </p>
                                                    <p className="text-[10px] text-yellow-600 truncate">
                                                        {data.role || 'Role'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-[10px] text-gray-600 line-clamp-2">
                                                {data.description ? stripHtml(data.description).slice(0, 80) + '...' : 'Description...'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Next card (faded) */}
                                    <div className="flex-shrink-0 w-48 opacity-40 scale-95">
                                        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                                <div>
                                                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                                    <div className="h-2 w-12 bg-gray-100 rounded mt-1"></div>
                                                </div>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                                <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order indicator */}
                        {data.order !== undefined && (
                            <div className="text-center">
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                    <Users className="w-3 h-3" />
                                    Display Order: {data.order}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Start typing to see preview</p>
                            <p className="text-xs mt-1">Your changes will appear here in real-time</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

