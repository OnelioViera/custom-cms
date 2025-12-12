'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Lock } from 'lucide-react';

export default function Footer() {
  // Use static year to avoid hydration mismatch
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/">
              <img 
                src="/lindsay-precast-logo.png" 
                alt="Lindsay Precast" 
                className="h-16 w-auto mb-4 brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 max-w-md">
              Premium precast concrete solutions for renewable energy infrastructure. 
              Engineering excellence meets manufacturing precision.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/projects" className="hover:text-white transition">Projects</Link></li>
              <li><Link href="/#capabilities" className="hover:text-white transition">Capabilities</Link></li>
              <li><Link href="/#testimonials" className="hover:text-white transition">Testimonials</Link></li>
              <li><Link href="/#contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1-800-LINDSAY</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@lindsayprecast.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Georgia, USA</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm" suppressHydrationWarning>
            &copy; {year} Lindsay Precast. All rights reserved.
          </p>
          <a
            href="/admin/login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition"
          >
            <Lock className="w-4 h-4" />
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
