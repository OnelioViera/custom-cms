'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Upload, X, Crop, Star } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';
import RichTextEditor from '@/components/admin/RichTextEditor';

export interface TestimonialFormDataType {
    quote: string;
    authorName: string;
    authorTitle: string;
    authorCompany: string;
    authorImage: string;
    rating: number;
    featured: boolean;
}

interface TestimonialFormFieldsProps {
    initialData?: any;
    onFormChange?: (data: TestimonialFormDataType) => void;
}

export interface TestimonialFormFieldsRef {
    getFormData: () => any;
}

const DEFAULT_DATA: TestimonialFormDataType = {
    quote: '',
    authorName: '',
    authorTitle: '',
    authorCompany: '',
    authorImage: '',
    rating: 5,
    featured: false,
};

const TestimonialFormFields = forwardRef<TestimonialFormFieldsRef, TestimonialFormFieldsProps>(
    ({ initialData, onFormChange }, ref) => {
        const [formData, setFormData] = useState<TestimonialFormDataType>(DEFAULT_DATA);
        const [showCropper, setShowCropper] = useState(false);
        const [tempImage, setTempImage] = useState<string | null>(null);

        useEffect(() => {
            if (initialData) {
                setFormData({
                    quote: initialData.data?.quote || initialData.quote || '',
                    authorName: initialData.data?.authorName || initialData.authorName || '',
                    authorTitle: initialData.data?.authorTitle || initialData.authorTitle || '',
                    authorCompany: initialData.data?.authorCompany || initialData.authorCompany || '',
                    authorImage: initialData.data?.authorImage || initialData.authorImage || '',
                    rating: initialData.data?.rating || initialData.rating || 5,
                    featured: initialData.data?.featured || initialData.featured || false,
                });
            }
        }, [initialData]);

        useImperativeHandle(ref, () => ({
            getFormData: () => ({
                title: formData.authorName || 'Untitled Testimonial',
                data: {
                    quote: formData.quote,
                    authorName: formData.authorName,
                    authorTitle: formData.authorTitle,
                    authorCompany: formData.authorCompany,
                    authorImage: formData.authorImage,
                    rating: formData.rating,
                    featured: formData.featured,
                },
            }),
        }));

        const updateFormData = (updates: Partial<TestimonialFormDataType>) => {
            const newData = { ...formData, ...updates };
            setFormData(newData);
            onFormChange?.(newData);
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
            updateFormData({ [name]: newValue } as Partial<TestimonialFormDataType>);
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
            updateFormData({ authorImage: croppedImage });
            setShowCropper(false);
            setTempImage(null);
        };

        const removeImage = () => {
            updateFormData({ authorImage: '' });
        };

        const setRating = (rating: number) => {
            updateFormData({ rating });
        };

        return (
            <div className="space-y-6">
                {/* Quote */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Testimonial Quote *
                    </label>
                    <RichTextEditor
                        value={formData.quote}
                        onChange={(value) => updateFormData({ quote: value })}
                        placeholder="What did the client say about your work?"
                        minHeight="150px"
                    />
                </div>

                {/* Author Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Author Name *
                    </label>
                    <input
                        type="text"
                        name="authorName"
                        value={formData.authorName}
                        onChange={handleInputChange}
                        placeholder="e.g., John Smith"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                    />
                </div>

                {/* Author Title & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Author Title
                        </label>
                        <input
                            type="text"
                            name="authorTitle"
                            value={formData.authorTitle}
                            onChange={handleInputChange}
                            placeholder="e.g., Project Manager"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Company
                        </label>
                        <input
                            type="text"
                            name="authorCompany"
                            value={formData.authorCompany}
                            onChange={handleInputChange}
                            placeholder="e.g., ABC Solar Corp"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 text-gray-900"
                        />
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Rating
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="p-1 hover:scale-110 transition-transform"
                            >
                                <Star
                                    className={`w-8 h-8 ${
                                        star <= formData.rating
                                            ? 'text-yellow-500 fill-yellow-500'
                                            : 'text-gray-300'
                                    }`}
                                />
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                            {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Author Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Author Photo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-yellow-500 transition-colors">
                        {formData.authorImage ? (
                            <div className="flex items-center gap-4">
                                <img
                                    src={formData.authorImage}
                                    alt="Author"
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTempImage(formData.authorImage);
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
                            <label className="cursor-pointer block text-center py-4">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 text-sm">Click to upload photo</p>
                                <p className="text-gray-400 text-xs mt-1">Square image recommended</p>
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

                {/* Featured Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                        Featured Testimonial
                        <span className="block text-xs text-gray-500 font-normal">
                            Featured testimonials appear first on the homepage
                        </span>
                    </label>
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

TestimonialFormFields.displayName = 'TestimonialFormFields';

export default TestimonialFormFields;

