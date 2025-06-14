"use client"

import type { Car } from "@/types/car"
import CarCard from "./car-card"
import CarSkeleton from "./car-skeleton"

interface CarListProps {
  cars: Car[]
  loading: boolean
  onCarClick: (car: Car) => void
  onEditCar: (car: Car) => void
  onDeleteCar: (id: string) => void
}

export default function CarList({ cars, loading, onCarClick, onEditCar, onDeleteCar }: CarListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <CarSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No cars found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          onClick={() => onCarClick(car)}
          onEdit={() => onEditCar(car)}
          onDelete={() => onDeleteCar(car.id)}
        />
      ))}
    </div>
  )
}
