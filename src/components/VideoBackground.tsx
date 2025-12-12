'use client';

import { useRef, useEffect, useState } from 'react';

export interface VideoBackgroundConfig {
    videoUrl: string;
    enabled: boolean;
    playbackSpeed: number; // 0.25 to 2
    objectFit: 'cover' | 'contain' | 'fill' | 'none';
    overlayColor: string; // hex color
    overlayOpacity: number; // 0 to 100
    muted: boolean;
    loop: boolean;
}

interface VideoBackgroundProps {
    config: VideoBackgroundConfig;
    className?: string;
}

export const defaultVideoConfig: VideoBackgroundConfig = {
    videoUrl: '',
    enabled: false,
    playbackSpeed: 1,
    objectFit: 'cover',
    overlayColor: '#000000',
    overlayOpacity: 30,
    muted: true,
    loop: true,
};

export default function VideoBackground({ config, className = '' }: VideoBackgroundProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (videoRef.current && config.playbackSpeed) {
            videoRef.current.playbackRate = config.playbackSpeed;
        }
    }, [config.playbackSpeed]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [config.videoUrl]);

    if (!config.enabled || !config.videoUrl) {
        return null;
    }

    const overlayStyle = {
        backgroundColor: config.overlayColor,
        opacity: config.overlayOpacity / 100,
    };

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                muted={config.muted}
                loop={config.loop}
                playsInline
                onLoadedData={() => setIsLoaded(true)}
                className={`absolute w-full h-full transition-opacity duration-500 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ objectFit: config.objectFit }}
            >
                <source src={config.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Color Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={overlayStyle}
            />

            {/* Loading placeholder */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-900 animate-pulse" />
            )}
        </div>
    );
}

