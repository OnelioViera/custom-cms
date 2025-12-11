import { getContentById, getContent } from '@/lib/cms-client';
import Link from 'next/link';

interface Project {
    _id: string;
    contentId: string;
    title: string;
    data: {
        client: string;
        location?: string;
        projectImage?: string;
        shortDescription?: string;
        description?: string;
        projectSize?: string;
        capacity?: string;
        startDate?: string;
        completionDate?: string;
        services?: string[];
        challenges?: string;
        results?: string;
        testimonial?: string;
        testimonialAuthor?: string;
    };
    status: string;
    createdAt: string;
}

interface PageProps {
    params: Promise<{ contentId: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const { contentId } = await params;

    // Fetch the specific project
    const project = (await getContentById('projects', contentId)) as Project | null;

    // Fetch all projects for sidebar
    const allProjects = (await getContent('projects')) as Project[];

    if (!project) {
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
                        <Link href="/projects" className="text-gray-600 hover:text-gray-900 font-medium">
                            ← Back to Projects
                        </Link>
                    </div>
                </nav>

                {/* 404 Section */}
                <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">Project Not Found</h1>
                        <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
                        <Link
                            href="/projects"
                            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 inline-block font-medium"
                        >
                            View All Projects
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-16">
                    <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
                        <p>&copy; 2025 Lindsay Precast. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        );
    }

    const relatedProjects = allProjects.filter(
        (p) => p.contentId !== contentId && p.status === 'published'
    ).slice(0, 3);

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
                        <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition font-medium">
                            Projects
                        </Link>
                        <a href="/#capabilities" className="text-gray-600 hover:text-gray-900 transition font-medium">
                            Capabilities
                        </a>
                        <a href="/#contact" className="text-gray-600 hover:text-gray-900 transition font-medium">
                            Contact
                        </a>
                    </div>
                    <a
                        href="/#contact"
                        className="px-6 py-2 rounded-lg text-white text-sm font-medium bg-yellow-600 hover:bg-yellow-700 transition"
                    >
                        Get Quote
                    </a>
                </div>
            </nav>

            {/* Breadcrumb */}
            <div className="pt-28 pb-4 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-gray-900">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/projects" className="hover:text-gray-900">
                            Projects
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{project.title}</span>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="font-serif text-5xl font-bold text-gray-900 mb-4">{project.title}</h1>
                            <p className="text-xl text-gray-700 mb-6">{project.data.shortDescription}</p>

                            <div className="space-y-4 mb-8">
                                {project.data.client && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">🏢</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Client</p>
                                            <p className="font-semibold text-gray-900">{project.data.client}</p>
                                        </div>
                                    </div>
                                )}
                                {project.data.location && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📍</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Location</p>
                                            <p className="font-semibold text-gray-900">{project.data.location}</p>
                                        </div>
                                    </div>
                                )}
                                {project.data.projectSize && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📐</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Project Size</p>
                                            <p className="font-semibold text-gray-900">{project.data.projectSize}</p>
                                        </div>
                                    </div>
                                )}
                                {project.data.capacity && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">⚡</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Capacity</p>
                                            <p className="font-semibold text-gray-900">{project.data.capacity}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <a
                                href="/#contact"
                                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium inline-block transition"
                            >
                                Discuss This Project
                            </a>
                        </div>

                        <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center border-2 border-gray-200 overflow-hidden">
                            {project.data.projectImage ? (
                                <img
                                    src={project.data.projectImage}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-6xl">🏗️</span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Project Details */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto">
                    {project.data.description && (
                        <div className="mb-12">
                            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {project.data.description}
                            </p>
                        </div>
                    )}

                    {project.data.services && project.data.services.length > 0 && (
                        <div className="mb-12">
                            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">Services Provided</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {project.data.services.map((service, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <span className="text-yellow-600 text-xl">✓</span>
                                        <span className="text-gray-900 font-medium">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {project.data.challenges && (
                        <div className="mb-12">
                            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">Challenges</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {project.data.challenges}
                            </p>
                        </div>
                    )}

                    {project.data.results && (
                        <div className="mb-12">
                            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">Results</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {project.data.results}
                            </p>
                        </div>
                    )}

                    {project.data.testimonial && (
                        <div className="mb-12 p-8 bg-yellow-50 border-l-4 border-yellow-600 rounded-r-lg">
                            <p className="text-gray-900 text-lg italic mb-4">"{project.data.testimonial}"</p>
                            {project.data.testimonialAuthor && (
                                <p className="text-gray-700 font-semibold">— {project.data.testimonialAuthor}</p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Link
                            href="/projects"
                            className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white font-medium transition"
                        >
                            ← Back to Projects
                        </Link>
                        <a
                            href="/#contact"
                            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition"
                        >
                            Start Your Project
                        </a>
                    </div>
                </div>
            </section>

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">Related Projects</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {relatedProjects.map((relatedProject) => (
                                <Link
                                    key={relatedProject._id}
                                    href={`/projects/${relatedProject.contentId}`}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                                >
                                    <div className="bg-linear-to-br from-blue-100 to-blue-200 h-48 flex items-center justify-center">
                                        {relatedProject.data.projectImage ? (
                                            <img
                                                src={relatedProject.data.projectImage}
                                                alt={relatedProject.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl">🏗️</span>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition">
                                            {relatedProject.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {relatedProject.data.shortDescription || relatedProject.data.client}
                                        </p>
                                        <span className="text-yellow-600 font-medium text-sm group-hover:underline">
                                            View Details →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                                <span className="text-white">📦</span>
                            </div>
                            <span className="font-serif text-xl font-bold">Lindsay Precast</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Leading precast concrete solutions for commercial and residential projects.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4 text-white">Quick Links</h3>
                        <div className="space-y-2 text-sm">
                            <Link href="/" className="block text-gray-400 hover:text-white transition">
                                Home
                            </Link>
                            <Link href="/projects" className="block text-gray-400 hover:text-white transition">
                                Projects
                            </Link>
                            <a href="/#contact" className="block text-gray-400 hover:text-white transition">
                                Contact
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4 text-white">Contact</h3>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p>📧 info@lindsayprecast.com</p>
                            <p>📞 1-800-LINDSAY</p>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
                    <p>&copy; 2025 Lindsay Precast. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
