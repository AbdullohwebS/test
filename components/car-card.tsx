"use client"

import type { Car } from "@/types/car"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import { useState } from "react"

interface CarCardProps {
  car: Car
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CarCard({ car, onClick, onEdit, onDelete }: CarCardProps) {
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
      return "/placeholder.svg?height=200&width=300"
    }
    return car.thumbnails?.[0] || "/placeholder.svg?height=200&width=300"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={onClick}>
        <div className="relative h-48 bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <img
            src={getImageSrc() || "/placeholder.svg"}
            alt={`${car.brand} ${car.model}`}
            className={`w-full h-full object-cover transition-opacity ${imageLoading ? "opacity-0" : "opacity-100"}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {car.brand} {car.model}
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <p>Year: {car.year}</p>
            <p>Price: ${car.price?.toLocaleString()}</p>
            <p>Color: {car.color}</p>
            {car.mileage && <p>Mileage: {car.mileage.toLocaleString()} miles</p>}
          </div>
        </CardContent>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
