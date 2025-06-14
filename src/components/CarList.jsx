"use client"
import CarCard from "./CarCard"
import CarSkeleton from "./CarSkeleton"

function CarList({ cars, loading, onCarClick, onEditCar, onDeleteCar }) {
  if (loading) {
    return (
      <div className="car-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <CarSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="no-cars">
        <p>No cars found</p>
      </div>
    )
  }

  return (
    <div className="car-grid">
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

export default CarList
