'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SITE_ID = 'lindsayprecast';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    siteId: SITE_ID,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login failed');
                setLoading(false);
                return;
            }

            // Store token in localStorage
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userId', data.data.userId);

            // Redirect to dashboard
            router.push('/admin/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center text-2xl">
                            📦
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
                    <p className="text-gray-600 mt-2">Lindsay Precast CMS</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@lindsayprecast.com"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 font-medium mb-2">Demo Credentials:</p>
                        <div className="text-sm text-blue-800 space-y-1 font-mono">
                            <p>Email: admin@lindsayprecast.com</p>
                            <p>Password: password123</p>
                        </div>
                    </div>
                </div>

                {/* Back to Site */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                        ← Back to Website
                    </Link>
                </div>
            </div>
        </div>
    );
}
