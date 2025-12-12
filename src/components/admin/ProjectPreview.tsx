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

            {/* Preview Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white">
                {hasContent ? (
                    <div className="min-h-full flex flex-col">
                        {/* Mini Nav */}
                        <div className="bg-white border-b border-gray-100 px-4 py-2 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                <div className="flex gap-2">
                                    <div className="h-3 w-10 bg-gray-100 rounded"></div>
                                    <div className="h-3 w-10 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div className="bg-gray-50 px-4 py-2 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>Home</span>
                                <span>/</span>
                                <span>Projects</span>
                                <span>/</span>
                                <span className="text-gray-900 font-medium truncate">
                                    {data.title || 'Untitled'}
                                </span>
                            </div>
                        </div>

                        {/* Hero Section - Main Content */}
                        <div className="bg-gray-50 p-5 flex-1">
                            <div className="grid grid-cols-5 gap-4">
                                {/* Text Content - 3 columns */}
                                <div className="col-span-3">
                                    <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                        {data.title || 'Project Title'}
                                    </h1>
                                    <div 
                                        className="text-sm text-gray-600 mb-4 line-clamp-3 rich-text-content"
                                        dangerouslySetInnerHTML={{ 
                                            __html: data.shortDescription || '<p>Short description will appear here...</p>' 
                                        }}
                                    />

                                    {/* Info Items */}
                                    <div className="space-y-3">
                                        {data.client && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Client</p>
                                                    <p className="text-sm font-medium text-gray-900">{data.client}</p>
                                                </div>
                                            </div>
                                        )}
                                        {data.location && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Location</p>
                                                    <p className="text-sm font-medium text-gray-900">{data.location}</p>
                                                </div>
                                            </div>
                                        )}
                                        {data.projectSize && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Ruler className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Size</p>
                                                    <p className="text-sm font-medium text-gray-900">{data.projectSize}</p>
                                                </div>
                                            </div>
                                        )}
                                        {data.capacity && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Zap className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Capacity</p>
                                                    <p className="text-sm font-medium text-gray-900">{data.capacity}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Image - 2 columns */}
                                <div className="col-span-2">
                                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg aspect-[4/3] flex items-center justify-center overflow-hidden">
                                        {data.projectImage ? (
                                            <img
                                                src={data.projectImage}
                                                alt={data.title || 'Preview'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Building2 className="w-12 h-12 text-slate-400" strokeWidth={1} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Sections */}
                            {(data.description || data.challenges || data.results) && (
                                <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
                                    {data.description && (
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-900 mb-1">Project Overview</h2>
                                            <div 
                                                className="text-xs text-gray-600 line-clamp-4 rich-text-content"
                                                dangerouslySetInnerHTML={{ __html: data.description }}
                                            />
                                        </div>
                                    )}

                                    {data.challenges && (
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-900 mb-1">Challenges</h2>
                                            <div 
                                                className="text-xs text-gray-600 line-clamp-3 rich-text-content"
                                                dangerouslySetInnerHTML={{ __html: data.challenges }}
                                            />
                                        </div>
                                    )}

                                    {data.results && (
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-900 mb-1">Results</h2>
                                            <div 
                                                className="text-xs text-gray-600 line-clamp-3 rich-text-content"
                                                dangerouslySetInnerHTML={{ __html: data.results }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mini Footer */}
                        <div className="bg-gray-900 px-4 py-2 flex-shrink-0 mt-auto">
                            <div className="h-3 w-16 bg-gray-700 rounded"></div>
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
