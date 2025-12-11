'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Modal from '@/components/admin/Modal';
import ProjectForm from '@/components/admin/ProjectForm';

interface User {
    email: string;
    role: string;
}

interface Project {
    _id: string;
    contentId: string;
    title: string;
    status: string;
    data: any;
    createdAt: string;
}

interface FormSubmission {
    _id: string;
    title: string;
    status: string;
    data: any;
    createdAt: string;
}

const API_URL = '/api';
const SITE_ID = 'lindsayprecast';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [projects, setProjects] = useState<Project[]>([]);
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectFormLoading, setProjectFormLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingProject, setEditingProject] = useState<any>(null);

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        // For now, set a dummy user. In production, you'd decode the JWT
        setUser({
            email: localStorage.getItem('userEmail') || 'admin@lindsayprecast.com',
            role: 'admin',
        });
    }, [router]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsRes, submissionsRes] = await Promise.all([
                    fetch(`${API_URL}/cms/${SITE_ID}/content/projects`),
                    fetch(`${API_URL}/cms/${SITE_ID}/form-submissions`),
                ]);

                if (projectsRes.ok) {
                    const data = await projectsRes.json();
                    setProjects(data.data?.content || []);
                }

                if (submissionsRes.ok) {
                    const data = await submissionsRes.json();
                    setSubmissions(data.data?.submissions || []);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const stats = {
        totalProjects: projects.length,
        publishedProjects: projects.filter((p) => p.status === 'published').length,
        totalSubmissions: submissions.length,
        newSubmissions: submissions.filter((s) => s.status === 'new').length,
    };

    const handleCreateProject = async (formData: any) => {
        setProjectFormLoading(true);
        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(`Error: ${error.error}`);
                setProjectFormLoading(false);
                return;
            }

            alert('✅ Project created successfully!');
            setShowProjectModal(false);
            setRefreshKey((prev) => prev + 1);

            // Reload projects
            const projectsRes = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects`);
            if (projectsRes.ok) {
                const data = await projectsRes.json();
                setProjects(data.data?.content || []);
            }
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Failed to create project'}`);
        } finally {
            setProjectFormLoading(false);
        }
    };

    const handleUpdateProject = async (formData: any) => {
        if (!editingProject) return;

        setProjectFormLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/cms/${SITE_ID}/content/projects/${editingProject.contentId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                alert(`Error: ${error.error}`);
                setProjectFormLoading(false);
                return;
            }

            alert('✅ Project updated successfully!');
            setShowProjectModal(false);
            setEditingProject(null);

            // Reload projects
            const projectsRes = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects?status=all`);
            if (projectsRes.ok) {
                const data = await projectsRes.json();
                setProjects(data.data?.content || []);
            }
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Failed to update project'}`);
        } finally {
            setProjectFormLoading(false);
        }
    };

    const handleDeleteProject = async (contentId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/cms/${SITE_ID}/content/projects/${contentId}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                alert(`Error: ${error.error}`);
                return;
            }

            alert('✅ Project deleted successfully!');

            // Reload projects
            const projectsRes = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects?status=all`);
            if (projectsRes.ok) {
                const data = await projectsRes.json();
                setProjects(data.data?.content || []);
            }
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete project'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
            >
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center text-xl">
                            📦
                        </div>
                        {sidebarOpen && <span className="font-serif text-lg font-bold">Lindsay</span>}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: '📊' },
                        { id: 'projects', label: 'Projects', icon: '🏗️' },
                        { id: 'submissions', label: 'Form Submissions', icon: '📋' },
                        { id: 'testimonials', label: 'Testimonials', icon: '⭐' },
                        { id: 'settings', label: 'Settings', icon: '⚙️' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id
                                ? 'bg-yellow-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span className="font-medium">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-400"
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>

                <div className="p-4 border-t border-gray-800">
                    {user && (
                        <div className="text-xs text-gray-400 mb-3 px-2">
                            <p className="truncate">{user.email}</p>
                            <p className="text-gray-500">{user.role}</p>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('userId');
                            localStorage.removeItem('userEmail');
                            router.push('/admin/login');
                        }}
                        className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {activeTab === 'overview' && 'Dashboard'}
                            {activeTab === 'projects' && 'Manage Projects'}
                            {activeTab === 'submissions' && 'Form Submissions'}
                            {activeTab === 'testimonials' && 'Testimonials'}
                            {activeTab === 'settings' && 'Settings'}
                        </h1>
                        <p className="text-gray-600">Manage your CMS content and track inquiries</p>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div>
                            <div className="grid md:grid-cols-4 gap-6 mb-8">
                                {[
                                    {
                                        label: 'Total Projects',
                                        value: stats.totalProjects,
                                        icon: '🏗️',
                                        color: 'bg-blue-100 text-blue-600',
                                    },
                                    {
                                        label: 'Published',
                                        value: stats.publishedProjects,
                                        icon: '✅',
                                        color: 'bg-green-100 text-green-600',
                                    },
                                    {
                                        label: 'Form Submissions',
                                        value: stats.totalSubmissions,
                                        icon: '📋',
                                        color: 'bg-purple-100 text-purple-600',
                                    },
                                    {
                                        label: 'New Inquiries',
                                        value: stats.newSubmissions,
                                        icon: '🔔',
                                        color: 'bg-yellow-100 text-yellow-600',
                                    },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${stat.color}`}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Recent Projects */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h2>
                                    {projects.length > 0 ? (
                                        <div className="space-y-3">
                                            {projects.slice(0, 5).map((project) => (
                                                <div
                                                    key={project._id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">{project.title}</p>
                                                        <p className="text-sm text-gray-600">{project.data?.client}</p>
                                                    </div>
                                                    <span
                                                        className={`text-xs font-semibold px-3 py-1 rounded-full ${project.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {project.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No projects yet</p>
                                    )}
                                </div>

                                {/* Recent Submissions */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Submissions</h2>
                                    {submissions.length > 0 ? (
                                        <div className="space-y-3">
                                            {submissions.slice(0, 5).map((submission) => (
                                                <div
                                                    key={submission._id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">{submission.title}</p>
                                                        <p className="text-sm text-gray-600">{submission.data?.email}</p>
                                                    </div>
                                                    <span
                                                        className={`text-xs font-semibold px-3 py-1 rounded-full ${submission.status === 'new'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : submission.status === 'contacted'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : submission.status === 'qualified'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {submission.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No submissions yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
                                <button
                                    onClick={() => setShowProjectModal(true)}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                                >
                                    + New Project
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">Loading projects...</p>
                                </div>
                            ) : projects.length > 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {projects.map((project) => (
                                                <tr key={project._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.title}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{project.data?.client || '-'}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                                project.status === 'published'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : project.status === 'draft'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {project.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(project.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingProject(project);
                                                                setShowProjectModal(true);
                                                            }}
                                                            className="text-yellow-600 hover:text-yellow-700 font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProject(project.contentId)}
                                                            className="text-red-600 hover:text-red-700 font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                    <p className="text-gray-600 mb-4">No projects yet. Create your first project!</p>
                                    <button
                                        onClick={() => setShowProjectModal(true)}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form Submissions Tab */}
                    {activeTab === 'submissions' && (
                        <div>
                            <div className="mb-6 flex gap-4">
                                {['all', 'new', 'contacted', 'qualified', 'converted'].map((filter) => (
                                    <button
                                        key={filter}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${filter === 'all'
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">Loading submissions...</p>
                                </div>
                            ) : submissions.length > 0 ? (
                                <div className="space-y-4">
                                    {submissions.map((submission) => (
                                        <div
                                            key={submission._id}
                                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{submission.title}</h3>
                                                    <p className="text-sm text-gray-600">{submission.data?.email}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <select
                                                        defaultValue={submission.status}
                                                        className="text-sm px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="contacted">Contacted</option>
                                                        <option value="qualified">Qualified</option>
                                                        <option value="converted">Converted</option>
                                                        <option value="lost">Lost</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Phone</p>
                                                    <p className="font-medium text-gray-900">{submission.data?.phone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Project Type</p>
                                                    <p className="font-medium text-gray-900">{submission.data?.projectType || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Project Size</p>
                                                    <p className="font-medium text-gray-900">{submission.data?.projectSize || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Submitted</p>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(submission.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {submission.data?.description && (
                                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600 mb-1">Message</p>
                                                    <p className="text-gray-900">{submission.data.description}</p>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                                                    View Details
                                                </button>
                                                <button className="text-sm text-red-600 hover:text-red-700 font-medium">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                    <p className="text-gray-600">No form submissions yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Testimonials Tab */}
                    {activeTab === 'testimonials' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
                                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium">
                                    + New Testimonial
                                </button>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <p className="text-gray-600">Testimonials management coming soon</p>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Site Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Lindsay Precast"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                                        <input
                                            type="email"
                                            defaultValue="info@lindsayprecast.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            defaultValue="1-800-LINDSAY"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                                        />
                                    </div>
                                    <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Project Modal */}
                <Modal
                    isOpen={showProjectModal}
                    title={editingProject ? 'Edit Project' : 'Create New Project'}
                    onClose={() => {
                        setShowProjectModal(false);
                        setEditingProject(null);
                    }}
                    isLoading={projectFormLoading}
                >
                    <ProjectForm
                        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                        isLoading={projectFormLoading}
                        initialData={editingProject}
                    />
                </Modal>
            </main>
        </div>
    );
}
