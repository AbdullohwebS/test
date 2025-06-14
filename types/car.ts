export interface Car {
  id: string
  brand: string
  model: string
  year: number
  price?: number
  color: string
  mileage?: number
  description?: string
  thumbnails?: string[]
}

export interface CarFormData {
  brand: string
  model: string
  year: number
  price: number
  color: string
  mileage?: number
  description?: string
  thumbnails?: string[]
}
