'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

interface NavigationProps {
    currentPage?: 'home' | 'projects' | 'project-detail';
    showTestimonials?: boolean;
}

// The actual navigation content
function NavigationContent({ currentPage, showTestimonials = false }: NavigationProps) {
    const capabilitiesHref = currentPage === 'home' ? '#capabilities' : '/#capabilities';
    const contactHref = currentPage === 'home' ? '#contact' : '/#contact';
    const testimonialsHref = currentPage === 'home' ? '#testimonials' : '/#testimonials';

    return (
        <nav className="fixed w-full bg-white shadow-sm z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <img 
                        src="/lindsay-precast-logo.png" 
                        alt="Lindsay Precast" 
                        className="h-12 w-auto"
                    />
                </Link>
                
                <div className="hidden md:flex gap-8">
                    <Link 
                        href="/projects" 
                        className={`font-medium transition ${
                            currentPage === 'projects' || currentPage === 'project-detail'
                                ? 'text-gray-900'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Projects
                    </Link>
                    <a 
                        href={capabilitiesHref}
                        className="text-gray-600 font-medium hover:text-gray-900 transition"
                    >
                        Capabilities
                    </a>
                    {showTestimonials && (
                        <a 
                            href={testimonialsHref}
                            className="text-gray-600 font-medium hover:text-gray-900 transition"
                        >
                            Testimonials
                        </a>
                    )}
                    <a 
                        href={contactHref}
                        className="text-gray-600 font-medium hover:text-gray-900 transition"
                    >
                        Contact
                    </a>
                </div>
                
                <a 
                    href={contactHref}
                    className="px-6 py-2 rounded-lg text-white text-sm font-medium bg-yellow-600 hover:bg-yellow-700 transition"
                >
                    Get Quote
                </a>
            </div>
        </nav>
    );
}

// Skeleton placeholder that matches the nav structure
function NavigationSkeleton() {
    return (
        <nav className="fixed w-full bg-white shadow-sm z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="h-12 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="hidden md:flex gap-8">
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        </nav>
    );
}

// Use dynamic import with ssr: false to prevent server rendering entirely
const DynamicNavigation = dynamic(() => Promise.resolve(NavigationContent), {
    ssr: false,
    loading: () => <NavigationSkeleton />,
});

export default function Navigation(props: NavigationProps) {
    return <DynamicNavigation {...props} />;
}
