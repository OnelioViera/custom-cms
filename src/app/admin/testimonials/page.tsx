'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Star,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Type,
    Film,
    Quote,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Testimonial {
    _id: string;
    contentId: string;
    title: string;
    status: string;
    data: {
        quote: string;
        authorName: string;
        authorTitle: string;
        authorCompany?: string;
        rating?: number;
        featured?: boolean;
    };
    createdAt: string;
    updatedAt: string;
    hasDraft?: boolean;
}

interface User {
    email: string;
    role: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

function TestimonialsListContent() {
    const router = useRouter();
    const toast = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    // Check authentication
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

    // Load testimonials
    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials?status=all`);
            if (response.ok) {
                const data = await response.json();
                setTestimonials(data.data?.content || []);
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            toast.error('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contentId: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/content/testimonials/${contentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            toast.success('Testimonial deleted successfully');
            loadTestimonials();
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            toast.error('Failed to delete testimonial');
        }
    };

    const stripHtml = (html: string) => {
        if (typeof window === 'undefined') return html;
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20`}
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
                    <Link
                        href="/admin/dashboard"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Dashboard</span>}
                    </Link>

                    <Link
                        href="/admin/dashboard?tab=projects"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <FolderKanban className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Projects</span>}
                    </Link>

                    <Link
                        href="/admin/testimonials"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition bg-yellow-600 text-white"
                    >
                        <Star className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Testimonials</span>}
                    </Link>

                    <Link
                        href="/admin/media"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <Film className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Media Library</span>}
                    </Link>

                    <Link
                        href="/admin/content"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <Type className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Page Content</span>}
                    </Link>

                    <Link
                        href="/admin/dashboard?tab=submissions"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Submissions</span>}
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
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Testimonials</h1>
                            <p className="text-gray-600">Manage customer testimonials and reviews</p>
                        </div>
                        <Link
                            href="/admin/testimonials/new"
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Testimonial
                        </Link>
                    </div>

                    {/* Testimonials List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : testimonials.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No testimonials yet</h3>
                            <p className="text-gray-600 mb-6">Create your first testimonial to showcase customer feedback</p>
                            <Link
                                href="/admin/testimonials/new"
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Testimonial
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Author</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quote</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {testimonials.map((testimonial) => (
                                        <tr key={testimonial._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {testimonial.data.featured && (
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {testimonial.data.authorName || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {testimonial.data.authorTitle}
                                                            {testimonial.data.authorCompany && `, ${testimonial.data.authorCompany}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                                                    &quot;{stripHtml(testimonial.data.quote || '').substring(0, 100)}...&quot;
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${
                                                                star <= (testimonial.data.rating || 5)
                                                                    ? 'text-yellow-500 fill-yellow-500'
                                                                    : 'text-gray-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                            testimonial.status === 'published'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        {testimonial.status === 'published' ? (
                                                            <CheckCircle className="w-3 h-3" />
                                                        ) : (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {testimonial.status}
                                                    </span>
                                                    {testimonial.hasDraft && (
                                                        <span className="text-xs text-orange-600">• Has draft</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/testimonials/${testimonial.contentId}/edit`}
                                                        className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(testimonial.contentId)}
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
                    )}
                </div>
            </main>
        </div>
    );
}

export default function TestimonialsList() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Loading...</p></div>}>
            <TestimonialsListContent />
        </Suspense>
    );
}

