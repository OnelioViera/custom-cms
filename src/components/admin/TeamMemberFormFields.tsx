'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Upload, X, Crop } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';
import RichTextEditor from '@/components/admin/RichTextEditor';

export interface TeamMemberFormDataType {
    name: string;
    role: string;
    description: string;
    avatar: string;
    order: number;
}

interface TeamMemberFormFieldsProps {
    initialData?: any;
    onFormChange?: (data: TeamMemberFormDataType) => void;
}

export interface TeamMemberFormFieldsRef {
    getFormData: () => any;
}

const DEFAULT_DATA: TeamMemberFormDataType = {
    name: '',
    role: '',
    description: '',
    avatar: '',
    order: 0,
};

const TeamMemberFormFields = forwardRef<TeamMemberFormFieldsRef, TeamMemberFormFieldsProps>(
    ({ initialData, onFormChange }, ref) => {
        const [formData, setFormData] = useState<TeamMemberFormDataType>(DEFAULT_DATA);
        const [showCropper, setShowCropper] = useState(false);
        const [tempImage, setTempImage] = useState<string | null>(null);

        useEffect(() => {
            if (initialData) {
                setFormData({
                    name: initialData.data?.name || initialData.name || '',
                    role: initialData.data?.role || initialData.role || '',
                    description: initialData.data?.description || initialData.description || '',
                    avatar: initialData.data?.avatar || initialData.avatar || '',
                    order: initialData.data?.order || initialData.order || 0,
                });
            }
        }, [initialData]);

        useImperativeHandle(ref, () => ({
            getFormData: () => ({
                title: formData.name || 'Untitled Team Member',
                data: {
                    name: formData.name,
                    role: formData.role,
                    description: formData.description,
                    avatar: formData.avatar,
                    order: formData.order,
                },
            }),
        }));

        const updateFormData = (updates: Partial<TeamMemberFormDataType>) => {
            const newData = { ...formData, ...updates };
            setFormData(newData);
            onFormChange?.(newData);
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            const newValue = type === 'number' ? parseInt(value) || 0 : value;
            updateFormData({ [name]: newValue } as Partial<TeamMemberFormDataType>);
        };

        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        };

        const handleCropComplete = (croppedImage: string) => {
            updateFormData({ avatar: croppedImage });
            setShowCropper(false);
            setTempImage(null);
        };

        const removeImage = () => {
            updateFormData({ avatar: '' });
        };

        return (
            <div className="space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., John Martinez"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Role / Position *
                    </label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        placeholder="e.g., Project Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Description *
                    </label>
                    <RichTextEditor
                        value={formData.description}
                        onChange={(value) => updateFormData({ description: value })}
                        placeholder="Brief description of their work and contributions to the project..."
                        minHeight="120px"
                    />
                </div>

                {/* Avatar */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Avatar Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-yellow-500 transition-colors">
                        {formData.avatar ? (
                            <div className="flex items-center gap-4">
                                <img
                                    src={formData.avatar}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover ring-2 ring-yellow-100"
                                />
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTempImage(formData.avatar);
                                            setShowCropper(true);
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                    >
                                        <Crop className="w-4 h-4" />
                                        Crop
                                    </button>
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer block text-center py-6">
                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 text-sm font-medium">Click to upload photo</p>
                                <p className="text-gray-400 text-xs mt-1">Square image recommended (1:1 ratio)</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Display Order */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Display Order
                    </label>
                    <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in the carousel</p>
                </div>

                {/* Image Cropper Modal */}
                {showCropper && tempImage && (
                    <ImageCropper
                        imageSrc={tempImage}
                        onCropComplete={handleCropComplete}
                        onCancel={() => {
                            setShowCropper(false);
                            setTempImage(null);
                        }}
                        aspectRatio={1}
                    />
                )}
            </div>
        );
    }
);

TeamMemberFormFields.displayName = 'TeamMemberFormFields';

export default TeamMemberFormFields;

