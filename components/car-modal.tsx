"use client"

import { useState } from "react"
import type { Car } from "@/types/car"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarModalProps {
  car: Car
  onClose: () => void
}

export default function CarModal({ car, onClose }: CarModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<boolean[]>([])
  const [imageLoading, setImageLoading] = useState<boolean[]>([])

  const images = car.thumbnails || ["/placeholder.svg?height=400&width=600"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageError = (index: number) => {
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

  const handleImageLoad = (index: number) => {
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

  const getImageSrc = (index: number) => {
    if (imageErrors[index]) {
      return "/placeholder.svg?height=400&width=600"
    }
    return images[index] || "/placeholder.svg?height=400&width=600"
  }

  const getThumbnailSrc = (index: number) => {
    if (imageErrors[index]) {
      return "/placeholder.svg?height=64&width=64"
    }
    return images[index] || "/placeholder.svg?height=64&width=64"
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {car.brand} {car.model}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Slider */}
          <div className="relative">
            <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
              {imageLoading[currentImageIndex] && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
              <img
                src={getImageSrc(currentImageIndex) || "/placeholder.svg"}
                alt={`${car.brand} ${car.model}`}
                className={`w-full h-full object-cover transition-opacity ${
                  imageLoading[currentImageIndex] ? "opacity-0" : "opacity-100"
                }`}
                onError={() => handleImageError(currentImageIndex)}
                onLoad={() => handleImageLoad(currentImageIndex)}
                crossOrigin="anonymous"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      index === currentImageIndex ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={getThumbnailSrc(index) || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(index)}
                      onLoad={() => handleImageLoad(index)}
                      crossOrigin="anonymous"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Brand</h3>
                <p className="text-lg">{car.brand}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Model</h3>
                <p className="text-lg">{car.model}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Year</h3>
                <p className="text-lg">{car.year}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Price</h3>
                <p className="text-lg font-bold text-green-600">${car.price?.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Color</h3>
                <p className="text-lg">{car.color}</p>
              </div>
              {car.mileage && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Mileage</h3>
                  <p className="text-lg">{car.mileage.toLocaleString()} miles</p>
                </div>
              )}
            </div>

            {car.description && (
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{car.description}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
