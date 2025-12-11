import { getContent } from '@/lib/cms-client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Project {
    _id: string;
    contentId: string;
    title: string;
    data: {
        client: string;
        location?: string;
        projectImage?: string;
        shortDescription?: string;
        projectSize?: string;
    };
}

export default async function ProjectsPage() {
    const projects = (await getContent('projects')) as Project[];

    return (
        <main>
            {/* Navigation */}
            <nav className="fixed w-full bg-white shadow-sm z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                            <span className="text-white">📦</span>
                        </div>
                        <span className="font-serif text-xl font-bold text-gray-900">Lindsay Precast</span>
                    </Link>
                    <div className="hidden md:flex gap-8">
                        <Link href="/projects" className="text-gray-900 font-medium hover:text-yellow-600 transition">
                            Projects
                        </Link>
                        <Link href="/#capabilities" className="text-gray-700 font-medium hover:text-gray-900 transition">
                            Capabilities
                        </Link>
                        <Link href="/#contact" className="text-gray-700 font-medium hover:text-gray-900 transition">
                            Contact
                        </Link>
                    </div>
                    <Link href="/#contact" className="px-6 py-2 rounded-lg text-white text-sm font-medium bg-yellow-600 hover:bg-yellow-700">
                        Get Quote
                    </Link>
                </div>
            </nav>

            {/* Header */}
            {/* eslint-disable-next-line */}
            <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="font-serif text-5xl font-bold mb-4 text-gray-900">Our Projects</h1>
                    <p className="text-lg text-gray-700 mb-2">
                        Precision-engineered precast solutions delivered across North America
                    </p>
                    <p className="text-gray-700">
                        From renewable energy infrastructure to utility systems, explore our portfolio
                    </p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {projects.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {projects.map((project) => (
                                <div
                                    key={project._id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                                >
                                    <div className="bg-linear-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center">
                                        {project.data.projectImage ? (
                                            <img
                                                src={project.data.projectImage}
                                                alt={project.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-6xl">📦</span>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-semibold text-lg mb-2 text-gray-900">{project.title}</h3>
                                        <p className="text-sm text-gray-700 mb-4">
                                            {project.data.client}
                                        </p>
                                        {project.data.shortDescription && (
                                            <p className="text-sm text-gray-700 mb-4">
                                                {project.data.shortDescription}
                                            </p>
                                        )}
                                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                                            {project.data.location && (
                                                <span>📍 {project.data.location}</span>
                                            )}
                                            {project.data.projectSize && (
                                                <span>📐 {project.data.projectSize}</span>
                                            )}
                                        </div>
                                        <Link
                                            href={`/projects/${project.contentId}`}
                                            className="w-full py-2 border-2 border-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition text-center block text-gray-900"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-lg text-gray-700 mb-4">No projects available yet</p>
                            <Link
                                href="/"
                                className="px-6 py-2 rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 inline-block"
                            >
                                Back Home
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 px-4 sm:px-6 lg:px-8 bg-yellow-50">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="font-serif text-3xl font-bold mb-4 text-gray-900">Ready for Your Project?</h2>
                    <p className="text-gray-700 mb-8">
                        Let's discuss how Lindsay Precast can deliver precision-engineered solutions
                    </p>
                    <Link
                        href="/#contact"
                        className="px-8 py-3 rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 inline-block font-medium"
                    >
                        Start a Project
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
                    <p>&copy; 2025 Lindsay Precast. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
