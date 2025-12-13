'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Star,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Plus,
    Trash2,
    Upload,
    Video,
    Image as ImageIcon,
    Search,
    Grid,
    List,
    X,
    Play,
    Copy,
    Check,
    Film,
    Type,
    Filter,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

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

interface User {
    email: string;
    role: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

function MediaLibraryContent() {
    const router = useRouter();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        setUser({
            email: localStorage.getItem('userEmail') || 'admin@lindsayprecast.com',
            role: 'admin',
        });
    }, [router]);

    // Load media
    useEffect(() => {
        loadMedia();
    }, [filterType, searchTerm]);

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
            toast.error('Failed to load media');
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
                // Determine type
                const type = file.type.startsWith('video/') ? 'video' : 'image';

                // Check size limits
                const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image
                if (file.size > maxSize) {
                    toast.error(`${file.name} is too large. Max size: ${type === 'video' ? '100MB' : '10MB'}`);
                    continue;
                }

                // Convert to base64
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                // Get metadata for images
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

                // Get duration for videos
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

                // Upload to API
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

                toast.success(`${file.name} uploaded successfully`);
            } catch (error) {
                console.error('Error uploading file:', error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        setUploading(false);
        loadMedia();

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (mediaId: string) => {
        if (!confirm('Are you sure you want to delete this media?')) return;

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/media/${mediaId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            toast.success('Media deleted successfully');
            setSelectedMedia(null);
            loadMedia();
        } catch (error) {
            console.error('Error deleting media:', error);
            toast.error('Failed to delete media');
        }
    };

    const copyToClipboard = async (text: string, mediaId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(mediaId);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            toast.error('Failed to copy');
        }
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

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20`}
            >
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-center">
                        <img
                            src="/lindsay-precast-logo.png"
                            alt="Lindsay Precast"
                            className={`${sidebarOpen ? 'h-12' : 'h-8'} w-auto brightness-0 invert transition-all`}
                        />
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Dashboard</span>}
                    </Link>

                    <Link
                        href="/admin/dashboard?tab=projects"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <FolderKanban className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Projects</span>}
                    </Link>

                    <Link
                        href="/admin/media"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition bg-yellow-600 text-white"
                    >
                        <Film className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Media Library</span>}
                    </Link>

                    <Link
                        href="/admin/content"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <Type className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Page Content</span>}
                    </Link>

                    <Link
                        href="/admin/dashboard?tab=submissions"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Submissions</span>}
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-400 flex items-center justify-center"
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>

                <div className="p-4 border-t border-gray-800">
                    {user && sidebarOpen && (
                        <div className="text-xs text-gray-400 mb-3 px-2">
                            <p className="truncate">{user.email}</p>
                            <p className="text-gray-500">{user.role}</p>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('userId');
                            localStorage.removeItem('userEmail');
                            document.cookie = 'authToken=; path=/; max-age=0';
                            router.push('/admin/login');
                        }}
                        className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        {sidebarOpen && 'Sign Out'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-auto ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Media Library</h1>
                        <p className="text-gray-600">Upload and manage your videos and images</p>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Upload Button */}
                            <label className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center gap-2 cursor-pointer">
                                <Upload className="w-5 h-5" />
                                Upload Media
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>

                            {/* Search */}
                            <div className="flex-1 min-w-[200px] max-w-md relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search media..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>

                            {/* Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                >
                                    <option value="all">All Types</option>
                                    <option value="video">Videos</option>
                                    <option value="image">Images</option>
                                </select>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Uploading Indicator */}
                    {uploading && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-yellow-800 font-medium">Uploading media...</span>
                        </div>
                    )}

                    {/* Media Grid/List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : media.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No media yet</h3>
                            <p className="text-gray-600 mb-6">Upload your first video or image to get started</p>
                            <label className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium inline-flex items-center gap-2 cursor-pointer">
                                <Upload className="w-5 h-5" />
                                Upload Media
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {media.map((item) => (
                                <div
                                    key={item.mediaId}
                                    onClick={() => setSelectedMedia(item)}
                                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-yellow-500 transition"
                                >
                                    <div className="relative aspect-video bg-gray-100">
                                        {item.type === 'video' ? (
                                            <>
                                                {item.thumbnailUrl ? (
                                                    <img
                                                        src={item.thumbnailUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <video
                                                        src={item.url}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                                                    <Play className="w-10 h-10 text-white" />
                                                </div>
                                                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                                                    {item.metadata?.duration ? formatDuration(item.metadata.duration) : 'Video'}
                                                </div>
                                            </>
                                        ) : (
                                            <img
                                                src={item.url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute top-2 left-2">
                                            {item.type === 'video' ? (
                                                <Video className="w-5 h-5 text-white drop-shadow-lg" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-white drop-shadow-lg" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Preview</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {media.map((item) => (
                                        <tr
                                            key={item.mediaId}
                                            onClick={() => setSelectedMedia(item)}
                                            className="hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden">
                                                    {item.type === 'video' ? (
                                                        <video src={item.url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.originalName}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${item.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(item.size)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(item.url, item.mediaId);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                        title="Copy URL"
                                                    >
                                                        {copiedId === item.mediaId ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.mediaId);
                                                        }}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Media Detail Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">{selectedMedia.name}</h2>
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Preview */}
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    {selectedMedia.type === 'video' ? (
                                        <video
                                            src={selectedMedia.url}
                                            controls
                                            className="w-full aspect-video object-contain"
                                        />
                                    ) : (
                                        <img
                                            src={selectedMedia.url}
                                            alt={selectedMedia.name}
                                            className="w-full object-contain max-h-[400px]"
                                        />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                                        <p className="text-gray-900">{selectedMedia.originalName}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${selectedMedia.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {selectedMedia.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                            {selectedMedia.mimeType}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                        <p className="text-gray-900">{formatFileSize(selectedMedia.size)}</p>
                                    </div>

                                    {selectedMedia.metadata?.width && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                                            <p className="text-gray-900">{selectedMedia.metadata.width} × {selectedMedia.metadata.height}px</p>
                                        </div>
                                    )}

                                    {selectedMedia.metadata?.duration && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                            <p className="text-gray-900">{formatDuration(selectedMedia.metadata.duration)}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded</label>
                                        <p className="text-gray-900">{new Date(selectedMedia.createdAt).toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Media ID</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-700 truncate">
                                                {selectedMedia.mediaId}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(selectedMedia.mediaId, selectedMedia.mediaId + '_id')}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                title="Copy Media ID"
                                            >
                                                {copiedId === selectedMedia.mediaId + '_id' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => handleDelete(selectedMedia.mediaId)}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                            <button
                                onClick={() => copyToClipboard(selectedMedia.url, selectedMedia.mediaId + '_url')}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center gap-2 transition"
                            >
                                {copiedId === selectedMedia.mediaId + '_url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                Copy URL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MediaLibrary() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Loading...</p></div>}>
            <MediaLibraryContent />
        </Suspense>
    );
}

