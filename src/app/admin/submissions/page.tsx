'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface FormSubmission {
    id: number;
    submissionId: string;
    formId: string;
    status: string;
    data: any;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'lindsayprecast';

export default function SubmissionsPage() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        loadSubmissions();
    }, [router]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/form-submissions`);
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data.data?.submissions || []);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (submissionId: string, newStatus: string) => {
        try {
            const response = await fetch(`${API_URL}/cms/${SITE_ID}/form-submissions/${submissionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                await loadSubmissions();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminSidebar />

            <main className="flex-1 overflow-auto ml-64 transition-all duration-300">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Form Submissions</h1>
                        <p className="text-gray-600">View and manage contact form submissions</p>
                    </div>

                    {/* Submissions List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Loading submissions...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No form submissions yet</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {submissions.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {submission.data?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {submission.data?.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {submission.data?.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {submission.data?.message || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={submission.status}
                                                    onChange={(e) => updateStatus(submission.submissionId, e.target.value)}
                                                    className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${submission.status === 'new'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : submission.status === 'contacted'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : submission.status === 'qualified'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="qualified">Qualified</option>
                                                    <option value="archived">Archived</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(submission.createdAt).toLocaleDateString()}
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
