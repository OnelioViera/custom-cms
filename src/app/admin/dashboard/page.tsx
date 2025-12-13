'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    LayoutDashboard, 
    FolderKanban, 
    FileText, 
    Star, 
    Settings, 
    ChevronLeft, 
    ChevronRight,
    HardHat,
    CheckCircle,
    Bell,
    LogOut,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Type,
    Film
} from 'lucide-react';
import { useToast } from '@/components/Toast';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

function AdminDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [projects, setProjects] = useState<Project[]>([]);
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const hasShownToast = useRef<string | null>(null);

    // Handle URL params for tab and success messages
    useEffect(() => {
        const tab = searchParams.get('tab');
        const success = searchParams.get('success');
        
        if (tab) {
            setActiveTab(tab);
        }
        
        // Only show toast if we haven't already shown it for this success param
        if (success && hasShownToast.current !== success) {
            hasShownToast.current = success;
            
            const messages: Record<string, string> = {
                created: 'Project created successfully!',
                updated: 'Project updated successfully!',
                deleted: 'Project deleted successfully!',
            };
            const message = messages[success];
            if (message) {
                toast.success(message);
            }
            
            // Clear the URL params immediately
            router.replace('/admin/dashboard' + (tab ? `?tab=${tab}` : ''), { scroll: false });
        }
    }, [searchParams, router, toast]);

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        setUser({
            email: localStorage.getItem('userEmail') || 'admin@lindsayprecast.com',
            role: 'admin',
        });
    }, [router]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsRes, submissionsRes] = await Promise.all([
                    fetch(`${API_URL}/cms/${SITE_ID}/content/projects?status=all`),
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
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to delete project');
                return;
            }

            toast.success('Project deleted successfully!');

            // Reload projects
            const projectsRes = await fetch(`${API_URL}/cms/${SITE_ID}/content/projects?status=all`);
            if (projectsRes.ok) {
                const data = await projectsRes.json();
                setProjects(data.data?.content || []);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete project');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20`}
            >
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-center">
                        <img 
                            src="/lindsay-precast-logo.png" 
                            alt="Lindsay Precast" 
                            className={`${sidebarOpen ? 'h-12' : 'h-8'} w-auto brightness-0 invert transition-all`}
                        />
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
                        { id: 'projects', label: 'Projects', Icon: FolderKanban },
                        { id: 'submissions', label: 'Form Submissions', Icon: FileText },
                        { id: 'settings', label: 'Settings', Icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id
                                ? 'bg-yellow-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.Icon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">{item.label}</span>}
                        </button>
                    ))}
                    
                    {/* Testimonials Link */}
                    <Link
                        href="/admin/testimonials"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <Star className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Testimonials</span>}
                    </Link>
                    
                    {/* Media Library Link */}
                    <Link
                        href="/admin/media"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <Film className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Media Library</span>}
                    </Link>
                    
                    {/* Page Content Link */}
                    <Link
                        href="/admin/content"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <Type className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Page Content</span>}
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-400 flex items-center justify-center"
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>

                <div className="p-4 border-t border-gray-800">
                    {user && sidebarOpen && (
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
                            document.cookie = 'authToken=; path=/; max-age=0';
                            router.push('/admin/login');
                        }}
                        className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        {sidebarOpen && 'Sign Out'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-auto ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                <div className="p-8">
                    {/* Success Message */}

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {activeTab === 'overview' && 'Dashboard'}
                            {activeTab === 'projects' && 'Manage Projects'}
                            {activeTab === 'submissions' && 'Form Submissions'}
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
                                        Icon: HardHat,
                                        color: 'bg-blue-100 text-blue-600',
                                    },
                                    {
                                        label: 'Published',
                                        value: stats.publishedProjects,
                                        Icon: CheckCircle,
                                        color: 'bg-green-100 text-green-600',
                                    },
                                    {
                                        label: 'Form Submissions',
                                        value: stats.totalSubmissions,
                                        Icon: FileText,
                                        color: 'bg-purple-100 text-purple-600',
                                    },
                                    {
                                        label: 'New Inquiries',
                                        value: stats.newSubmissions,
                                        Icon: Bell,
                                        color: 'bg-yellow-100 text-yellow-600',
                                    },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                                                <stat.Icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Recent Projects */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                                        <Link 
                                            href="/admin/projects/new"
                                            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New
                                        </Link>
                                    </div>
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
                                <Link
                                    href="/admin/projects/new"
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Project
                                </Link>
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
                                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {projects.map((project) => (
                                                <tr key={project._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-gray-900">{project.title}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{project.data?.client || '-'}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${project.status === 'published'
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
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/projects/${project.contentId}`}
                                                                target="_blank"
                                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                                title="View on site"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/admin/projects/${project.contentId}/edit`}
                                                                className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteProject(project.contentId)}
                                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
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
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                    <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">No projects yet. Create your first project!</p>
                                    <Link
                                        href="/admin/projects/new"
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium inline-flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Project
                                    </Link>
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
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No form submissions yet</p>
                                </div>
                            )}
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
            </main>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Loading...</p></div>}>
            <AdminDashboardContent />
        </Suspense>
    );
}
