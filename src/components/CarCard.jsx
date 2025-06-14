"use client"

import { useState } from "react"

function CarCard({ car, onClick, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const getImageSrc = () => {
    if (imageError) {
      return "https://via.placeholder.com/300x200?text=No+Image"
    }
    return car.thumbnails?.[0] || "https://via.placeholder.com/300x200?text=Car+Image"
  }

  return (
    <div className="car-card" onClick={onClick}>
      <div className="car-image">
        {imageLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
        <img
          src={getImageSrc() || "/placeholder.svg"}
          alt={`${car.brand} ${car.model}`}
          className={`car-img ${imageLoading ? "loading" : ""}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
      <div className="car-info">
        <h3>
          {car.brand} {car.model}
        </h3>
        <div className="car-details">
          <p>Year: {car.year}</p>
          <p>Price: ${car.price?.toLocaleString()}</p>
          <p>Color: {car.color}</p>
          {car.mileage && <p>Mileage: {car.mileage.toLocaleString()} miles</p>}
        </div>
      </div>
      <div className="car-actions">
        <button
          className="view-btn"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          👁️ View
        </button>
        <button
          className="edit-btn"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          ✏️
        </button>
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default CarCard
