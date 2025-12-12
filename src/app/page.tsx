import Link from 'next/link';
import { getContentServer, getSiteContentServer } from '@/lib/cms-server';
import { 
  Building2, 
  Sun, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Star
} from 'lucide-react';
import ImageLightbox from '@/components/ImageLightbox';
import ScrollAnimation from '@/components/ScrollAnimation';
import ContactForm from '@/components/ContactForm';
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

interface Testimonial {
  _id: string;
  contentId: string;
  title: string;
  data: {
    quote: string;
    authorName: string;
    authorTitle: string;
  };
}

interface HeroButton {
  id: string;
  text: string;
  link: string;
  isExternal: boolean;
  bgColor: string;
  textColor: string;
  style: 'filled' | 'outline';
}

interface StatItem {
  id: string;
  value: string;
  label: string;
}

export default async function Home() {
  // Fetch all data server-side
  const [projects, testimonials, siteContent] = await Promise.all([
    getContentServer('projects'),
    getContentServer('testimonials'),
    getSiteContentServer(),
  ]);

  const defaultStats: StatItem[] = [
    { id: 'stat_1', value: '500+', label: 'Projects Completed' },
    { id: 'stat_2', value: '50K+', label: 'Cubic Yards Produced' },
    { id: 'stat_3', value: '25+', label: 'Years Experience' },
    { id: 'stat_4', value: '99.8%', label: 'On-Time Delivery' },
  ];

  const defaultButtons: HeroButton[] = [
    { id: 'btn_1', text: 'Start a Project', link: '#contact', isExternal: false, bgColor: '#ca8a04', textColor: '#ffffff', style: 'filled' },
    { id: 'btn_2', text: 'View Projects', link: '/projects', isExternal: false, bgColor: '#111827', textColor: '#111827', style: 'outline' },
  ];

  const stats = siteContent?.stats && siteContent.stats.length > 0 ? siteContent.stats : defaultStats;
  const heroButtons = siteContent?.heroButtons && siteContent.heroButtons.length > 0 ? siteContent.heroButtons : defaultButtons;

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
            <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Projects
            </Link>
            <a href="#capabilities" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Capabilities
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Testimonials
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition font-medium">
              Contact
            </a>
          </div>
          <a
            href="#contact"
            className="px-6 py-2 rounded-lg text-white text-sm font-medium bg-yellow-600 hover:bg-yellow-700 transition"
          >
            Get Quote
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden min-h-[600px]">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12 items-center md:grid-cols-2">
            {/* Text Content */}
            <div className="animate-fadeIn">
              <h1 className="font-serif text-5xl font-bold mb-6 leading-tight text-gray-900">
                {siteContent?.heroTitle || 'Premium Precast Concrete Solutions for Infrastructure'}
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                {siteContent?.heroSubtitle || 'Engineering excellence meets manufacturing precision. From BESS foundations to custom grade beams, we deliver infrastructure components that power renewable energy and modern utilities.'}
              </p>
              <p className="text-gray-700 mb-8">
                {siteContent?.heroDescription || 'Serving solar farms, battery storage facilities, and utility systems across North America.'}
              </p>
              <div className="flex flex-wrap gap-4">
                {heroButtons.map((button: HeroButton) => {
                  const isExternal = button.isExternal;
                  const ButtonTag = isExternal ? 'a' : Link;
                  const extraProps = isExternal 
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {};
                  
                  return (
                    <ButtonTag
                      key={button.id}
                      href={button.link}
                      {...extraProps}
                      className={`px-6 py-3 rounded-lg font-medium transition hover:opacity-90 ${
                        button.style === 'outline' ? 'border-2' : ''
                      }`}
                      style={button.style === 'filled' 
                        ? { backgroundColor: button.bgColor, color: button.textColor }
                        : { borderColor: button.bgColor, color: button.textColor }
                      }
                    >
                      {button.text}
                    </ButtonTag>
                  );
                })}
              </div>
            </div>
            
            {/* Image */}
            <div className="rounded-lg h-96 overflow-hidden shadow-lg animate-fadeIn animation-delay-150">
              {siteContent?.heroImage ? (
                <ImageLightbox
                  src={siteContent.heroImage}
                  alt="Hero"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                  <div className="text-center text-yellow-700">
                    <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm opacity-75">Add a hero image in the CMS</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat: StatItem, index: number) => (
              <div 
                key={stat.id} 
                className={`text-center animate-fadeInUp ${
                  index === 0 ? 'animation-delay-200' :
                  index === 1 ? 'animation-delay-250' :
                  index === 2 ? 'animation-delay-300' :
                  'animation-delay-350'
                }`}
              >
                <h3 className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stat.value}</h3>
                <p className="text-sm md:text-base text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold mb-4 text-gray-900">
                {siteContent?.projectsTitle || 'Featured Projects'}
              </h2>
              <p className="text-lg text-gray-700">
                {siteContent?.projectsSubtitle || 'Recent infrastructure solutions delivering impact across North America'}
              </p>
            </div>
          </ScrollAnimation>

          {projects.length > 0 ? (
            <div className={`grid gap-8 ${
              projects.slice(0, 3).length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 
              projects.slice(0, 3).length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {projects.slice(0, 3).map((project: Project, index: number) => (
                <ScrollAnimation 
                  key={project._id} 
                  animation="fade-up" 
                  delay={index * 150}
                  className="h-full"
                >
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
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
                      <p className="text-sm text-gray-500 mb-4">{project.data.location || 'No location'}</p>
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
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No projects available yet</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/projects"
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 inline-block transition"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold mb-4 text-gray-900">
                {siteContent?.testimonialsTitle || 'Client Testimonials'}
              </h2>
              <p className="text-lg text-gray-700">
                {siteContent?.testimonialsSubtitle || 'Trusted by leading companies'}
              </p>
            </div>
          </ScrollAnimation>

          {testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial: Testimonial, index: number) => (
                <ScrollAnimation key={testimonial._id} animation="fade-up" delay={index * 150}>
                  <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition h-full">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">
                      &quot;{testimonial.data.quote}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.data.authorName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.data.authorTitle}
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No testimonials available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <ScrollAnimation animation="fade-right">
              <div>
                <h2 className="font-serif text-4xl font-bold mb-6 text-gray-900">
                  {siteContent?.contactTitle || 'Get in Touch'}
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  {siteContent?.contactSubtitle || "Have a project in mind? Let's discuss how we can deliver precision-engineered solutions."}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Phone</p>
                      <p className="text-gray-700">1-800-LINDSAY</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Email</p>
                      <p className="text-gray-700">info@lindsayprecast.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Address</p>
                      <p className="text-gray-700">123 Industrial Blvd, Georgia, USA</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Hours</p>
                      <p className="text-gray-700">Mon - Fri: 7:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-left" delay={200}>
              <ContactForm />
            </ScrollAnimation>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
