'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import ProjectForm from '@/components/admin/ProjectForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateProject = async (formData: any) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to create project');
                setLoading(false);
                return;
            }

            router.push('/admin/dashboard?tab=projects&success=created');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
            setLoading(false);
        }
    };

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
                                <h1 className="text-xl font-bold text-gray-900">Create New Project</h1>
                                <p className="text-sm text-gray-500">Add a new project to your portfolio</p>
                            </div>
                        </div>
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
                        onSubmit={handleCreateProject}
                        isLoading={loading}
                    />
                </div>
            </main>
        </div>
    );
}

