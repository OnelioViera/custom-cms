'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Upload, Crop, X } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';
import RichTextEditor from '@/components/admin/RichTextEditor';

export interface FormDataType {
    title: string;
    client: string;
    location: string;
    projectSize: string;
    capacity: string;
    shortDescription: string;
    description: string;
    challenges: string;
    results: string;
    projectImage: string;
}

interface ProjectFormFieldsProps {
    initialData?: any;
    onFormChange?: (data: FormDataType) => void;
}

export interface ProjectFormFieldsRef {
    getFormData: () => any;
}

const ProjectFormFields = forwardRef<ProjectFormFieldsRef, ProjectFormFieldsProps>(
    ({ initialData, onFormChange }, ref) => {
        const [formData, setFormData] = useState<FormDataType>({
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
        });

        const [imagePreview, setImagePreview] = useState<string | null>(initialData?.data?.projectImage || null);
        const [showCropper, setShowCropper] = useState(false);
        const [tempImage, setTempImage] = useState<string | null>(null);

        const [isInitialized, setIsInitialized] = useState(false);

        // Update form data when initialData changes
        useEffect(() => {
            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    client: initialData.data?.client || '',
                    location: initialData.data?.location || '',
                    projectSize: initialData.data?.projectSize || '',
                    capacity: initialData.data?.capacity || '',
                    shortDescription: initialData.data?.shortDescription || '',
                    description: initialData.data?.description || '',
                    challenges: initialData.data?.challenges || '',
                    results: initialData.data?.results || '',
                    projectImage: initialData.data?.projectImage || '',
                });
                setImagePreview(initialData.data?.projectImage || null);
                setIsInitialized(true);
            }
        }, [initialData]);

        // Expose getFormData method to parent via ref
        useImperativeHandle(ref, () => ({
            getFormData: () => ({
                title: formData.title,
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
            }),
        }));

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            const newData = { ...formData, [name]: value };
            setFormData(newData);
            // Call onFormChange after state update is scheduled
            setTimeout(() => onFormChange?.(newData), 0);
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
            const newData = { ...formData, projectImage: croppedImage };
            setFormData(newData);
            setImagePreview(croppedImage);
            setShowCropper(false);
            setTempImage(null);
            // Call onFormChange after state update is scheduled
            setTimeout(() => onFormChange?.(newData), 0);
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
            const newData = { ...formData, projectImage: '' };
            setFormData(newData);
            setImagePreview(null);
            // Call onFormChange after state update is scheduled
            setTimeout(() => onFormChange?.(newData), 0);
        };

        const handleRichTextChange = (field: keyof FormDataType) => (value: string) => {
            const newData = { ...formData, [field]: value };
            setFormData(newData);
            setTimeout(() => onFormChange?.(newData), 0);
        };

        return (
            <div className="space-y-6">
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

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <RichTextEditor
                        value={formData.shortDescription}
                        onChange={handleRichTextChange('shortDescription')}
                        placeholder="A brief summary of the project (shown in cards)"
                        minHeight="80px"
                    />
                </div>

                {/* Full Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Full Description</label>
                    <RichTextEditor
                        value={formData.description}
                        onChange={handleRichTextChange('description')}
                        placeholder="Detailed project description (shown on project page)"
                        minHeight="150px"
                    />
                </div>

                {/* Challenges */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Challenges</label>
                    <RichTextEditor
                        value={formData.challenges}
                        onChange={handleRichTextChange('challenges')}
                        placeholder="What challenges did this project face?"
                        minHeight="100px"
                    />
                </div>

                {/* Results */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Results & Impact</label>
                    <RichTextEditor
                        value={formData.results}
                        onChange={handleRichTextChange('results')}
                        placeholder="What were the outcomes and impact?"
                        minHeight="100px"
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
            </div>
        );
    }
);

ProjectFormFields.displayName = 'ProjectFormFields';

export default ProjectFormFields;

