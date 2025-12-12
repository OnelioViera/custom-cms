"use client"

import type React from "react"

import { useState } from "react"

interface ProjectFormProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  initialData?: any
}

function ProjectForm({ onSubmit, isLoading = false, initialData }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    client: initialData?.data?.client || "",
    location: initialData?.data?.location || "",
    projectSize: initialData?.data?.projectSize || "",
    capacity: initialData?.data?.capacity || "",
    shortDescription: initialData?.data?.shortDescription || "",
    description: initialData?.data?.description || "",
    challenges: initialData?.data?.challenges || "",
    results: initialData?.data?.results || "",
    projectImage: initialData?.data?.projectImage || "",
    status: initialData?.status || "draft",
  })

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.data?.projectImage || null)

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData((prev) => ({ ...prev, projectImage: base64 }))
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    })
  }

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Project Image</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="space-y-2">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="w-32 h-32 object-cover mx-auto rounded-lg"
              />
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">📤 Click to upload image</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
            </div>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
        {isLoading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
      </button>
    </form>
  )
}

export default ProjectForm
