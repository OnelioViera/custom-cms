import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
                <p className="text-gray-600 mb-8">Page not found</p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium inline-block"
                >
                    Go home
                </Link>
            </div>
        </div>
    );
}
