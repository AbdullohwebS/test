"use client"

import { useState, useEffect } from "react"

const BRANDS = ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Ford", "Chevrolet", "Nissan"]
const COLORS = ["Red", "Blue", "Black", "White", "Silver", "Gray", "Green", "Yellow"]

function CarForm({ car, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    color: "",
    mileage: 0,
    description: "",
    thumbnails: [],
  })
  const [errors, setErrors] = useState({})
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

  const validateForm = () => {
    const newErrors = {}

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedUrls = []

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          console.warn("Skipping non-image file:", file.name)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          console.warn("File too large:", file.name)
          continue
        }

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
      e.target.value = ""
    }
  }

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      thumbnails: prev.thumbnails?.filter((_, index) => index !== indexToRemove) || [],
    }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const syntheticEvent = {
      target: { files: files, value: "" },
    }

    handleImageUpload(syntheticEvent)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{car ? "Edit Car" : "Add New Car"}</h2>
          <button className="close-btn" onClick={onClose}>
            ❌
          </button>
        </div>

        <form onSubmit={handleSubmit} className="car-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="brand">Brand *</label>
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                className="form-input"
              >
                <option value="">Select brand</option>
                {BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="error">{errors.brand}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                id="model"
                type="text"
                value={formData.model}
                onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="Enter model"
                className="form-input"
              />
              {errors.model && <p className="error">{errors.model}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))}
                min="1900"
                max={new Date().getFullYear() + 1}
                className="form-input"
              />
              {errors.year && <p className="error">{errors.year}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) }))}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="form-input"
              />
              {errors.price && <p className="error">{errors.price}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="color">Color *</label>
              <select
                id="color"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                className="form-input"
              >
                <option value="">Select color</option>
                {COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              {errors.color && <p className="error">{errors.color}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="mileage">Mileage</label>
              <input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData((prev) => ({ ...prev, mileage: Number.parseInt(e.target.value) }))}
                min="0"
                placeholder="0"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter car description..."
              rows={3}
              className="form-input"
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group full-width">
            <label>Car Images</label>

            <div className="upload-area" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="upload-icon">📁</div>
              <p>Drag and drop images here, or click to select files</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                id="image-upload"
                disabled={uploading}
              />
              <button
                type="button"
                className="upload-btn"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Select Images"}
              </button>
              <p className="upload-info">Supported formats: JPG, PNG, GIF. Max size: 5MB per file.</p>
            </div>

            {formData.thumbnails && formData.thumbnails.length > 0 && (
              <div className="image-preview-grid">
                {formData.thumbnails.map((url, index) => (
                  <div key={index} className="image-preview">
                    <img
                      src={url || "https://via.placeholder.com/150x150?text=Error"}
                      alt={`Upload ${index + 1}`}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150x150?text=Error"
                      }}
                    />
                    <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={uploading}>
              {car ? "Update Car" : "Add Car"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CarForm
