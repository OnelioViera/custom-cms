'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getContent, submitContactForm } from '@/lib/cms-client';

interface Project {
  _id: string;
  contentId: string;
  title: string;
  data: {
    client: string;
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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: 'Solar Installation',
    projectSize: 'Medium (1-5MW)',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, testimonialsData] = await Promise.all([
          getContent('projects'),
          getContent('testimonials'),
        ]);
        setProjects(projectsData);
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const result = await submitContactForm(formData);

    if (result.success) {
      setMessage('✅ Thank you! We received your inquiry and will contact you soon.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        projectType: 'Solar Installation',
        projectSize: 'Medium (1-5MW)',
        description: '',
      });
      setTimeout(() => setMessage(''), 5000);
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setSubmitting(false);
  };

  return (
    <main>
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📦</span>
            </div>
            <span className="font-serif text-xl font-bold text-gray-900">Lindsay Precast</span>
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
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-5xl font-bold mb-6 leading-tight text-gray-900">
                Premium Precast Concrete Solutions for Infrastructure
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Engineering excellence meets manufacturing precision. From BESS foundations to custom grade beams, we deliver infrastructure components that power renewable energy and modern utilities.
              </p>
              <p className="text-gray-700 mb-8">
                Serving solar farms, battery storage facilities, and utility systems across North America.
              </p>
              <div className="flex gap-4">
                <a
                  href="#contact"
                  className="px-6 py-3 rounded-lg text-white font-medium bg-yellow-600 hover:bg-yellow-700 transition"
                >
                  Start a Project
                </a>
                <Link
                  href="/projects"
                  className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  View Projects
                </Link>
              </div>
            </div>
            <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center border-2 border-gray-200">
              <div className="text-center">
                <span className="text-6xl">🏗️</span>
                <p className="text-gray-600 mt-4 font-medium">COWBOY II BESS Grade Beam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4 text-gray-900">Featured Projects</h2>
            <p className="text-lg text-gray-700">
              Recent infrastructure solutions delivering impact across North America
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="bg-linear-to-br from-blue-100 to-blue-200 h-48 flex items-center justify-center">
                    {project.data.projectImage ? (
                      <img
                        src={project.data.projectImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">☀️</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-700 mb-4 font-medium">{project.data.client}</p>
                    {project.data.shortDescription && (
                      <p className="text-sm text-gray-600 mb-4">
                        {project.data.shortDescription}
                      </p>
                    )}
                    <Link
                      href={`/projects/${project.contentId}`}
                      className="w-full py-2 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
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
      <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4 text-gray-900">Client Testimonials</h2>
            <p className="text-lg text-gray-700">Trusted by leading companies</p>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial._id}
                  className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-600 text-lg">
                        ★
                      </span>
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
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-6 text-gray-900">Get in Touch</h2>
              <p className="text-lg text-gray-700 mb-8">
                Have a project in mind? Let&apos;s discuss how we can deliver
                precision-engineered solutions.
              </p>

              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">📞 Phone</p>
                  <p className="text-gray-700">1-800-LINDSAY</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">📧 Email</p>
                  <p className="text-gray-700">info@lindsayprecast.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">📍 Address</p>
                  <p className="text-gray-700">123 Industrial Blvd, Georgia, USA</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">🕐 Hours</p>
                  <p className="text-gray-700">Mon - Fri: 7:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="font-semibold text-lg text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                >
                  <option>Solar Installation</option>
                  <option>BESS Foundation</option>
                  <option>Storm Drain</option>
                  <option>Custom Project</option>
                </select>
                <select
                  name="projectSize"
                  value={formData.projectSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                >
                  <option>Small (&lt; 1MW)</option>
                  <option>Medium (1-5MW)</option>
                  <option>Large (5-10MW)</option>
                  <option>Utility Scale (&gt; 10MW)</option>
                </select>
                <textarea
                  name="description"
                  placeholder="Project Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                ></textarea>

                {message && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('✅')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg text-white font-medium bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>&copy; 2025 Lindsay Precast. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
