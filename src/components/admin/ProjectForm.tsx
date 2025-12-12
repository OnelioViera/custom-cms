'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Crop, X } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';

interface ProjectFormProps {
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
    initialData?: any;
}

export default function ProjectForm({ onSubmit, isLoading = false, initialData }: ProjectFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        client: initialData?.data?.client || '',
        location: initialData?.data?.location || '',
        projectSize: initialData?.data?.projectSize || '',
        capacity: initialData?.data?.capacity || '',
        shortDescription: initialData?.data?.shortDescription || '',
        description: initialData?.data?.description || '',
        challenges: initialData?.data?.challenges || '',
        results: initialData?.data?.results || '',
        projectImage: initialData?.data?.projectImage || '',
        status: initialData?.status || 'draft',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.data?.projectImage || null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setTempImage(base64);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = (croppedImage: string) => {
        setFormData((prev) => ({ ...prev, projectImage: croppedImage }));
        setImagePreview(croppedImage);
        setShowCropper(false);
        setTempImage(null);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setTempImage(null);
    };

    const openCropperForExisting = () => {
        if (imagePreview) {
            setTempImage(imagePreview);
            setShowCropper(true);
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, projectImage: '' }));
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            title: formData.title,
            status: formData.status,
            data: {
                client: formData.client,
                location: formData.location,
                projectSize: formData.projectSize,
                capacity: formData.capacity,
                shortDescription: formData.shortDescription,
                description: formData.description,
                challenges: formData.challenges,
                results: formData.results,
                projectImage: formData.projectImage,
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Project Title *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Client */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Client *</label>
                <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Location</label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Oklahoma, USA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Project Size */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Project Size</label>
                <input
                    type="text"
                    name="projectSize"
                    value={formData.projectSize}
                    onChange={handleInputChange}
                    placeholder="e.g., Large (5-10MW)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Capacity */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Capacity</label>
                <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 69 beams @ 45 tons each"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Short Description */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Short Description *</label>
                <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Full Description */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Full Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Challenges */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Challenges</label>
                <textarea
                    name="challenges"
                    value={formData.challenges}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Results */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Results & Impact</label>
                <textarea
                    name="results"
                    value={formData.results}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Project Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-yellow-500 transition-colors">
                    {imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={openCropperForExisting}
                                    className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                    title="Crop/Resize"
                                >
                                    <Crop className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                    title="Remove"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <label className="absolute bottom-2 left-2 px-3 py-1.5 bg-white/90 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-white transition flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Replace
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    ) : (
                        <label className="cursor-pointer block text-center py-6">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-1 font-medium">Click to upload image</p>
                            <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium"
            >
                {isLoading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
            </button>

            {/* Image Cropper Modal */}
            {showCropper && tempImage && (
                <ImageCropper
                    imageSrc={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspectRatio={4 / 3}
                    backgroundColor="#dbeafe"
                />
            )}
        </form>
    );
}
