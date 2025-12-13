'use client';

import { useState, useEffect } from 'react';
import {
    X,
    Search,
    Upload,
    Video,
    Image as ImageIcon,
    Check,
    Film,
    Grid,
    List,
    Play,
    Filter,
} from 'lucide-react';

interface MediaItem {
    _id: string;
    mediaId: string;
    name: string;
    originalName: string;
    type: 'video' | 'image';
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    metadata?: {
        width?: number;
        height?: number;
        duration?: number;
        aspectRatio?: string;
    };
    folder: string;
    tags: string[];
    alt?: string;
    description?: string;
    createdAt: string;
}

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: MediaItem) => void;
    filterType?: 'all' | 'video' | 'image';
    title?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

export default function MediaPicker({
    isOpen,
    onClose,
    onSelect,
    filterType: initialFilterType = 'all',
    title = 'Select Media',
}: MediaPickerProps) {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>(initialFilterType);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadMedia();
        }
    }, [isOpen, filterType, searchTerm]);

    useEffect(() => {
        setFilterType(initialFilterType);
    }, [initialFilterType]);

    const loadMedia = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterType !== 'all') {
                params.append('type', filterType);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await fetch(`${API_URL}/cms/${SITE_ID}/media?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setMedia(data.data?.media || []);
            }
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        for (const file of Array.from(files)) {
            try {
                const type = file.type.startsWith('video/') ? 'video' : 'image';

                const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert(`${file.name} is too large. Max size: ${type === 'video' ? '100MB' : '10MB'}`);
                    continue;
                }

                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                let metadata: any = {};
                if (type === 'image') {
                    const img = new window.Image();
                    img.src = base64;
                    await new Promise((resolve) => {
                        img.onload = resolve;
                    });
                    metadata = {
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        aspectRatio: `${img.naturalWidth}:${img.naturalHeight}`,
                    };
                }

                if (type === 'video') {
                    const video = document.createElement('video');
                    video.src = base64;
                    video.preload = 'metadata';
                    await new Promise((resolve) => {
                        video.onloadedmetadata = () => {
                            metadata = {
                                width: video.videoWidth,
                                height: video.videoHeight,
                                duration: Math.round(video.duration),
                                aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
                            };
                            resolve(true);
                        };
                    });
                }

                const response = await fetch(`${API_URL}/cms/${SITE_ID}/media`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: file.name.replace(/\.[^/.]+$/, ''),
                        originalName: file.name,
                        type,
                        mimeType: file.type,
                        size: file.size,
                        url: base64,
                        metadata,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert(`Failed to upload ${file.name}`);
            }
        }

        setUploading(false);
        loadMedia();
        e.target.value = '';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSelect = () => {
        if (selectedMedia) {
            onSelect(selectedMedia);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
                    {/* Upload Button */}
                    <label className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium text-sm flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Upload
                        <input
                            type="file"
                            accept={filterType === 'video' ? 'video/*' : filterType === 'image' ? 'image/*' : 'image/*,video/*'}
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>

                    {/* Search */}
                    <div className="flex-1 min-w-[180px] max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-sm text-gray-900"
                        />
                    </div>

                    {/* Filter */}
                    {initialFilterType === 'all' && (
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-sm text-gray-900"
                        >
                            <option value="all">All Types</option>
                            <option value="video">Videos</option>
                            <option value="image">Images</option>
                        </select>
                    )}

                    {/* View Mode */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Uploading Indicator */}
                {uploading && (
                    <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-yellow-800">Uploading...</span>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : media.length === 0 ? (
                        <div className="text-center py-12">
                            <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No media found</p>
                            <p className="text-sm text-gray-500 mt-1">Upload some files to get started</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {media.map((item) => (
                                <div
                                    key={item.mediaId}
                                    onClick={() => setSelectedMedia(item)}
                                    className={`group relative rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                                        selectedMedia?.mediaId === item.mediaId
                                            ? 'border-yellow-500 ring-2 ring-yellow-200'
                                            : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <div className="aspect-video bg-gray-100">
                                        {item.type === 'video' ? (
                                            <>
                                                {item.thumbnailUrl ? (
                                                    <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <video src={item.url} className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                                                    {item.metadata?.duration ? formatDuration(item.metadata.duration) : <Video className="w-3 h-3" />}
                                                </div>
                                            </>
                                        ) : (
                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                        )}
                                        
                                        {/* Type Badge */}
                                        <div className="absolute top-1 left-1">
                                            {item.type === 'video' ? (
                                                <Video className="w-4 h-4 text-white drop-shadow-lg" />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-white drop-shadow-lg" />
                                            )}
                                        </div>

                                        {/* Selected Indicator */}
                                        {selectedMedia?.mediaId === item.mediaId && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 bg-white">
                                        <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {media.map((item) => (
                                <div
                                    key={item.mediaId}
                                    onClick={() => setSelectedMedia(item)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
                                        selectedMedia?.mediaId === item.mediaId
                                            ? 'border-yellow-500 bg-yellow-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {item.type === 'video' ? (
                                            <video src={item.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {item.type}
                                    </span>
                                    {selectedMedia?.mediaId === item.mediaId && (
                                        <Check className="w-5 h-5 text-yellow-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {selectedMedia ? (
                            <span>Selected: <strong>{selectedMedia.name}</strong></span>
                        ) : (
                            <span>{media.length} items</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSelect}
                            disabled={!selectedMedia}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                                selectedMedia
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <Check className="w-4 h-4" />
                            Select
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

