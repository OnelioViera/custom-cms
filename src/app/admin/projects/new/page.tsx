'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Save, 
    Send, 
    Loader2, 
    FileEdit,
    Info
} from 'lucide-react';
import ProjectFormFields from '@/components/admin/ProjectFormFields';
import { useToast } from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

export default function NewProjectPage() {
    const router = useRouter();
    const toast = useToast();
    const formRef = useRef<{ getFormData: () => any } | null>(null);
    
    const [savingDraft, setSavingDraft] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const handleSaveDraft = async () => {
        if (!formRef.current) return;
        
        const formData = formRef.current.getFormData();
        
        if (!formData.title || !formData.data?.client || !formData.data?.shortDescription) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        setSavingDraft(true);

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects`, {
                method: 'POST',
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

            toast.success('Draft saved successfully!');
            router.push('/admin/dashboard?tab=projects');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save draft');
        } finally {
            setSavingDraft(false);
        }
    };

    const handlePublish = async () => {
        if (!formRef.current) return;
        
        const formData = formRef.current.getFormData();
        
        if (!formData.title || !formData.data?.client || !formData.data?.shortDescription) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        setPublishing(true);

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects`, {
                method: 'POST',
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

            toast.success('Project published successfully!');
            router.push('/admin/dashboard?tab=projects');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar - Stationary */}
            <aside className="w-72 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-20 flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                    <Link
                        href="/admin/dashboard?tab=projects"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Projects</span>
                    </Link>
                    <h2 className="text-lg font-bold text-gray-900">New Project</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Not saved
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-3 border-b border-gray-200">
                    {/* Save Draft Button */}
                    <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || publishing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50"
                    >
                        {savingDraft ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save as Draft
                    </button>

                    {/* Publish Button */}
                    <button
                        onClick={handlePublish}
                        disabled={savingDraft || publishing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                    >
                        {publishing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Publish
                    </button>
                </div>

                {/* Tips Section */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Tips
                    </h3>
                    
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="flex gap-3">
                            <FileEdit className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p>Fill in the required fields marked with *</p>
                        </div>
                        <div className="flex gap-3">
                            <Save className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p>Save as draft to continue editing later</p>
                        </div>
                        <div className="flex gap-3">
                            <Send className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p>Publish to make the project visible on your website</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-8 py-4">
                        <h1 className="text-xl font-bold text-gray-900">Create New Project</h1>
                        <p className="text-sm text-gray-500">Add a new project to your portfolio</p>
                    </div>
                </header>

                {/* Form Content */}
                <div className="p-8">
                    <div className="max-w-3xl">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
                            <ProjectFormFields
                                ref={formRef}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
