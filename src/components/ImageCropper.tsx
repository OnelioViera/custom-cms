'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCcw, ZoomIn, ZoomOut, RectangleHorizontal, Square, Smartphone, Monitor, Unlock } from 'lucide-react';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    aspectRatio?: number;
    backgroundColor?: string;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageCropper({
    imageSrc,
    onCropComplete,
    onCancel,
    aspectRatio,
    backgroundColor = '#000000',
}: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState<number | undefined>(aspectRatio);
    const imgRef = useRef<HTMLImageElement>(null);

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        if (aspect) {
            setCrop(centerAspectCrop(width, height, aspect));
        } else {
            setCrop({
                unit: '%',
                x: 5,
                y: 5,
                width: 90,
                height: 90,
            });
        }
    }, [aspect]);

    const getCroppedImage = useCallback(async () => {
        if (!imgRef.current || !completedCrop) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
        canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        // Fill background with the specified color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;

        const rotateRads = rotate * (Math.PI / 180);
        const centerX = image.naturalWidth / 2;
        const centerY = image.naturalHeight / 2;

        ctx.save();

        ctx.translate(-cropX, -cropY);
        ctx.translate(centerX, centerY);
        ctx.rotate(rotateRads);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
        );

        ctx.restore();

        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        onCropComplete(base64Image);
    }, [completedCrop, scale, rotate, onCropComplete, backgroundColor]);

    const handleReset = () => {
        setScale(1);
        setRotate(0);
        if (imgRef.current && aspect) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    };

    const aspectPresets = [
        { label: 'Free', value: undefined, icon: Unlock },
        { label: '16:9', value: 16 / 9, icon: Monitor },
        { label: '4:3', value: 4 / 3, icon: RectangleHorizontal },
        { label: '1:1', value: 1, icon: Square },
        { label: '9:16', value: 9 / 16, icon: Smartphone },
    ];

    const setAspectRatio = (newAspect: number | undefined) => {
        setAspect(newAspect);
        if (imgRef.current && newAspect) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, newAspect));
        } else if (!newAspect) {
            // Free crop - set a default rectangle
            setCrop({
                unit: '%',
                x: 10,
                y: 10,
                width: 80,
                height: 80,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition"
                >
                    <X className="w-5 h-5" />
                    Cancel
                </button>
                <h2 className="text-white font-semibold">Crop & Resize Image</h2>
                <button
                    onClick={getCroppedImage}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                    <Check className="w-5 h-5" />
                    Apply
                </button>
            </div>

            {/* Crop Area */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    className="max-h-full"
                >
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Crop preview"
                        onLoad={onImageLoad}
                        style={{
                            transform: `scale(${scale}) rotate(${rotate}deg)`,
                            maxHeight: 'calc(100vh - 200px)',
                            maxWidth: '100%',
                        }}
                        className="object-contain"
                    />
                </ReactCrop>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 space-y-4">
                {/* Aspect Ratio Presets */}
                <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-400 text-sm mr-2">Aspect:</span>
                    {aspectPresets.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setAspectRatio(preset.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                                aspect === preset.value || (!aspect && !preset.value)
                                    ? 'bg-yellow-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <preset.icon className="w-4 h-4" />
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">Zoom</span>
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="w-24 accent-yellow-600"
                        />
                        <button
                            onClick={() => setScale(s => Math.min(3, s + 0.1))}
                            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <span className="text-gray-400 text-sm w-12">{Math.round(scale * 100)}%</span>
                    </div>

                    {/* Rotate Controls */}
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">Rotate</span>
                        <button
                            onClick={() => setRotate(r => r - 90)}
                            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            step="1"
                            value={rotate}
                            onChange={(e) => setRotate(Number(e.target.value))}
                            className="w-24 accent-yellow-600"
                        />
                        <span className="text-gray-400 text-sm w-12">{rotate}°</span>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>

                {/* Help text */}
                <p className="text-center text-gray-500 text-xs">
                    Drag the corners or edges of the crop area to resize. Drag the center to move.
                </p>
            </div>
        </div>
    );
}

