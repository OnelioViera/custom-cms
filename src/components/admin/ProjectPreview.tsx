'use client';

import { Building2, MapPin, Ruler, Zap, Monitor } from 'lucide-react';

interface ProjectPreviewProps {
    data: {
        title: string;
        client: string;
        location: string;
        projectSize: string;
        capacity: string;
        shortDescription: string;
        description: string;
        challenges: string;
        results: string;
        projectImage: string;
    };
}

export default function ProjectPreview({ data }: ProjectPreviewProps) {
    const hasContent = data.title || data.client || data.shortDescription;

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
            {/* Preview Header */}
            <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Live Preview</span>
                <div className="flex gap-1.5 ml-auto">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
            </div>

            {/* Preview Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {hasContent ? (
                    <div className="transform origin-top scale-100">
                        {/* Mini Nav */}
                        <div className="bg-white border-b border-gray-100 px-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                <div className="flex gap-3">
                                    <div className="h-4 w-12 bg-gray-100 rounded"></div>
                                    <div className="h-4 w-12 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div className="bg-gray-50 px-4 py-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>Home</span>
                                <span>/</span>
                                <span>Projects</span>
                                <span>/</span>
                                <span className="text-gray-900 font-medium truncate max-w-[100px]">
                                    {data.title || 'Untitled'}
                                </span>
                            </div>
                        </div>

                        {/* Hero Section */}
                        <div className="bg-gray-50 p-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Text Content */}
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                                        {data.title || 'Project Title'}
                                    </h1>
                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                        {data.shortDescription || 'Short description will appear here...'}
                                    </p>

                                    {/* Info Items */}
                                    <div className="space-y-2">
                                        {data.client && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-3 h-3 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500">Client</p>
                                                    <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{data.client}</p>
                                                </div>
                                            </div>
                                        )}
                                        {data.location && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-3 h-3 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500">Location</p>
                                                    <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{data.location}</p>
                                                </div>
                                            </div>
                                        )}
                                        {data.projectSize && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                                                    <Ruler className="w-3 h-3 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500">Size</p>
                                                    <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{data.projectSize}</p>
                                                </div>
                                            </div>
                                        )}
                                        {data.capacity && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                                                    <Zap className="w-3 h-3 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500">Capacity</p>
                                                    <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{data.capacity}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Image */}
                                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg h-32 flex items-center justify-center overflow-hidden">
                                    {data.projectImage ? (
                                        <img
                                            src={data.projectImage}
                                            alt={data.title || 'Preview'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-slate-400" strokeWidth={1} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="p-4 space-y-4">
                            {data.description && (
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 mb-2">Project Overview</h2>
                                    <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-line">
                                        {data.description}
                                    </p>
                                </div>
                            )}

                            {data.challenges && (
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 mb-2">Challenges</h2>
                                    <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-line">
                                        {data.challenges}
                                    </p>
                                </div>
                            )}

                            {data.results && (
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 mb-2">Results</h2>
                                    <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-line">
                                        {data.results}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mini Footer */}
                        <div className="bg-gray-900 px-4 py-3 mt-4">
                            <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                            <div className="h-2 w-32 bg-gray-800 rounded"></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="text-center text-gray-400">
                            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Start typing to see preview</p>
                            <p className="text-xs mt-1">Your changes will appear here in real-time</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

