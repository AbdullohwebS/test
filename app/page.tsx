"use client"

import { useState, useEffect, useRef } from "react"
import type { Car, CarFormData } from "@/types/car"
import CarList from "@/components/car-list"
import CarForm from "@/components/car-form"
import CarModal from "@/components/car-modal"
import SearchBar from "@/components/search-bar"
import FilterBar from "@/components/filter-bar"
import Pagination from "@/components/pagination"
import LoginModal from "@/components/login-modal"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, User } from "lucide-react"

const API_BASE = "https://json-api.uz/api/project/fn37"

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([])
  const [allCars, setAllCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Car[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedBrand, setSelectedBrand] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingAction, setPendingAction] = useState<"add" | "edit" | null>(null)
  const workerRef = useRef<Worker>()

  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    // Check if user is already logged in
    const savedAuth = localStorage.getItem("carapp_auth")
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true)
    }

    // Initialize Web Worker for search
    const workerCode = `
    self.onmessage = (event) => {
      const { cars, query } = event.data

      if (!query || !cars) {
        self.postMessage({ results: [] })
        return
      }

      const searchTerm = query.toLowerCase()

      const results = cars.filter((car) => {
        const brand = car.brand?.toLowerCase() || ""
        const model = car.model?.toLowerCase() || ""

        return brand.includes(searchTerm) || model.includes(searchTerm)
      })

      setTimeout(() => {
        self.postMessage({ results })
      }, 300)
    }
  `

    const blob = new Blob([workerCode], { type: "application/javascript" })
    workerRef.current = new Worker(URL.createObjectURL(blob))

    workerRef.current.onmessage = (event) => {
      const { results } = event.data
      setSearchResults(results)
      setIsSearching(false)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterAndPaginateCars()
  }, [currentPage, selectedBrand, allCars])

  const initializeData = async () => {
    setLoading(true)
    setApiStatus("checking")

    try {
      const response = await fetch(`${API_BASE}/cars`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()

          let carsData: Car[] = []
          if (Array.isArray(data)) {
            carsData = data
          } else if (data.data && Array.isArray(data.data)) {
            carsData = data.data
          } else if (data.cars && Array.isArray(data.cars)) {
            carsData = data.cars
          }

          if (carsData.length > 0) {
            setAllCars(carsData)
            setApiStatus("online")
            return
          }
        }
      }

      throw new Error("API not available or invalid response")
    } catch (error) {
      console.warn("API not available, using mock data:", error)
      setApiStatus("offline")

      const mockCars = generateMockCars()
      setAllCars(mockCars)
    } finally {
      setLoading(false)
    }
  }

  const filterAndPaginateCars = () => {
    let filteredCars = allCars

    if (selectedBrand && selectedBrand !== "all") {
      filteredCars = allCars.filter((car) => car.brand === selectedBrand)
    }

    const totalItems = filteredCars.length
    setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE))

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedCars = filteredCars.slice(startIndex, endIndex)

    setCars(paginatedCars)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setIsSearching(true)
      workerRef.current?.postMessage({ cars: allCars, query })
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const handleLogin = (username: string, password: string): boolean => {
    if (username === "fn37-best" && password === "maybe") {
      setIsAuthenticated(true)
      localStorage.setItem("carapp_auth", "authenticated")
      setShowLogin(false)

      // Execute pending action
      if (pendingAction === "add") {
        setShowForm(true)
      } else if (pendingAction === "edit" && editingCar) {
        setShowForm(true)
      }
      setPendingAction(null)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("carapp_auth")
    setShowForm(false)
    setEditingCar(null)
  }

  const handleAddCarClick = () => {
    if (!isAuthenticated) {
      setPendingAction("add")
      setShowLogin(true)
      return
    }
    setShowForm(true)
  }

  const handleEditCarClick = (car: Car) => {
    if (!isAuthenticated) {
      setEditingCar(car)
      setPendingAction("edit")
      setShowLogin(true)
      return
    }
    setEditingCar(car)
    setShowForm(true)
  }

  const handleCreateCar = async (carData: CarFormData) => {
    const newCar: Car = {
      id: `car-${Date.now()}`,
      ...carData,
    }

    if (apiStatus === "online") {
      try {
        const response = await fetch(`${API_BASE}/cars`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(carData),
        })

        if (response.ok) {
          setAllCars((prev) => [newCar, ...prev])
          setShowForm(false)
          return
        }
      } catch (error) {
        console.error("Error creating car via API:", error)
      }
    }

    setAllCars((prev) => [newCar, ...prev])
    setShowForm(false)
  }

  const handleUpdateCar = async (id: string, carData: CarFormData) => {
    if (apiStatus === "online") {
      try {
        const response = await fetch(`${API_BASE}/cars/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(carData),
        })

        if (response.ok) {
          setAllCars((prev) => prev.map((car) => (car.id === id ? { ...car, ...carData } : car)))
          setEditingCar(null)
          setShowForm(false)
          return
        }
      } catch (error) {
        console.error("Error updating car via API:", error)
      }
    }

    setAllCars((prev) => prev.map((car) => (car.id === id ? { ...car, ...carData } : car)))
    setEditingCar(null)
    setShowForm(false)
  }

  const handleDeleteCar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return

    if (apiStatus === "online") {
      try {
        const response = await fetch(`${API_BASE}/cars/${id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        })

        if (response.ok) {
          setAllCars((prev) => prev.filter((car) => car.id !== id))
          return
        }
      } catch (error) {
        console.error("Error deleting car via API:", error)
      }
    }

    setAllCars((prev) => prev.filter((car) => car.id !== id))
  }

  const displayedCars = searchQuery ? searchResults : cars

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Car Management System</h1>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <User className="w-4 h-4" />
                    <span>fn37-best</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} isSearching={isSearching} />
            </div>
            <FilterBar selectedBrand={selectedBrand} onBrandChange={setSelectedBrand} />
            <Button onClick={handleAddCarClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Car
            </Button>
          </div>
        </div>

        <CarList
          cars={displayedCars}
          loading={loading || isSearching}
          onCarClick={setSelectedCar}
          onEditCar={handleEditCarClick}
          onDeleteCar={handleDeleteCar}
        />

        {!searchQuery && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

        {selectedCar && <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />}

        {showForm && isAuthenticated && (
          <CarForm
            car={editingCar}
            onSubmit={editingCar ? (data) => handleUpdateCar(editingCar.id, data) : handleCreateCar}
            onClose={() => {
              setShowForm(false)
              setEditingCar(null)
            }}
          />
        )}

        {showLogin && (
          <LoginModal
            onLogin={handleLogin}
            onClose={() => {
              setShowLogin(false)
              setPendingAction(null)
              setEditingCar(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

function generateMockCars(): Car[] {
  const brands = ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Ford"]
  const models = ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Truck", "Wagon"]
  const colors = ["Red", "Blue", "Black", "White", "Silver", "Gray", "Green", "Yellow"]

  const carImages = [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop",
  ]

  return Array.from({ length: 50 }, (_, i) => {
    const randomImages = []
    for (let j = 0; j < 3; j++) {
      randomImages.push(carImages[Math.floor(Math.random() * carImages.length)])
    }

    return {
      id: `car-${i + 1}`,
      brand: brands[Math.floor(Math.random() * brands.length)],
      model: `${models[Math.floor(Math.random() * models.length)]} ${2015 + Math.floor(Math.random() * 9)}`,
      year: 2015 + Math.floor(Math.random() * 9),
      price: 15000 + Math.floor(Math.random() * 50000),
      color: colors[Math.floor(Math.random() * colors.length)],
      mileage: Math.floor(Math.random() * 100000),
      description: `This is a ${colors[Math.floor(Math.random() * colors.length)].toLowerCase()} ${brands[Math.floor(Math.random() * brands.length)]} in excellent condition. Perfect for daily commuting and long trips.`,
      thumbnails: randomImages,
    }
  })
}
