'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Trash2,
    Loader2,
    Eye,
    Save,
    Send,
    Clock,
    Calendar,
    CheckCircle,
    FileEdit,
    AlertCircle,
    PanelRightClose,
    PanelRightOpen,
} from 'lucide-react';
import TestimonialFormFields, { TestimonialFormDataType } from '@/components/admin/TestimonialFormFields';
import TestimonialPreview from '@/components/admin/TestimonialPreview';
import { useToast } from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

interface ActivityItem {
    id: string;
    action: string;
    timestamp: Date;
    details?: string;
}

interface PageProps {
    params: Promise<{ contentId: string }>;
}

const DEFAULT_PREVIEW_DATA: TestimonialFormDataType = {
    quote: '',
    authorName: '',
    authorTitle: '',
    authorCompany: '',
    authorImage: '',
    rating: 5,
    featured: false,
};

export default function EditTestimonialPage({ params }: PageProps) {
    const router = useRouter();
    const toast = useToast();
    const formRef = useRef<{ getFormData: () => any } | null>(null);

    const [contentId, setContentId] = useState<string>('');
    const [testimonial, setTestimonial] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingDraft, setSavingDraft] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [showPreview, setShowPreview] = useState(true);
    const [previewData, setPreviewData] = useState<TestimonialFormDataType>(DEFAULT_PREVIEW_DATA);

    useEffect(() => {
        const loadTestimonial = async () => {
            const { contentId: id } = await params;
            setContentId(id);

            try {
                const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials/${id}`);
                if (!response.ok) {
                    toast.error('Testimonial not found');
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                const testimonialData = data.data;

                const hasDraft = testimonialData.hasDraft && testimonialData.draftData;
                const editData = hasDraft ? testimonialData.draftData : testimonialData.data;

                const testimonialForForm = {
                    ...testimonialData,
                    data: editData || testimonialData.data,
                };

                setTestimonial(testimonialForForm);

                setPreviewData({
                    quote: editData?.quote || '',
                    authorName: editData?.authorName || '',
                    authorTitle: editData?.authorTitle || '',
                    authorCompany: editData?.authorCompany || '',
                    authorImage: editData?.authorImage || '',
                    rating: editData?.rating || 5,
                    featured: editData?.featured || false,
                });

                const activityItems: ActivityItem[] = [];

                if (testimonialData.createdAt) {
                    activityItems.push({
                        id: 'created',
                        action: 'Testimonial created',
                        timestamp: new Date(testimonialData.createdAt),
                    });
                }

                if (testimonialData.updatedAt && testimonialData.updatedAt !== testimonialData.createdAt) {
                    activityItems.push({
                        id: 'updated',
                        action: 'Last modified',
                        timestamp: new Date(testimonialData.updatedAt),
                    });
                }

                if (testimonialData.publishedAt) {
                    activityItems.push({
                        id: 'published',
                        action: 'Published',
                        timestamp: new Date(testimonialData.publishedAt),
                    });
                }

                if (hasDraft) {
                    activityItems.unshift({
                        id: 'draft_pending',
                        action: 'Unpublished changes',
                        timestamp: new Date(testimonialData.updatedAt),
                        details: 'Draft changes waiting to be published',
                    });
                }

                activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                setActivity(activityItems);
            } catch (err) {
                toast.error('Failed to load testimonial');
            } finally {
                setLoading(false);
            }
        };

        loadTestimonial();
    }, [params, toast]);

    const handleFormChange = (data: TestimonialFormDataType) => {
        setPreviewData(data);
        setHasUnsavedChanges(true);
    };

    const handleSaveDraft = async () => {
        if (!formRef.current) return;

        const formData = formRef.current.getFormData();
        setSavingDraft(true);

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials/${contentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status: 'draft',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to save draft');
                return;
            }

            const updatedTestimonial = await response.json();
            setTestimonial({
                ...updatedTestimonial.data,
                hasDraft: updatedTestimonial.data.hasDraft || updatedTestimonial.data.status === 'published',
            });
            setHasUnsavedChanges(false);

            const isPublished = updatedTestimonial.data.status === 'published';
            const newActivity: ActivityItem = {
                id: `draft_${Date.now()}`,
                action: isPublished ? 'Unpublished changes' : 'Saved as draft',
                timestamp: new Date(),
                details: isPublished ? 'Draft saved. Publish to make changes live.' : undefined,
            };
            setActivity((prev) => {
                const filtered = prev.filter((a) => a.action !== 'Unpublished changes');
                return [newActivity, ...filtered];
            });

            toast.success('Draft saved successfully!');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save draft');
        } finally {
            setSavingDraft(false);
        }
    };

    const handlePublish = async () => {
        if (!formRef.current) return;

        const formData = formRef.current.getFormData();
        setPublishing(true);

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials/${contentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status: 'published',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to publish');
                return;
            }

            const updatedTestimonial = await response.json();
            setTestimonial({
                ...updatedTestimonial.data,
                hasDraft: false,
            });
            setHasUnsavedChanges(false);

            setActivity((prev) => {
                const filtered = prev.filter((a) => a.action !== 'Unpublished changes');
                return [
                    {
                        id: `published_${Date.now()}`,
                        action: 'Published',
                        timestamp: new Date(),
                    },
                    ...filtered,
                ];
            });

            toast.success('Testimonial published successfully!');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials/${contentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to delete');
                return;
            }

            toast.success('Testimonial deleted successfully!');
            router.push('/admin/testimonials');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const handlePreviewNewTab = () => {
        window.open('/#testimonials', '_blank');
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    const getActivityIcon = (action: string) => {
        if (action.includes('Unpublished changes')) return <AlertCircle className="w-4 h-4 text-blue-500" />;
        if (action.includes('created')) return <FileEdit className="w-4 h-4 text-blue-500" />;
        if (action.includes('Published')) return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (action.includes('draft')) return <Save className="w-4 h-4 text-yellow-500" />;
        if (action.includes('modified')) return <Clock className="w-4 h-4 text-gray-500" />;
        return <Clock className="w-4 h-4 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-yellow-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading testimonial...</p>
                </div>
            </div>
        );
    }

    if (!testimonial && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Testimonial Not Found</h1>
                    <p className="text-gray-600 mb-6">The testimonial you&apos;re looking for doesn&apos;t exist.</p>
                    <Link
                        href="/admin/testimonials"
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                        Back to Testimonials
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar - Stationary */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-20 flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                    <Link
                        href="/admin/testimonials"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Testimonials</span>
                    </Link>
                    <h2 className="text-base font-bold text-gray-900 truncate">
                        {previewData.authorName || 'Edit Testimonial'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            testimonial?.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : testimonial?.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                        }`}>
                            {testimonial?.status || 'draft'}
                        </span>
                        {testimonial?.hasDraft && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <FileEdit className="w-3 h-3" />
                                Has draft
                            </span>
                        )}
                        {hasUnsavedChanges && (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                                <AlertCircle className="w-3 h-3" />
                                Unsaved
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 space-y-2 border-b border-gray-200">
                    {/* Preview in New Tab Button */}
                    <button
                        onClick={handlePreviewNewTab}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        Open in New Tab
                    </button>

                    {/* Save Draft Button */}
                    <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || publishing}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                    >
                        {savingDraft ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Draft
                    </button>

                    {/* Publish Button */}
                    <button
                        onClick={handlePublish}
                        disabled={savingDraft || publishing}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                    >
                        {publishing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Publish
                    </button>
                </div>

                {/* Activity Log */}
                <div className="flex-1 overflow-y-auto p-3">
                    <h3 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <Clock className="w-3 h-3" />
                        Activity
                    </h3>
                    
                    {activity.length > 0 ? (
                        <div className="space-y-3">
                            {activity.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getActivityIcon(item.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(item.timestamp)}
                                        </div>
                                        {item.details && (
                                            <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No activity yet</p>
                    )}
                </div>

                {/* Delete Button */}
                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium disabled:opacity-50"
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Delete Testimonial
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ml-64 transition-all duration-300 ${showPreview ? 'mr-[450px]' : ''}`}>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Testimonial</h1>
                            <p className="text-gray-600">Update the testimonial details below</p>
                        </div>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition text-sm"
                        >
                            {showPreview ? (
                                <>
                                    <PanelRightClose className="w-4 h-4" />
                                    Hide Preview
                                </>
                            ) : (
                                <>
                                    <PanelRightOpen className="w-4 h-4" />
                                    Show Preview
                                </>
                            )}
                        </button>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <TestimonialFormFields
                                ref={formRef}
                                initialData={testimonial}
                                onFormChange={handleFormChange}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Preview Panel */}
            {showPreview && (
                <aside className="w-[450px] bg-white border-l border-gray-200 fixed right-0 top-0 h-full overflow-hidden">
                    <TestimonialPreview data={previewData} />
                </aside>
            )}
        </div>
    );
}
