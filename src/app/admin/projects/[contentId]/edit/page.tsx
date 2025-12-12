'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import ProjectForm from '@/components/admin/ProjectForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

interface PageProps {
    params: Promise<{ contentId: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
    const router = useRouter();
    const [contentId, setContentId] = useState<string>('');
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProject = async () => {
            const { contentId: id } = await params;
            setContentId(id);

            try {
                const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${id}`);
                if (!response.ok) {
                    setError('Project not found');
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                setProject(data.data);
            } catch (err) {
                setError('Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [params]);

    const handleUpdateProject = async (formData: any) => {
        setSaving(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${contentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update project');
                setSaving(false);
                return;
            }

            router.push('/admin/dashboard?tab=projects&success=updated');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update project');
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${contentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete project');
                setDeleting(false);
                return;
            }

            router.push('/admin/dashboard?tab=projects&success=deleted');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
            setDeleting(false);
        }
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/dashboard?tab=projects"
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Edit Project</h1>
                                <p className="text-sm text-gray-500">{project?.title}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDeleteProject}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
                    <ProjectForm
                        onSubmit={handleUpdateProject}
                        isLoading={saving}
                        initialData={project}
                    />
                </div>
            </main>
        </div>
    );
}

