'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Type, AlignLeft, Upload, Image, X, Crop, Plus, Trash2, Link as LinkIcon, ExternalLink, MousePointer } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';
import { getApiUrl, getPublicSiteId } from '@/lib/env';
import { useToast } from '@/components/Toast';

interface HeroButton {
    id: string;
    text: string;
    link: string;
    isExternal: boolean;
    bgColor: string;
    textColor: string;
    style: 'filled' | 'outline';
}

interface StatItem {
    id: string;
    value: string;
    label: string;
}

interface HeroVideoConfig {
    videoUrl: string;
    enabled: boolean;
    playbackSpeed: number;
    objectFit: 'cover' | 'contain' | 'fill' | 'none';
    overlayColor: string;
    overlayOpacity: number;
    muted: boolean;
    loop: boolean;
}

interface SiteContent {
    _id?: string;
    contentId?: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroImage: string;
    heroButtons: HeroButton[];
    heroVideoConfig: HeroVideoConfig;
    stats: StatItem[];
    projectsTitle: string;
    projectsSubtitle: string;
    testimonialsTitle: string;
    testimonialsSubtitle: string;
    contactTitle: string;
    contactSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
}

const defaultButtons: HeroButton[] = [
    {
        id: 'btn_1',
        text: 'Start a Project',
        link: '#contact',
        isExternal: false,
        bgColor: '#ca8a04',
        textColor: '#ffffff',
        style: 'filled',
    },
    {
        id: 'btn_2',
        text: 'View Projects',
        link: '/projects',
        isExternal: false,
        bgColor: '#111827',
        textColor: '#111827',
        style: 'outline',
    },
];

const defaultStats: StatItem[] = [
    { id: 'stat_1', value: '500+', label: 'Projects Completed' },
    { id: 'stat_2', value: '50K+', label: 'Cubic Yards Produced' },
    { id: 'stat_3', value: '25+', label: 'Years Experience' },
    { id: 'stat_4', value: '99.8%', label: 'On-Time Delivery' },
];

const defaultVideoConfig: HeroVideoConfig = {
    videoUrl: '',
    enabled: false,
    playbackSpeed: 1,
    objectFit: 'cover',
    overlayColor: '#000000',
    overlayOpacity: 30,
    muted: true,
    loop: true,
};

const defaultContent: SiteContent = {
    heroTitle: 'Premium Precast Concrete Solutions for Infrastructure',
    heroSubtitle: 'Engineering excellence meets manufacturing precision. From BESS foundations to custom grade beams, we deliver infrastructure components that power renewable energy and modern utilities.',
    heroDescription: 'Serving solar farms, battery storage facilities, and utility systems across North America.',
    heroImage: '',
    heroButtons: defaultButtons,
    heroVideoConfig: defaultVideoConfig,
    stats: defaultStats,
    projectsTitle: 'Featured Projects',
    projectsSubtitle: 'Recent infrastructure solutions delivering impact across North America',
    testimonialsTitle: 'Client Testimonials',
    testimonialsSubtitle: 'Trusted by leading companies',
    contactTitle: 'Get in Touch',
    contactSubtitle: "Have a project in mind? Let's discuss how we can deliver precision-engineered solutions.",
    ctaTitle: 'Ready for Your Project?',
    ctaSubtitle: "Let's discuss how Lindsay Precast can deliver precision-engineered solutions",
};

export default function SiteContentPage() {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contentId, setContentId] = useState<string | null>(null);
    const [formData, setFormData] = useState<SiteContent>(defaultContent);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const API_URL = getApiUrl();
    const SITE_ID = getPublicSiteId();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/site-content?status=all`);
                if (response.ok) {
                    const data = await response.json();
                    const content = data.data?.content?.[0];
                    if (content) {
                        setContentId(content.contentId);
                        setFormData({
                            ...defaultContent,
                            ...content.data,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching site content:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [API_URL, SITE_ID]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setTempImage(reader.result as string);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
        
        // Reset the input so the same file can be selected again
        e.target.value = '';
    };

    const handleCropComplete = (croppedImage: string) => {
        setFormData(prev => ({ ...prev, heroImage: croppedImage }));
        setShowCropper(false);
        setTempImage(null);
        toast.success('Image cropped successfully!');
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setTempImage(null);
    };

    const openCropperForExisting = () => {
        if (formData.heroImage) {
            setTempImage(formData.heroImage);
            setShowCropper(true);
        }
    };

    const removeHeroImage = () => {
        setFormData(prev => ({ ...prev, heroImage: '' }));
    };

    // Hero Button handlers
    const addHeroButton = () => {
        const newButton: HeroButton = {
            id: `btn_${Date.now()}`,
            text: 'New Button',
            link: '#',
            isExternal: false,
            bgColor: '#ca8a04',
            textColor: '#ffffff',
            style: 'filled',
        };
        setFormData(prev => ({
            ...prev,
            heroButtons: [...(prev.heroButtons || []), newButton],
        }));
    };

    const removeHeroButton = (id: string) => {
        setFormData(prev => ({
            ...prev,
            heroButtons: (prev.heroButtons || []).filter(btn => btn.id !== id),
        }));
    };

    const updateHeroButton = (id: string, updates: Partial<HeroButton>) => {
        setFormData(prev => ({
            ...prev,
            heroButtons: (prev.heroButtons || []).map(btn =>
                btn.id === id ? { ...btn, ...updates } : btn
            ),
        }));
    };

    // Stats handlers
    const addStat = () => {
        const newStat: StatItem = {
            id: `stat_${Date.now()}`,
            value: '0+',
            label: 'New Stat',
        };
        setFormData(prev => ({
            ...prev,
            stats: [...(prev.stats || []), newStat],
        }));
    };

    const removeStat = (id: string) => {
        setFormData(prev => ({
            ...prev,
            stats: (prev.stats || []).filter(stat => stat.id !== id),
        }));
    };

    const updateStat = (id: string, updates: Partial<StatItem>) => {
        setFormData(prev => ({
            ...prev,
            stats: (prev.stats || []).map(stat =>
                stat.id === id ? { ...stat, ...updates } : stat
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: 'Homepage Content',
                status: 'published',
                data: formData,
            };

            let response;
            if (contentId) {
                // Update existing content
                response = await fetch(`${API_URL}/cms/${SITE_ID}/content/site-content/${contentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create new content
                response = await fetch(`${API_URL}/cms/${SITE_ID}/content/site-content`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to save content');
                return;
            }

            const result = await response.json();
            if (!contentId && result.data?.contentId) {
                setContentId(result.data.contentId);
            }

            toast.success('Site content saved successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Loading site content...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm py-4 px-8 flex items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Site Content</h1>
                <div></div>
            </header>
            
            <main className="p-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Hero Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                            <FileText className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Type className="w-4 h-4 inline mr-1" />
                                    Hero Title
                                </label>
                                <input
                                    type="text"
                                    name="heroTitle"
                                    value={formData.heroTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <AlignLeft className="w-4 h-4 inline mr-1" />
                                    Hero Subtitle
                                </label>
                                <textarea
                                    name="heroSubtitle"
                                    value={formData.heroSubtitle}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hero Description
                                </label>
                                <input
                                    type="text"
                                    name="heroDescription"
                                    value={formData.heroDescription}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Image className="w-4 h-4 inline mr-1" />
                                    Hero Image
                                </label>
                                {formData.heroImage ? (
                                    <div className="relative">
                                        <img
                                            src={formData.heroImage}
                                            alt="Hero preview"
                                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={openCropperForExisting}
                                                className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                                title="Crop/Resize"
                                            >
                                                <Crop className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeHeroImage}
                                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                                title="Remove"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <label className="absolute bottom-2 left-2 px-3 py-1.5 bg-white/90 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-white transition flex items-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            Replace
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 hover:bg-yellow-50/50 transition">
                                        <div className="flex flex-col items-center justify-center py-6">
                                            <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 font-medium">Click to upload hero image</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Hero Video Background */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        🎬 Background Video
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.heroVideoConfig?.enabled || false}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                heroVideoConfig: { ...prev.heroVideoConfig, enabled: e.target.checked }
                                            }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-600"></div>
                                        <span className="ms-2 text-sm font-medium text-gray-600">
                                            {formData.heroVideoConfig?.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </label>
                                </div>

                                {formData.heroVideoConfig?.enabled && (
                                    <div className="space-y-4">
                                        {/* Video Source */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-2">Video Source</label>
                                            
                                            {formData.heroVideoConfig?.videoUrl ? (
                                                <div className="relative mb-3">
                                                    <video
                                                        src={formData.heroVideoConfig.videoUrl}
                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                        muted
                                                        playsInline
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            heroVideoConfig: { ...prev.heroVideoConfig, videoUrl: '' }
                                                        }))}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                                        title="Remove video"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {/* Upload from computer */}
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 hover:bg-yellow-50/50 transition">
                                                        <div className="flex flex-col items-center justify-center py-4">
                                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                            <p className="text-sm text-gray-600 font-medium">Click to upload video</p>
                                                            <p className="text-xs text-gray-400 mt-1">MP4, WebM up to 50MB</p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="video/mp4,video/webm"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                
                                                                // Validate file size (max 50MB)
                                                                if (file.size > 50 * 1024 * 1024) {
                                                                    toast.error('Video must be less than 50MB');
                                                                    return;
                                                                }
                                                                
                                                                // Validate file type
                                                                if (!file.type.startsWith('video/')) {
                                                                    toast.error('Please upload a video file');
                                                                    return;
                                                                }
                                                                
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        heroVideoConfig: { ...prev.heroVideoConfig, videoUrl: reader.result as string }
                                                                    }));
                                                                    toast.success('Video uploaded successfully');
                                                                };
                                                                reader.onerror = () => {
                                                                    toast.error('Failed to read video file');
                                                                };
                                                                reader.readAsDataURL(file);
                                                                e.target.value = '';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-px bg-gray-200"></div>
                                                        <span className="text-xs text-gray-400">or enter URL</span>
                                                        <div className="flex-1 h-px bg-gray-200"></div>
                                                    </div>
                                                    
                                                    {/* URL input */}
                                                    <input
                                                        type="text"
                                                        value={formData.heroVideoConfig?.videoUrl || ''}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            heroVideoConfig: { ...prev.heroVideoConfig, videoUrl: e.target.value }
                                                        }))}
                                                        placeholder="https://example.com/video.mp4"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 bg-white"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Playback Speed */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Playback Speed: {formData.heroVideoConfig?.playbackSpeed || 1}x
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0.25"
                                                    max="2"
                                                    step="0.25"
                                                    value={formData.heroVideoConfig?.playbackSpeed || 1}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        heroVideoConfig: { ...prev.heroVideoConfig, playbackSpeed: parseFloat(e.target.value) }
                                                    }))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                                                />
                                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                    <span>0.25x</span>
                                                    <span>1x</span>
                                                    <span>2x</span>
                                                </div>
                                            </div>

                                            {/* Object Fit */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Video Size</label>
                                                <select
                                                    value={formData.heroVideoConfig?.objectFit || 'cover'}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        heroVideoConfig: { ...prev.heroVideoConfig, objectFit: e.target.value as 'cover' | 'contain' | 'fill' | 'none' }
                                                    }))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 bg-white"
                                                >
                                                    <option value="cover">Cover (fill area)</option>
                                                    <option value="contain">Contain (fit inside)</option>
                                                    <option value="fill">Stretch to fill</option>
                                                    <option value="none">Original size</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Overlay Color */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Overlay Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={formData.heroVideoConfig?.overlayColor || '#000000'}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            heroVideoConfig: { ...prev.heroVideoConfig, overlayColor: e.target.value }
                                                        }))}
                                                        className="w-10 h-10 p-0 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.heroVideoConfig?.overlayColor || '#000000'}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            heroVideoConfig: { ...prev.heroVideoConfig, overlayColor: e.target.value }
                                                        }))}
                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 bg-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Overlay Opacity */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Overlay Opacity: {formData.heroVideoConfig?.overlayOpacity || 30}%
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    value={formData.heroVideoConfig?.overlayOpacity || 30}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        heroVideoConfig: { ...prev.heroVideoConfig, overlayOpacity: parseInt(e.target.value) }
                                                    }))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                                                />
                                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                    <span>0%</span>
                                                    <span>50%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Options */}
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.heroVideoConfig?.muted !== false}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        heroVideoConfig: { ...prev.heroVideoConfig, muted: e.target.checked }
                                                    }))}
                                                    className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                                                />
                                                <span className="text-sm text-gray-700">Muted</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.heroVideoConfig?.loop !== false}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        heroVideoConfig: { ...prev.heroVideoConfig, loop: e.target.checked }
                                                    }))}
                                                    className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                                                />
                                                <span className="text-sm text-gray-700">Loop</span>
                                            </label>
                                        </div>

                                        {/* Preview */}
                                        {formData.heroVideoConfig?.videoUrl && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-2">Preview</label>
                                                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                                                    <video
                                                        src={formData.heroVideoConfig.videoUrl}
                                                        autoPlay
                                                        muted
                                                        loop
                                                        playsInline
                                                        className="w-full h-full"
                                                        style={{ objectFit: formData.heroVideoConfig.objectFit || 'cover' }}
                                                    />
                                                    <div
                                                        className="absolute inset-0 pointer-events-none"
                                                        style={{
                                                            backgroundColor: formData.heroVideoConfig.overlayColor || '#000000',
                                                            opacity: (formData.heroVideoConfig.overlayOpacity || 30) / 100
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Hero Buttons */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        <MousePointer className="w-4 h-4 inline mr-1" />
                                        Hero Buttons
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addHeroButton}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Button
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {(formData.heroButtons || []).map((button, index) => (
                                        <div key={button.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-700">Button {index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeHeroButton(button.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Button Text */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Button Text</label>
                                                    <input
                                                        type="text"
                                                        value={button.text}
                                                        onChange={(e) => updateHeroButton(button.id, { text: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                                    />
                                                </div>
                                                
                                                {/* Link */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">
                                                        Link {button.isExternal && <ExternalLink className="w-3 h-3 inline ml-1" />}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={button.link}
                                                        onChange={(e) => updateHeroButton(button.id, { link: e.target.value })}
                                                        placeholder="/page or https://..."
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                                    />
                                                </div>
                                                
                                                {/* Style */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Style</label>
                                                    <select
                                                        value={button.style}
                                                        onChange={(e) => updateHeroButton(button.id, { style: e.target.value as 'filled' | 'outline' })}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                                    >
                                                        <option value="filled">Filled</option>
                                                        <option value="outline">Outline</option>
                                                    </select>
                                                </div>
                                                
                                                {/* External Link Toggle */}
                                                <div className="flex items-center">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={button.isExternal}
                                                            onChange={(e) => updateHeroButton(button.id, { isExternal: e.target.checked })}
                                                            className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
                                                        />
                                                        <span className="text-sm text-gray-700">External link</span>
                                                    </label>
                                                </div>
                                                
                                                {/* Background Color */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">
                                                        {button.style === 'filled' ? 'Background' : 'Border'} Color
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={button.bgColor}
                                                            onChange={(e) => updateHeroButton(button.id, { bgColor: e.target.value })}
                                                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={button.bgColor}
                                                            onChange={(e) => updateHeroButton(button.id, { bgColor: e.target.value })}
                                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Text Color */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={button.textColor}
                                                            onChange={(e) => updateHeroButton(button.id, { textColor: e.target.value })}
                                                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={button.textColor}
                                                            onChange={(e) => updateHeroButton(button.id, { textColor: e.target.value })}
                                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Preview */}
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <span className="text-xs text-gray-500 block mb-2">Preview:</span>
                                                {button.style === 'filled' ? (
                                                    <span
                                                        className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
                                                        style={{ backgroundColor: button.bgColor, color: button.textColor }}
                                                    >
                                                        {button.text}
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="inline-block px-4 py-2 rounded-lg text-sm font-medium border-2"
                                                        style={{ borderColor: button.bgColor, color: button.textColor }}
                                                    >
                                                        {button.text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {(!formData.heroButtons || formData.heroButtons.length === 0) && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No buttons added. Click "Add Button" to create one.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                            <FileText className="w-5 h-5 text-orange-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Stats Bar</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">Add statistics to display above the Projects section</p>
                                <button
                                    type="button"
                                    onClick={addStat}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Stat
                                </button>
                            </div>
                            
                            {/* Stats Preview */}
                            <div className="bg-gray-900 rounded-lg p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(formData.stats || []).map((stat) => (
                                        <div key={stat.id} className="text-center">
                                            <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
                                            <div className="text-sm text-gray-400">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                                {(!formData.stats || formData.stats.length === 0) && (
                                    <p className="text-center text-gray-500 py-4">No stats added yet</p>
                                )}
                            </div>
                            
                            {/* Stats Editor */}
                            <div className="space-y-3">
                                {(formData.stats || []).map((stat, index) => (
                                    <div key={stat.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Value</label>
                                                <input
                                                    type="text"
                                                    value={stat.value}
                                                    onChange={(e) => updateStat(stat.id, { value: e.target.value })}
                                                    placeholder="e.g., 500+"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Label</label>
                                                <input
                                                    type="text"
                                                    value={stat.label}
                                                    onChange={(e) => updateStat(stat.id, { label: e.target.value })}
                                                    placeholder="e.g., Projects Completed"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStat(stat.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Projects Section</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    name="projectsTitle"
                                    value={formData.projectsTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Subtitle
                                </label>
                                <textarea
                                    name="projectsSubtitle"
                                    value={formData.projectsSubtitle}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Testimonials Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Testimonials Section</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    name="testimonialsTitle"
                                    value={formData.testimonialsTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Subtitle
                                </label>
                                <input
                                    type="text"
                                    name="testimonialsSubtitle"
                                    value={formData.testimonialsSubtitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Contact Section</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    name="contactTitle"
                                    value={formData.contactTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Subtitle
                                </label>
                                <textarea
                                    name="contactSubtitle"
                                    value={formData.contactSubtitle}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                            <FileText className="w-5 h-5 text-orange-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Call-to-Action Section</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CTA Title
                                </label>
                                <input
                                    type="text"
                                    name="ctaTitle"
                                    value={formData.ctaTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CTA Subtitle
                                </label>
                                <textarea
                                    name="ctaSubtitle"
                                    value={formData.ctaSubtitle}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium transition"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </form>
            </main>

            {/* Image Cropper Modal */}
            {showCropper && tempImage && (
                <ImageCropper
                    imageSrc={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspectRatio={16 / 9}
                    backgroundColor="#f9fafb"
                />
            )}
        </div>
    );
}

