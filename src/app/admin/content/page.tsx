'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
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
    Home
} from 'lucide-react';
import SiteContentFormFields, { 
    SiteContentFormData, 
    SiteContentFormFieldsRef,
    defaultSiteContent 
} from '@/components/admin/SiteContentFormFields';
import SiteContentPreview from '@/components/admin/SiteContentPreview';
import { getApiUrl, getPublicSiteId } from '@/lib/env';
import { useToast } from '@/components/Toast';

interface ActivityItem {
    id: string;
    action: string;
    timestamp: Date;
    details?: string;
}

export default function SiteContentPage() {
    const router = useRouter();
    const toast = useToast();
    const formRef = useRef<SiteContentFormFieldsRef | null>(null);
    
    const API_URL = getApiUrl();
    const SITE_ID = getPublicSiteId();
    
    const [contentId, setContentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingDraft, setSavingDraft] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const [status, setStatus] = useState<string>('draft');
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [showPreview, setShowPreview] = useState(true);
    const [previewData, setPreviewData] = useState<SiteContentFormData>(defaultSiteContent);
    const [initialData, setInitialData] = useState<SiteContentFormData | undefined>(undefined);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/site-content?status=all`);
                if (response.ok) {
                    const data = await response.json();
                    const content = data.data?.content?.[0];
                    if (content) {
                        setContentId(content.contentId);
                        setStatus(content.status || 'draft');
                        
                        // Check for draft data
                        const hasDraftData = content.hasDraft && content.draftData;
                        setHasDraft(hasDraftData);
                        
                        // Use draft data if available, otherwise use published data
                        const editData = hasDraftData ? content.draftData : content.data;
                        const formData = {
                            ...defaultSiteContent,
                            ...editData,
                        };
                        
                        setInitialData(formData);
                        setPreviewData(formData);
                        
                        // Build activity
                        const activityItems: ActivityItem[] = [];
                        if (content.createdAt) {
                            activityItems.push({
                                id: 'created',
                                action: 'Content created',
                                timestamp: new Date(content.createdAt),
                            });
                        }
                        if (content.updatedAt && content.updatedAt !== content.createdAt) {
                            activityItems.push({
                                id: 'updated',
                                action: 'Last modified',
                                timestamp: new Date(content.updatedAt),
                            });
                        }
                        if (content.publishedAt) {
                            activityItems.push({
                                id: 'published',
                                action: 'Published',
                                timestamp: new Date(content.publishedAt),
                            });
                        }
                        if (hasDraftData) {
                            activityItems.unshift({
                                id: 'draft',
                                action: 'Unpublished changes',
                                timestamp: new Date(),
                                details: 'Draft saved. Publish to make changes live.',
                            });
                        }
                        setActivity(activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
                    } else {
                        setInitialData(defaultSiteContent);
                        setPreviewData(defaultSiteContent);
                    }
                }
            } catch (error) {
                console.error('Error fetching site content:', error);
                setInitialData(defaultSiteContent);
                setPreviewData(defaultSiteContent);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [API_URL, SITE_ID]);

    const handleFormChange = (data: SiteContentFormData) => {
        setPreviewData(data);
        setHasUnsavedChanges(true);
    };

    const handleSaveDraft = async () => {
        if (!formRef.current) return;
        
        const formData = formRef.current.getFormData();
        setSavingDraft(true);

        try {
            const method = contentId ? 'PUT' : 'POST';
            const url = contentId 
                ? `${API_URL}/cms/${SITE_ID}/content/site-content/${contentId}`
                : `${API_URL}/cms/${SITE_ID}/content/site-content`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Site Content',
                    data: formData,
                    status: 'draft',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save draft');
            }

            const result = await response.json();
            if (!contentId && result.data?.contentId) {
                setContentId(result.data.contentId);
            }
            
            setHasUnsavedChanges(false);
            setHasDraft(status === 'published');
            
            const newActivity: ActivityItem = {
                id: `draft_${Date.now()}`,
                action: status === 'published' ? 'Unpublished changes' : 'Saved as draft',
                timestamp: new Date(),
                details: status === 'published' ? 'Draft saved. Publish to make changes live.' : undefined,
            };
            setActivity(prev => {
                const filtered = prev.filter(a => a.action !== 'Unpublished changes');
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
            const method = contentId ? 'PUT' : 'POST';
            const url = contentId 
                ? `${API_URL}/cms/${SITE_ID}/content/site-content/${contentId}`
                : `${API_URL}/cms/${SITE_ID}/content/site-content`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Site Content',
                    data: formData,
                    status: 'published',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to publish');
            }

            const result = await response.json();
            if (!contentId && result.data?.contentId) {
                setContentId(result.data.contentId);
            }
            
            setStatus('published');
            setHasDraft(false);
            setHasUnsavedChanges(false);
            
            const newActivity: ActivityItem = {
                id: `published_${Date.now()}`,
                action: 'Published',
                timestamp: new Date(),
            };
            setActivity(prev => {
                const filtered = prev.filter(a => a.action !== 'Unpublished changes');
                return [newActivity, ...filtered];
            });
            
            toast.success('Content published successfully!');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    const handlePreviewNewTab = () => {
        window.open('/', '_blank');
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
        if (action.includes('Unpublished')) return <AlertCircle className="w-4 h-4 text-blue-500" />;
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
                    <p className="text-gray-600">Loading content...</p>
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
                        href="/admin/dashboard"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Page Content
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {status}
                        </span>
                        {hasDraft && (
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
                    <button
                        onClick={handlePreviewNewTab}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        Open Home Page
                    </button>

                    <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || publishing}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                    >
                        {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Draft
                    </button>

                    <button
                        onClick={handlePublish}
                        disabled={savingDraft || publishing}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                    >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                                <div key={item.id} className="flex gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getActivityIcon(item.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900">{item.action}</p>
                                        {item.details && (
                                            <p className="text-[10px] text-gray-500">{item.details}</p>
                                        )}
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(item.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 text-center py-4">No activity yet</p>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 ml-64 ${showPreview ? 'mr-[calc(50vw-128px)]' : ''} transition-all duration-300`}>
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Edit Page Content</h1>
                            <p className="text-sm text-gray-500">Update your home page content below</p>
                        </div>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
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
                </header>

                {/* Form Content */}
                <div className="p-6 pr-0">
                    <div className="mr-6">
                        <SiteContentFormFields
                            ref={formRef}
                            initialData={initialData}
                            onFormChange={handleFormChange}
                        />
                    </div>
                </div>
            </div>

            {/* Right Preview Panel - Fixed */}
            {showPreview && (
                <aside className="w-[calc(50vw-128px)] bg-gray-50 border-l border-gray-200 fixed right-0 top-0 h-full z-20 flex flex-col">
                    <SiteContentPreview data={previewData} />
                </aside>
            )}
        </div>
    );
}
