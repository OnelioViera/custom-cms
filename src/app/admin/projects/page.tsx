'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Project {
    id: number;
    contentId: string;
    title: string;
    status: string;
    data: any;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        loadProjects();
    }, [router]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects?status=all`);
            if (response.ok) {
                const data = await response.json();
                setProjects(data.data?.content || []);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contentId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects/${contentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadProjects();
            } else {
                alert('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminSidebar />

            <main className="flex-1 overflow-auto ml-64 transition-all duration-300">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Projects</h1>
                            <p className="text-gray-600">Manage your portfolio projects</p>
                        </div>
                        <Link
                            href="/admin/projects/new"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Project
                        </Link>
                    </div>

                    {/* Projects List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <p className="text-gray-600 mb-4">No projects yet</p>
                            <Link
                                href="/admin/projects/new"
                                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First Project
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {projects.map((project) => (
                                        <tr key={project.contentId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{project.title}</div>
                                                {project.data?.client && (
                                                    <div className="text-sm text-gray-500">{project.data.client}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/projects/${project.contentId}`}
                                                        target="_blank"
                                                        className="text-gray-600 hover:text-gray-900 p-2"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/projects/${project.contentId}/edit`}
                                                        className="text-blue-600 hover:text-blue-900 p-2"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(project.contentId)}
                                                        className="text-red-600 hover:text-red-900 p-2"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
