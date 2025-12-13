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
    Clock,
    PanelRightClose,
    PanelRightOpen,
} from 'lucide-react';
import TeamMemberFormFields, { TeamMemberFormDataType } from '@/components/admin/TeamMemberFormFields';
import TeamMemberPreview from '@/components/admin/TeamMemberPreview';
import { useToast } from '@/components/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

const DEFAULT_PREVIEW_DATA: TeamMemberFormDataType = {
    name: '',
    role: '',
    description: '',
    avatar: '',
    order: 0,
};

export default function NewTeamMemberPage() {
    const router = useRouter();
    const toast = useToast();
    const formRef = useRef<{ getFormData: () => any } | null>(null);

    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [previewData, setPreviewData] = useState<TeamMemberFormDataType>(DEFAULT_PREVIEW_DATA);

    const handleFormChange = (data: TeamMemberFormDataType) => {
        setPreviewData(data);
    };

    const generateContentId = () => {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `team-${timestamp}-${randomStr}`;
    };

    const handleSaveDraft = async () => {
        if (!formRef.current) return;

        const formData = formRef.current.getFormData();

        if (!formData.data.name) {
            toast.error('Please enter a name');
            return;
        }

        setSaving(true);

        try {
            const contentId = generateContentId();
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/team`, {
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

            toast.success('Team member saved as draft!');
            router.push(`/admin/team/${contentId}/edit`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!formRef.current) return;

        const formData = formRef.current.getFormData();

        if (!formData.data.name) {
            toast.error('Please enter a name');
            return;
        }

        if (!formData.data.role) {
            toast.error('Please enter a role');
            return;
        }

        setPublishing(true);

        try {
            const contentId = generateContentId();
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/team`, {
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

            toast.success('Team member published successfully!');
            router.push('/admin/team');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    const handlePreviewNewTab = () => {
        window.open('/#team', '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar - Stationary */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-20 flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                    <Link
                        href="/admin/team"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Team</span>
                    </Link>
                    <h2 className="text-base font-bold text-gray-900">New Team Member</h2>
                    <p className="text-xs text-gray-500 mt-1">Add a new team member to the carousel</p>
                </div>

                {/* Action Buttons */}
                <div className="p-3 space-y-2 border-b border-gray-200">
                    <button
                        onClick={handlePreviewNewTab}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        Open in New Tab
                    </button>

                    <button
                        onClick={handleSaveDraft}
                        disabled={saving || publishing}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
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
                        disabled={saving || publishing}
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

                {/* Activity Section - Empty for new */}
                <div className="flex-1 overflow-y-auto p-3">
                    <h3 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <Clock className="w-3 h-3" />
                        Activity
                    </h3>
                    <p className="text-sm text-gray-500">No activity yet</p>
                </div>
            </aside>

            {/* Main Content Area - Form and Preview side by side */}
            <div className="flex-1 ml-64 flex">
                {/* Form Section */}
                <main className={`${showPreview ? 'w-1/2' : 'flex-1'} transition-all duration-300 overflow-y-auto h-screen`}>
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Add Team Member</h1>
                                <p className="text-gray-600">Add a new team member to display in the carousel</p>
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
                                <TeamMemberFormFields
                                    ref={formRef}
                                    onFormChange={handleFormChange}
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Preview Panel - Equal width */}
                {showPreview && (
                    <aside className="w-1/2 bg-white border-l border-gray-200 h-screen overflow-hidden">
                        <TeamMemberPreview data={previewData} />
                    </aside>
                )}
            </div>
        </div>
    );
}

