"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Car, CarFormData } from "@/types/car"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"

interface CarFormProps {
  car?: Car | null
  onSubmit: (data: CarFormData) => void
  onClose: () => void
}

const BRANDS = ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Ford", "Chevrolet", "Nissan"]
const COLORS = ["Red", "Blue", "Black", "White", "Silver", "Gray", "Green", "Yellow"]

export default function CarForm({ car, onSubmit, onClose }: CarFormProps) {
  const [formData, setFormData] = useState<CarFormData>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    color: "",
    mileage: 0,
    description: "",
    thumbnails: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (car) {
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price || 0,
        color: car.color,
        mileage: car.mileage || 0,
        description: car.description || "",
        thumbnails: car.thumbnails || [],
      })
    }
  }, [car])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.brand) newErrors.brand = "Brand is required"
    if (!formData.model) newErrors.model = "Model is required"
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Please enter a valid year"
    }
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (!formData.color) newErrors.color = "Color is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          console.warn("Skipping non-image file:", file.name)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn("File too large:", file.name)
          continue
        }

        // Try API upload first
        let imageUrl = null

        try {
          const formDataUpload = new FormData()
          formDataUpload.append("file", file)

          const response = await fetch("https://json-api.uz/api/project/fn37/upload", {
            method: "POST",
            body: formDataUpload,
          })

          if (response.ok) {
            const data = await response.json()
            imageUrl = data.url || data.file_url || data.path
          }
        } catch (apiError) {
          console.warn("API upload failed, using local preview:", apiError)
        }

        // Fallback to local object URL for preview
        if (!imageUrl) {
          imageUrl = URL.createObjectURL(file)
        }

        uploadedUrls.push(imageUrl)
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          thumbnails: [...(prev.thumbnails || []), ...uploadedUrls],
        }))
      }
    } catch (error) {
      console.error("Upload process failed:", error)
    } finally {
      setUploading(false)
      // Clear the input
      e.target.value = ""
    }
  }

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      thumbnails: prev.thumbnails?.filter((_, index) => index !== indexToRemove) || [],
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Create a synthetic event to reuse the upload logic
    const syntheticEvent = {
      target: { files: files, value: "" },
    } as React.ChangeEvent<HTMLInputElement>

    handleImageUpload(syntheticEvent)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{car ? "Edit Car" : "Add New Car"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, brand: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="Enter model"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
            </div>

            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) }))}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label htmlFor="color">Color *</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
            </div>

            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData((prev) => ({ ...prev, mileage: Number.parseInt(e.target.value) }))}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter car description..."
              rows={3}
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Car Images</Label>

            {/* Drag and Drop Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">Drag and drop images here, or click to select files</p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Select Images"}
              </Button>
              <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, GIF. Max size: 5MB per file.</p>
            </div>

            {/* Image Preview Grid */}
            {formData.thumbnails && formData.thumbnails.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.thumbnails.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=150&width=150"
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
              {car ? "Update Car" : "Add Car"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
