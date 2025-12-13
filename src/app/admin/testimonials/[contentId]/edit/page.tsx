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

                // If there's draft data, use that for editing
                const hasDraft = testimonialData.hasDraft && testimonialData.draftData;
                const editData = hasDraft ? testimonialData.draftData : testimonialData.data;

                const testimonialForForm = {
                    ...testimonialData,
                    data: editData || testimonialData.data,
                };

                setTestimonial(testimonialForForm);

                // Initialize preview data
                setPreviewData({
                    quote: editData?.quote || '',
                    authorName: editData?.authorName || '',
                    authorTitle: editData?.authorTitle || '',
                    authorCompany: editData?.authorCompany || '',
                    authorImage: editData?.authorImage || '',
                    rating: editData?.rating || 5,
                    featured: editData?.featured || false,
                });

                // Build activity
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
                    <span className="text-gray-600">Loading testimonial...</span>
                </div>
            </div>
        );
    }

    if (!testimonial) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Testimonial not found</h2>
                    <Link href="/admin/testimonials" className="text-yellow-600 hover:text-yellow-700">
                        Back to testimonials
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <Link
                        href="/admin/testimonials"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to testimonials
                    </Link>
                    <h1 className="font-semibold text-gray-900 truncate">
                        {previewData.authorName || 'Edit Testimonial'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                testimonial.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                            {testimonial.status === 'published' ? (
                                <CheckCircle className="w-3 h-3" />
                            ) : (
                                <FileEdit className="w-3 h-3" />
                            )}
                            {testimonial.status}
                        </span>
                        {testimonial.hasDraft && (
                            <span className="text-xs text-orange-600 font-medium">• Draft</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-3 border-b border-gray-200">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>

                    <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 font-medium text-sm transition disabled:opacity-50"
                    >
                        {savingDraft ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Draft
                    </button>

                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium text-sm transition disabled:opacity-50"
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
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Activity</h3>
                    <div className="space-y-3">
                        {activity.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    {item.action === 'Published' ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : item.action === 'Unpublished changes' ? (
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                    <p className="text-xs text-gray-500">
                                        {item.timestamp.toLocaleDateString()} at{' '}
                                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {item.details && (
                                        <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delete Button */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition disabled:opacity-50"
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
            <main className={`flex-1 ml-64 ${showPreview ? 'mr-[400px]' : ''} transition-all duration-300`}>
                <div className="p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Edit Testimonial</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Update the testimonial details below
                                </p>
                            </div>

                            <div className="p-6">
                                <TestimonialFormFields
                                    ref={formRef}
                                    initialData={testimonial}
                                    onFormChange={handleFormChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Preview Panel */}
            {showPreview && (
                <aside className="w-[400px] bg-gray-50 border-l border-gray-200 fixed right-0 top-0 h-full overflow-hidden">
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <h3 className="font-medium text-gray-900">Preview</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <PanelRightClose className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <TestimonialPreview data={previewData} />
                        </div>
                    </div>
                </aside>
            )}

            {/* Show Preview Button when hidden */}
            {!showPreview && (
                <button
                    onClick={() => setShowPreview(true)}
                    className="fixed right-4 top-4 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 z-20"
                    title="Show Preview"
                >
                    <PanelRightOpen className="w-5 h-5 text-gray-600" />
                </button>
            )}
        </div>
    );
}

