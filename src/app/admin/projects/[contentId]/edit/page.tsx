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
    PanelRightOpen
} from 'lucide-react';
import ProjectFormFields, { FormDataType } from '@/components/admin/ProjectFormFields';
import ProjectPreview from '@/components/admin/ProjectPreview';
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

export default function EditProjectPage({ params }: PageProps) {
    const router = useRouter();
    const toast = useToast();
    const formRef = useRef<{ getFormData: () => any } | null>(null);
    
    const [contentId, setContentId] = useState<string>('');
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingDraft, setSavingDraft] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [showPreview, setShowPreview] = useState(true);
    const [previewData, setPreviewData] = useState<FormDataType>({
        title: '',
        client: '',
        location: '',
        projectSize: '',
        capacity: '',
        shortDescription: '',
        description: '',
        challenges: '',
        results: '',
        projectImage: '',
    });

    useEffect(() => {
        const loadProject = async () => {
            const { contentId: id } = await params;
            setContentId(id);

            try {
                const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${id}`);
                if (!response.ok) {
                    toast.error('Project not found');
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                setProject(data.data);
                
                // Initialize preview data
                setPreviewData({
                    title: data.data.title || '',
                    client: data.data.data?.client || '',
                    location: data.data.data?.location || '',
                    projectSize: data.data.data?.projectSize || '',
                    capacity: data.data.data?.capacity || '',
                    shortDescription: data.data.data?.shortDescription || '',
                    description: data.data.data?.description || '',
                    challenges: data.data.data?.challenges || '',
                    results: data.data.data?.results || '',
                    projectImage: data.data.data?.projectImage || '',
                });
                
                // Build activity from project data
                const activityItems: ActivityItem[] = [];
                
                if (data.data.createdAt) {
                    activityItems.push({
                        id: 'created',
                        action: 'Project created',
                        timestamp: new Date(data.data.createdAt),
                    });
                }
                
                if (data.data.updatedAt && data.data.updatedAt !== data.data.createdAt) {
                    activityItems.push({
                        id: 'updated',
                        action: 'Last modified',
                        timestamp: new Date(data.data.updatedAt),
                    });
                }
                
                if (data.data.publishedAt) {
                    activityItems.push({
                        id: 'published',
                        action: 'Published',
                        timestamp: new Date(data.data.publishedAt),
                    });
                }
                
                // Sort by timestamp descending (most recent first)
                activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                setActivity(activityItems);
                
            } catch (err) {
                toast.error('Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [params, toast]);

    const handleFormChange = (data: FormDataType) => {
        setPreviewData(data);
        setHasUnsavedChanges(true);
    };

    const handleSaveDraft = async () => {
        if (!formRef.current) return;
        
        const formData = formRef.current.getFormData();
        setSavingDraft(true);

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${contentId}`, {
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

            const updatedProject = await response.json();
            setProject(updatedProject.data);
            setHasUnsavedChanges(false);
            
            // Add activity
            const newActivity: ActivityItem = {
                id: `draft_${Date.now()}`,
                action: 'Saved as draft',
                timestamp: new Date(),
            };
            setActivity(prev => [newActivity, ...prev]);
            
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
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${contentId}`, {
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

            const updatedProject = await response.json();
            setProject(updatedProject.data);
            setHasUnsavedChanges(false);
            
            // Add activity
            const newActivity: ActivityItem = {
                id: `published_${Date.now()}`,
                action: 'Published',
                timestamp: new Date(),
            };
            setActivity(prev => [newActivity, ...prev]);
            
            toast.success('Project published successfully!');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    const handlePreviewNewTab = () => {
        window.open(`/projects/${contentId}`, '_blank');
    };

    const handleDeleteProject = async () => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${contentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to delete project');
                return;
            }

            toast.success('Project deleted successfully!');
            router.push('/admin/dashboard?tab=projects');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete project');
        } finally {
            setDeleting(false);
        }
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
                    <p className="text-gray-600">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
                    <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
                    <Link
                        href="/admin/dashboard?tab=projects"
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                        Back to Projects
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
                        href="/admin/dashboard?tab=projects"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Projects</span>
                    </Link>
                    <h2 className="text-base font-bold text-gray-900 truncate">{project?.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            project?.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : project?.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                        }`}>
                            {project?.status || 'draft'}
                        </span>
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
                                <div key={item.id} className="flex gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getActivityIcon(item.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900">{item.action}</p>
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

                {/* Delete Button */}
                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={handleDeleteProject}
                        disabled={deleting}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium disabled:opacity-50"
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Delete Project
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 ml-64 ${showPreview ? 'mr-[500px]' : ''} transition-all duration-300`}>
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Edit Project</h1>
                            <p className="text-sm text-gray-500">Update your project details below</p>
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
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mr-6">
                        <ProjectFormFields
                            ref={formRef}
                            initialData={project}
                            onFormChange={handleFormChange}
                        />
                    </div>
                </div>
            </div>

            {/* Right Preview Panel - Fixed */}
            {showPreview && (
                <aside className="w-[500px] bg-gray-50 border-l border-gray-200 fixed right-0 top-0 h-full z-20 flex flex-col">
                    <ProjectPreview data={previewData} />
                </aside>
            )}
        </div>
    );
}
