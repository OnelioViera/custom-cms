'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Loader2,
    Eye,
    Save,
    Send,
    PanelRightClose,
    PanelRightOpen,
} from 'lucide-react';
import TestimonialFormFields, { TestimonialFormDataType } from '@/components/admin/TestimonialFormFields';
import TestimonialPreview from '@/components/admin/TestimonialPreview';
import { useToast } from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

const DEFAULT_PREVIEW_DATA: TestimonialFormDataType = {
    quote: '',
    authorName: '',
    authorTitle: '',
    authorCompany: '',
    authorImage: '',
    rating: 5,
    featured: false,
};

export default function NewTestimonialPage() {
    const router = useRouter();
    const toast = useToast();
    const formRef = useRef<{ getFormData: () => any } | null>(null);

    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [previewData, setPreviewData] = useState<TestimonialFormDataType>(DEFAULT_PREVIEW_DATA);

    const handleFormChange = (data: TestimonialFormDataType) => {
        setPreviewData(data);
    };

    const generateContentId = () => {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `testimonial-${timestamp}-${randomStr}`;
    };

    const handleSaveDraft = async () => {
        if (!formRef.current) return;

        const formData = formRef.current.getFormData();

        if (!formData.data.authorName) {
            toast.error('Please enter an author name');
            return;
        }

        setSaving(true);

        try {
            const contentId = generateContentId();
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId,
                    ...formData,
                    status: 'draft',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to save draft');
                return;
            }

            toast.success('Testimonial saved as draft!');
            router.push(`/admin/testimonials/${contentId}/edit`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!formRef.current) return;

        const formData = formRef.current.getFormData();

        if (!formData.data.authorName) {
            toast.error('Please enter an author name');
            return;
        }

        if (!formData.data.quote) {
            toast.error('Please enter a testimonial quote');
            return;
        }

        setPublishing(true);

        try {
            const contentId = generateContentId();
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId,
                    ...formData,
                    status: 'published',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to publish');
                return;
            }

            toast.success('Testimonial published successfully!');
            router.push('/admin/testimonials');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

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
                    <h1 className="font-semibold text-gray-900">New Testimonial</h1>
                    <p className="text-xs text-gray-500 mt-1">Create a new customer testimonial</p>
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
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 font-medium text-sm transition disabled:opacity-50"
                    >
                        {saving ? (
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

                {/* Tips */}
                <div className="flex-1 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Tips</h3>
                    <ul className="space-y-2 text-xs text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            Keep testimonials concise and impactful
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            Include the author&apos;s title for credibility
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            Featured testimonials appear first on the homepage
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ml-64 ${showPreview ? 'mr-[400px]' : ''} transition-all duration-300`}>
                <div className="p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Create Testimonial</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Add a new customer testimonial to showcase on your website
                                </p>
                            </div>

                            <div className="p-6">
                                <TestimonialFormFields
                                    ref={formRef}
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

