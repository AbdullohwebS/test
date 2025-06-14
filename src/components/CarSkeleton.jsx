function CarSkeleton() {
  return (
    <div className="car-card skeleton">
      <div className="car-image skeleton-img"></div>
      <div className="car-info">
        <div className="skeleton-text skeleton-title"></div>
        <div className="car-details">
          <div className="skeleton-text skeleton-detail"></div>
          <div className="skeleton-text skeleton-detail"></div>
          <div className="skeleton-text skeleton-detail"></div>
        </div>
      </div>
      <div className="car-actions">
        <div className="skeleton-btn"></div>
        <div className="skeleton-btn"></div>
        <div className="skeleton-btn"></div>
      </div>
    </div>
  )
}

export default CarSkeleton
