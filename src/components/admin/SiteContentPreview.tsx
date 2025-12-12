'use client';

import { Monitor, Building2 } from 'lucide-react';
import { SiteContentFormData } from './SiteContentFormFields';

interface SiteContentPreviewProps {
    data: SiteContentFormData;
}

export default function SiteContentPreview({ data }: SiteContentPreviewProps) {
    const hasContent = data.heroTitle || data.heroSubtitle;

    return (
        <div className="bg-white overflow-hidden h-full flex flex-col">
            {/* Preview Header */}
            <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                <Monitor className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Home Page Preview</span>
                <div className="flex gap-1.5 ml-auto">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto bg-white">
                {hasContent ? (
                    <div className="min-h-full flex flex-col">
                        {/* Mini Nav */}
                        <div className="bg-white border-b border-gray-100 px-4 py-2 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                <div className="flex gap-2">
                                    <div className="h-3 w-10 bg-gray-100 rounded"></div>
                                    <div className="h-3 w-10 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Section */}
                        <div className={`relative p-6 overflow-hidden ${!data.heroVideoConfig?.enabled ? 'bg-gradient-to-b from-gray-50 to-white' : 'bg-gray-900'}`}>
                            {/* Video Background */}
                            {data.heroVideoConfig?.enabled && data.heroVideoConfig?.videoUrl && (
                                <>
                                    <video
                                        src={data.heroVideoConfig.videoUrl}
                                        autoPlay
                                        muted
                                        loop={data.heroVideoConfig.loop !== false}
                                        playsInline
                                        className="absolute inset-0 w-full h-full"
                                        style={{ objectFit: data.heroVideoConfig.objectFit || 'cover' }}
                                        ref={(el) => {
                                            if (el) {
                                                el.playbackRate = data.heroVideoConfig?.playbackSpeed || 1;
                                            }
                                        }}
                                    />
                                    <div 
                                        className="absolute inset-0"
                                        style={{
                                            backgroundColor: data.heroVideoConfig.overlayColor,
                                            opacity: data.heroVideoConfig.overlayOpacity / 100
                                        }}
                                    />
                                </>
                            )}
                            
                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                <div>
                                    <div 
                                        className={`text-lg font-bold mb-2 leading-tight rich-text-content [&_p]:m-0 ${data.heroVideoConfig?.enabled ? 'text-white' : 'text-gray-900'}`}
                                        dangerouslySetInnerHTML={{ __html: data.heroTitle || 'Hero Title' }}
                                    />
                                    <div 
                                        className={`text-xs mb-2 rich-text-content [&_p]:m-0 ${data.heroVideoConfig?.enabled ? 'text-gray-300' : 'text-gray-600'}`}
                                        dangerouslySetInnerHTML={{ __html: data.heroSubtitle || 'Hero subtitle goes here...' }}
                                    />
                                    <div 
                                        className={`text-xs mb-3 rich-text-content [&_p]:m-0 ${data.heroVideoConfig?.enabled ? 'text-gray-400' : 'text-gray-500'}`}
                                        dangerouslySetInnerHTML={{ __html: data.heroDescription || 'Description...' }}
                                    />
                                    
                                    {/* Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {(data.heroButtons || []).slice(0, 2).map((btn) => (
                                            <span
                                                key={btn.id}
                                                className={`px-3 py-1 text-[10px] font-medium rounded ${btn.style === 'outline' ? 'border' : ''}`}
                                                style={btn.style === 'filled' 
                                                    ? { backgroundColor: btn.bgColor, color: btn.textColor }
                                                    : { borderColor: btn.bgColor, color: btn.textColor }
                                                }
                                            >
                                                {btn.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Hero Image */}
                                <div className="bg-gray-200 rounded-lg aspect-[4/3] flex items-center justify-center overflow-hidden">
                                    {data.heroImage ? (
                                        <img src={data.heroImage} alt="Hero" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="bg-gray-900 py-4 px-4">
                            <div className="grid grid-cols-4 gap-2">
                                {(data.stats || []).slice(0, 4).map((stat) => (
                                    <div key={stat.id} className="text-center">
                                        <div className="text-orange-500 font-bold text-sm">{stat.value}</div>
                                        <div className="text-gray-400 text-[8px]">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projects Section */}
                        <div className="py-6 px-4 bg-gray-50">
                            <h2 className="text-sm font-bold text-gray-900 mb-1">{data.projectsTitle || 'Featured Projects'}</h2>
                            <p className="text-[10px] text-gray-600 mb-3">{data.projectsSubtitle || 'Subtitle'}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-200 rounded aspect-[4/3]"></div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonials Section */}
                        <div className="py-6 px-4 bg-white">
                            <h2 className="text-sm font-bold text-gray-900 mb-1">{data.testimonialsTitle || 'Client Testimonials'}</h2>
                            <p className="text-[10px] text-gray-600 mb-3">{data.testimonialsSubtitle || 'Subtitle'}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="bg-gray-100 rounded-lg p-3">
                                        <div className="flex gap-1 mb-2">
                                            {[1,2,3,4,5].map(s => <div key={s} className="w-2 h-2 bg-yellow-400 rounded-full" />)}
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="py-6 px-4 bg-gray-50">
                            <h2 className="text-sm font-bold text-gray-900 mb-1">{data.contactTitle || 'Get in Touch'}</h2>
                            <p className="text-[10px] text-gray-600 mb-3">{data.contactSubtitle || 'Subtitle'}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <div className="h-6 bg-white border border-gray-200 rounded"></div>
                                    <div className="h-6 bg-white border border-gray-200 rounded"></div>
                                    <div className="h-12 bg-white border border-gray-200 rounded"></div>
                                </div>
                                <div className="bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="py-6 px-4 bg-yellow-600 text-center">
                            <h2 className="text-sm font-bold text-white mb-1">{data.ctaTitle || 'Ready for Your Project?'}</h2>
                            <p className="text-[10px] text-yellow-100 mb-3">{data.ctaSubtitle || 'Subtitle'}</p>
                            <div className="inline-block px-4 py-1 bg-white text-yellow-600 text-[10px] font-medium rounded">
                                Start a Project
                            </div>
                        </div>

                        {/* Mini Footer */}
                        <div className="bg-gray-900 px-4 py-3 flex-shrink-0 mt-auto">
                            <div className="h-3 w-16 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="text-center text-gray-400">
                            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Start editing to see preview</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

