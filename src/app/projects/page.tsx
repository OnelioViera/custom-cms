import { getContentServer, getSiteContentServer } from '@/lib/cms-server';
import Link from 'next/link';
import { Sun, MapPin, Ruler } from 'lucide-react';
import ImageLightbox from '@/components/ImageLightbox';
import Footer from '@/components/Footer';

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
    const [projects, siteContent] = await Promise.all([
        getContentServer('projects') as Promise<Project[]>,
        getSiteContentServer(),
    ]);

    return (
        <main suppressHydrationWarning>
            {/* Navigation */}
            <nav className="fixed w-full bg-white shadow-sm z-50 border-b border-gray-100" suppressHydrationWarning>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img 
                            src="/lindsay-precast-logo.png" 
                            alt="Lindsay Precast" 
                            className="h-12 w-auto"
                        />
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
            <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="font-serif text-5xl font-bold mb-4 text-gray-900">
                        {siteContent?.projectsTitle || 'Our Projects'}
                    </h1>
                    <p className="text-lg text-gray-700">
                        {siteContent?.projectsSubtitle || 'Precision-engineered precast solutions delivered across North America'}
                    </p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {projects.length > 0 ? (
                        <div className={`flex flex-wrap justify-center gap-8 ${
                            projects.length === 1 ? 'max-w-xl mx-auto' : 
                            projects.length === 2 ? 'max-w-4xl mx-auto' : ''
                        }`}>
                            {projects.map((project, index, arr) => (
                                <div
                                    key={project._id}
                                    className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all ${
                                        arr.length === 1 ? 'w-full' : 
                                        arr.length === 2 ? 'w-full md:w-[calc(50%-1rem)]' : 
                                        'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]'
                                    }`}
                                >
                                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-48 flex items-center justify-center overflow-hidden">
                                        {project.data.projectImage ? (
                                            <ImageLightbox
                                                src={project.data.projectImage}
                                                alt={project.title}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <Sun className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
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
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {project.data.location}
                                                </span>
                                            )}
                                            {project.data.projectSize && (
                                                <span className="flex items-center gap-1">
                                                    <Ruler className="w-4 h-4" />
                                                    {project.data.projectSize}
                                                </span>
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
                    <h2 className="font-serif text-3xl font-bold mb-4 text-gray-900">
                        {siteContent?.ctaTitle || 'Ready for Your Project?'}
                    </h2>
                    <p className="text-gray-700 mb-8">
                        {siteContent?.ctaSubtitle || "Let's discuss how Lindsay Precast can deliver precision-engineered solutions"}
                    </p>
                    <Link
                        href="/#contact"
                        className="px-8 py-3 rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 inline-block font-medium"
                    >
                        Start a Project
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
