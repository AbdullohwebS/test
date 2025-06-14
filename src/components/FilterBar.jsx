"use client"

const BRANDS = ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Ford", "Chevrolet", "Nissan"]

function FilterBar({ selectedBrand, onBrandChange }) {
  return (
    <div className="filter-bar">
      <select value={selectedBrand || "all"} onChange={(e) => onBrandChange(e.target.value)} className="brand-select">
        <option value="all">All Brands</option>
        {BRANDS.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FilterBar
