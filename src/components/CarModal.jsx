"use client"

import { useState } from "react"

function CarModal({ car, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState([])
  const [imageLoading, setImageLoading] = useState([])

  const images = car.thumbnails || ["https://via.placeholder.com/600x400?text=No+Image"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageError = (index) => {
    setImageErrors((prev) => {
      const newErrors = [...prev]
      newErrors[index] = true
      return newErrors
    })
    setImageLoading((prev) => {
      const newLoading = [...prev]
      newLoading[index] = false
      return newLoading
    })
  }

  const handleImageLoad = (index) => {
    setImageLoading((prev) => {
      const newLoading = [...prev]
      newLoading[index] = false
      return newLoading
    })
    setImageErrors((prev) => {
      const newErrors = [...prev]
      newErrors[index] = false
      return newErrors
    })
  }

  const getImageSrc = (index) => {
    if (imageErrors[index]) {
      return "https://via.placeholder.com/600x400?text=Image+Error"
    }
    return images[index] || "https://via.placeholder.com/600x400?text=No+Image"
  }

  const getThumbnailSrc = (index) => {
    if (imageErrors[index]) {
      return "https://via.placeholder.com/64x64?text=Error"
    }
    return images[index] || "https://via.placeholder.com/64x64?text=No+Image"
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {car.brand} {car.model}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ❌
          </button>
        </div>

        <div className="modal-body">
          {/* Image Slider */}
          <div className="image-section">
            <div className="main-image">
              {imageLoading[currentImageIndex] && (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
              <img
                src={getImageSrc(currentImageIndex) || "/placeholder.svg"}
                alt={`${car.brand} ${car.model}`}
                className={`modal-img ${imageLoading[currentImageIndex] ? "loading" : ""}`}
                onError={() => handleImageError(currentImageIndex)}
                onLoad={() => handleImageLoad(currentImageIndex)}
              />

              {images.length > 1 && (
                <>
                  <button className="nav-btn prev-btn" onClick={prevImage}>
                    ⬅️
                  </button>
                  <button className="nav-btn next-btn" onClick={nextImage}>
                    ➡️
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                  >
                    <img
                      src={getThumbnailSrc(index) || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      onError={() => handleImageError(index)}
                      onLoad={() => handleImageLoad(index)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="details-section">
            <div className="details-grid">
              <div className="detail-item">
                <h3>Brand</h3>
                <p>{car.brand}</p>
              </div>
              <div className="detail-item">
                <h3>Model</h3>
                <p>{car.model}</p>
              </div>
              <div className="detail-item">
                <h3>Year</h3>
                <p>{car.year}</p>
              </div>
              <div className="detail-item">
                <h3>Price</h3>
                <p className="price">${car.price?.toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <h3>Color</h3>
                <p>{car.color}</p>
              </div>
              {car.mileage && (
                <div className="detail-item">
                  <h3>Mileage</h3>
                  <p>{car.mileage.toLocaleString()} miles</p>
                </div>
              )}
            </div>

            {car.description && (
              <div className="description">
                <h3>Description</h3>
                <p>{car.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarModal
