"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterBarProps {
  selectedBrand: string
  onBrandChange: (brand: string) => void
}

const BRANDS = ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Ford", "Chevrolet", "Nissan"]

export default function FilterBar({ selectedBrand, onBrandChange }: FilterBarProps) {
  return (
    <div className="w-full md:w-48">
      <Select value={selectedBrand || "all"} onValueChange={onBrandChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {BRANDS.map((brand) => (
            <SelectItem key={brand} value={brand}>
              {brand}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
