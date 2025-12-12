'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Upload, X, Crop, Plus, Trash2, ExternalLink, MousePointer, Image } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useToast } from '@/components/Toast';

export interface HeroButton {
    id: string;
    text: string;
    link: string;
    isExternal: boolean;
    bgColor: string;
    textColor: string;
    style: 'filled' | 'outline';
}

export interface StatItem {
    id: string;
    value: string;
    label: string;
}

export interface HeroVideoConfig {
    videoUrl: string;
    enabled: boolean;
    playbackSpeed: number;
    objectFit: 'cover' | 'contain' | 'fill' | 'none';
    overlayColor: string;
    overlayOpacity: number;
    muted: boolean;
    loop: boolean;
}

export interface SiteContentFormData {
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

interface SiteContentFormFieldsProps {
    initialData?: SiteContentFormData;
    onFormChange?: (data: SiteContentFormData) => void;
}

export interface SiteContentFormFieldsRef {
    getFormData: () => SiteContentFormData;
}

const defaultButtons: HeroButton[] = [
    { id: 'btn_1', text: 'Start a Project', link: '#contact', isExternal: false, bgColor: '#ca8a04', textColor: '#ffffff', style: 'filled' },
    { id: 'btn_2', text: 'View Projects', link: '/projects', isExternal: false, bgColor: '#111827', textColor: '#111827', style: 'outline' },
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

export const defaultSiteContent: SiteContentFormData = {
    heroTitle: 'Premium Precast Concrete Solutions for Infrastructure',
    heroSubtitle: 'Engineering excellence meets manufacturing precision.',
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

const SiteContentFormFields = forwardRef<SiteContentFormFieldsRef, SiteContentFormFieldsProps>(
    ({ initialData, onFormChange }, ref) => {
        const toast = useToast();
        const [formData, setFormData] = useState<SiteContentFormData>(initialData || defaultSiteContent);
        const [showCropper, setShowCropper] = useState(false);
        const [tempImage, setTempImage] = useState<string | null>(null);

        useEffect(() => {
            if (initialData) {
                setFormData({ ...defaultSiteContent, ...initialData });
            }
        }, [initialData]);

        useImperativeHandle(ref, () => ({
            getFormData: () => formData,
        }));

        const updateFormData = (updates: Partial<SiteContentFormData>) => {
            const newData = { ...formData, ...updates };
            setFormData(newData);
            setTimeout(() => onFormChange?.(newData), 0);
        };

        // Hero Image handlers
        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image must be less than 10MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        };

        const handleCropComplete = (croppedImage: string) => {
            updateFormData({ heroImage: croppedImage });
            setShowCropper(false);
            setTempImage(null);
        };

        // Hero buttons handlers
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
            updateFormData({ heroButtons: [...(formData.heroButtons || []), newButton] });
        };

        const updateHeroButton = (id: string, updates: Partial<HeroButton>) => {
            const buttons = (formData.heroButtons || []).map(btn =>
                btn.id === id ? { ...btn, ...updates } : btn
            );
            updateFormData({ heroButtons: buttons });
        };

        const removeHeroButton = (id: string) => {
            updateFormData({ heroButtons: (formData.heroButtons || []).filter(btn => btn.id !== id) });
        };

        // Stats handlers
        const addStat = () => {
            const newStat: StatItem = {
                id: `stat_${Date.now()}`,
                value: '0',
                label: 'New Stat',
            };
            updateFormData({ stats: [...(formData.stats || []), newStat] });
        };

        const updateStat = (id: string, updates: Partial<StatItem>) => {
            const stats = (formData.stats || []).map(stat =>
                stat.id === id ? { ...stat, ...updates } : stat
            );
            updateFormData({ stats });
        };

        const removeStat = (id: string) => {
            updateFormData({ stats: (formData.stats || []).filter(stat => stat.id !== id) });
        };

        // Video handlers
        const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 50 * 1024 * 1024) {
                toast.error('Video must be less than 50MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                updateFormData({
                    heroVideoConfig: { ...formData.heroVideoConfig, videoUrl: reader.result as string }
                });
                toast.success('Video uploaded successfully');
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        };

        return (
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">🏠</span> Hero Section
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Hero Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                            <p className="text-xs text-gray-500 mb-2">Use color picker for video backgrounds</p>
                            <RichTextEditor
                                value={formData.heroTitle}
                                onChange={(value) => updateFormData({ heroTitle: value })}
                                placeholder="Enter hero title..."
                                minHeight="60px"
                            />
                        </div>

                        {/* Hero Subtitle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                            <RichTextEditor
                                value={formData.heroSubtitle}
                                onChange={(value) => updateFormData({ heroSubtitle: value })}
                                placeholder="Enter hero subtitle..."
                                minHeight="80px"
                            />
                        </div>

                        {/* Hero Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
                            <RichTextEditor
                                value={formData.heroDescription}
                                onChange={(value) => updateFormData({ heroDescription: value })}
                                placeholder="Enter hero description..."
                                minHeight="60px"
                            />
                        </div>

                        {/* Hero Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Image className="w-4 h-4 inline mr-1" />
                                Hero Image
                            </label>
                            {formData.heroImage ? (
                                <div className="relative">
                                    <img src={formData.heroImage} alt="Hero" className="w-full h-48 object-cover rounded-lg" />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setTempImage(formData.heroImage); setShowCropper(true); }}
                                            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                                        >
                                            <Crop className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateFormData({ heroImage: '' })}
                                            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">Click to upload</span>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            )}
                        </div>

                        {/* Video Background */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700">🎬 Background Video</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.heroVideoConfig?.enabled || false}
                                        onChange={(e) => updateFormData({
                                            heroVideoConfig: { ...formData.heroVideoConfig, enabled: e.target.checked }
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-yellow-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                    <span className="ms-2 text-sm text-gray-600">{formData.heroVideoConfig?.enabled ? 'On' : 'Off'}</span>
                                </label>
                            </div>

                            {formData.heroVideoConfig?.enabled && (
                                <div className="space-y-4">
                                    {formData.heroVideoConfig?.videoUrl ? (
                                        <div className="relative">
                                            <video src={formData.heroVideoConfig.videoUrl} className="w-full h-32 object-cover rounded-lg" muted />
                                            <button
                                                type="button"
                                                onClick={() => updateFormData({
                                                    heroVideoConfig: { ...formData.heroVideoConfig, videoUrl: '' }
                                                })}
                                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500">
                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-600">Upload video (MP4, max 50MB)</span>
                                                <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} className="hidden" />
                                            </label>
                                            <div className="text-center text-xs text-gray-400">or enter URL</div>
                                            <input
                                                type="text"
                                                placeholder="https://example.com/video.mp4"
                                                onChange={(e) => updateFormData({
                                                    heroVideoConfig: { ...formData.heroVideoConfig, videoUrl: e.target.value }
                                                })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Speed: {formData.heroVideoConfig?.playbackSpeed || 1}x</label>
                                            <input
                                                type="range" min="0.25" max="2" step="0.25"
                                                value={formData.heroVideoConfig?.playbackSpeed || 1}
                                                onChange={(e) => updateFormData({
                                                    heroVideoConfig: { ...formData.heroVideoConfig, playbackSpeed: parseFloat(e.target.value) }
                                                })}
                                                className="w-full accent-yellow-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                <span>0.25x</span>
                                                <span>1x</span>
                                                <span>2x</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                            <select
                                                value={formData.heroVideoConfig?.objectFit || 'cover'}
                                                onChange={(e) => updateFormData({
                                                    heroVideoConfig: { ...formData.heroVideoConfig, objectFit: e.target.value as any }
                                                })}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                            >
                                                <option value="cover">Cover (fill area)</option>
                                                <option value="contain">Contain (fit inside)</option>
                                                <option value="fill">Stretch to fill</option>
                                                <option value="none">Original size</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Overlay Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={formData.heroVideoConfig?.overlayColor || '#000000'}
                                                    onChange={(e) => updateFormData({
                                                        heroVideoConfig: { ...formData.heroVideoConfig, overlayColor: e.target.value }
                                                    })}
                                                    className="w-10 h-9 cursor-pointer rounded border border-gray-300"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.heroVideoConfig?.overlayColor || '#000000'}
                                                    onChange={(e) => updateFormData({
                                                        heroVideoConfig: { ...formData.heroVideoConfig, overlayColor: e.target.value }
                                                    })}
                                                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Overlay Opacity: {formData.heroVideoConfig?.overlayOpacity || 30}%</label>
                                            <input
                                                type="range" min="0" max="100" step="5"
                                                value={formData.heroVideoConfig?.overlayOpacity || 30}
                                                onChange={(e) => updateFormData({
                                                    heroVideoConfig: { ...formData.heroVideoConfig, overlayOpacity: parseInt(e.target.value) }
                                                })}
                                                className="w-full accent-yellow-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Muted and Loop options */}
                                    <div className="flex gap-6 pt-2 border-t border-gray-200">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.heroVideoConfig?.muted !== false}
                                                onChange={(e) => updateFormData({
                                                    heroVideoConfig: { ...formData.heroVideoConfig, muted: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Muted</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.heroVideoConfig?.loop !== false}
                                                onChange={(e) => updateFormData({
                                                    heroVideoConfig: { ...formData.heroVideoConfig, loop: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Loop</span>
                                        </label>
                                    </div>

                                    {/* Video Preview */}
                                    {formData.heroVideoConfig?.videoUrl && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Preview (Speed: {formData.heroVideoConfig.playbackSpeed || 1}x)</label>
                                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                                                <video
                                                    key={`video-${formData.heroVideoConfig.playbackSpeed}`}
                                                    src={formData.heroVideoConfig.videoUrl}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="w-full h-full"
                                                    style={{ objectFit: formData.heroVideoConfig.objectFit || 'cover' }}
                                                    onLoadedData={(e) => {
                                                        const video = e.currentTarget;
                                                        video.playbackRate = formData.heroVideoConfig?.playbackSpeed || 1;
                                                    }}
                                                    onCanPlay={(e) => {
                                                        const video = e.currentTarget;
                                                        video.playbackRate = formData.heroVideoConfig?.playbackSpeed || 1;
                                                    }}
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
                                <label className="text-sm font-medium text-gray-700">
                                    <MousePointer className="w-4 h-4 inline mr-1" />
                                    Hero Buttons
                                </label>
                                <button type="button" onClick={addHeroButton} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(formData.heroButtons || []).map((button, idx) => (
                                    <div key={button.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-medium text-gray-600">Button {idx + 1}</span>
                                            <button type="button" onClick={() => removeHeroButton(button.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text" placeholder="Text" value={button.text}
                                                onChange={(e) => updateHeroButton(button.id, { text: e.target.value })}
                                                className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                            />
                                            <input
                                                type="text" placeholder="Link" value={button.link}
                                                onChange={(e) => updateHeroButton(button.id, { link: e.target.value })}
                                                className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                            />
                                            <select
                                                value={button.style}
                                                onChange={(e) => updateHeroButton(button.id, { style: e.target.value as any })}
                                                className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                            >
                                                <option value="filled">Filled</option>
                                                <option value="outline">Outline</option>
                                            </select>
                                            <div className="flex gap-1">
                                                <input
                                                    type="color" value={button.bgColor}
                                                    onChange={(e) => updateHeroButton(button.id, { bgColor: e.target.value })}
                                                    className="w-8 h-8 cursor-pointer rounded"
                                                    title="Background"
                                                />
                                                <input
                                                    type="color" value={button.textColor}
                                                    onChange={(e) => updateHeroButton(button.id, { textColor: e.target.value })}
                                                    className="w-8 h-8 cursor-pointer rounded"
                                                    title="Text"
                                                />
                                                <label className="flex items-center gap-1 text-xs text-gray-600">
                                                    <input
                                                        type="checkbox" checked={button.isExternal}
                                                        onChange={(e) => updateHeroButton(button.id, { isExternal: e.target.checked })}
                                                        className="w-3 h-3"
                                                    />
                                                    <ExternalLink className="w-3 h-3" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">📊 Stats Bar</h2>
                        <button type="button" onClick={addStat} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                            <Plus className="w-4 h-4" /> Add Stat
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {(formData.stats || []).map((stat) => (
                            <div key={stat.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50 relative">
                                <button
                                    type="button"
                                    onClick={() => removeStat(stat.id)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                <input
                                    type="text" placeholder="Value" value={stat.value}
                                    onChange={(e) => updateStat(stat.id, { value: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded mb-2 font-bold bg-white text-gray-900"
                                />
                                <input
                                    type="text" placeholder="Label" value={stat.label}
                                    onChange={(e) => updateStat(stat.id, { label: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Titles */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Section Titles</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Projects Title</label>
                                <input
                                    type="text" value={formData.projectsTitle}
                                    onChange={(e) => updateFormData({ projectsTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Projects Subtitle</label>
                                <input
                                    type="text" value={formData.projectsSubtitle}
                                    onChange={(e) => updateFormData({ projectsSubtitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Testimonials Title</label>
                                <input
                                    type="text" value={formData.testimonialsTitle}
                                    onChange={(e) => updateFormData({ testimonialsTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Testimonials Subtitle</label>
                                <input
                                    type="text" value={formData.testimonialsSubtitle}
                                    onChange={(e) => updateFormData({ testimonialsSubtitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Title</label>
                                <input
                                    type="text" value={formData.contactTitle}
                                    onChange={(e) => updateFormData({ contactTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Subtitle</label>
                                <input
                                    type="text" value={formData.contactSubtitle}
                                    onChange={(e) => updateFormData({ contactSubtitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Title</label>
                                <input
                                    type="text" value={formData.ctaTitle}
                                    onChange={(e) => updateFormData({ ctaTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Subtitle</label>
                                <input
                                    type="text" value={formData.ctaSubtitle}
                                    onChange={(e) => updateFormData({ ctaSubtitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Cropper Modal */}
                {showCropper && tempImage && (
                    <ImageCropper
                        imageSrc={tempImage}
                        onCropComplete={handleCropComplete}
                        onCancel={() => { setShowCropper(false); setTempImage(null); }}
                        aspectRatio={16 / 9}
                    />
                )}
            </div>
        );
    }
);

SiteContentFormFields.displayName = 'SiteContentFormFields';

export default SiteContentFormFields;

