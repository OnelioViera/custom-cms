import { getContentServer, getSiteContentServer } from '@/lib/cms-server';
import Link from 'next/link';
import { Sun, MapPin, Ruler } from 'lucide-react';
import ImageLightbox from '@/components/ImageLightbox';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

// Add static generation with revalidation
export const revalidate = 60; // Cache for 60 seconds

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
    // Fetch data in parallel with error handling
    const [projects, siteContent] = await Promise.all([
        getContentServer('projects').catch(() => [] as Project[]),
        getSiteContentServer().catch(() => null),
    ]);

    return (
        <>
            <Navigation currentPage="projects" />

            <main>
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
                            <div className={`grid gap-8 ${projects.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                                projects.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
                                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                }`}>
                                {projects.map((project: Project) => (
                                    <div
                                        key={project._id}
                                        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col"
                                    >
                                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-48 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {project.data.projectImage ? (
                                                <ImageLightbox
                                                    src={project.data.projectImage}
                                                    alt={project.title}
                                                    className="w-full h-full"
                                                />
                                            ) : (
                                                <Sun className="w-16 h-16 text-blue-400" strokeWidth={1.5} />
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{project.title}</h3>
                                            <p className="text-sm text-gray-700 mb-2 font-medium">{project.data.client}</p>

                                            {project.data.location && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{project.data.location}</span>
                                                </div>
                                            )}

                                            {project.data.projectSize && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                    <Ruler className="w-4 h-4" />
                                                    <span>{project.data.projectSize}</span>
                                                </div>
                                            )}

                                            {project.data.shortDescription && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {project.data.shortDescription}
                                                </p>
                                            )}

                                            <div className="mt-auto">
                                                <Link
                                                    href={`/projects/${project.contentId}`}
                                                    className="w-full py-2 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition text-center block"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No projects available yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <Footer />
            </main>
        </>
    );
}