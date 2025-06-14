"use client"

import { useState, useEffect, useRef } from "react"
import CarList from "./components/CarList"
import CarForm from "./components/CarForm"
import CarModal from "./components/CarModal"
import SearchBar from "./components/SearchBar"
import FilterBar from "./components/FilterBar"
import Pagination from "./components/Pagination"
import LoginModal from "./components/LoginModal"
import "./App.css"

const API_BASE = "https://json-api.uz/api/project/fn37"

function App() {
  const [cars, setCars] = useState([])
  const [allCars, setAllCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedBrand, setSelectedBrand] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [apiStatus, setApiStatus] = useState("checking")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const workerRef = useRef()

  const ITEMS_PER_PAGE = 5

  /* ───────────────────────────────────
     ▸ Sarlavhani o‘zgartirish (tab title)
     ─────────────────────────────────── */
  useEffect(() => {
    document.title = "Car Manager | FN37"
  }, [])

  useEffect(() => {
    document.title = "Car Manager | FN37"
  }, [])

  useEffect(() => {

    const savedAuth = localStorage.getItem("carapp_auth")
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true)
    }

    const workerCode = `
      self.onmessage = (event) => {
        const { cars, query } = event.data;
        if (!query || !cars) {
          self.postMessage({ results: [] });
          return;
        }
        const searchTerm = query.toLowerCase();
        const results = cars.filter((car) => {
          const brand = car.brand?.toLowerCase() || "";
          const model = car.model?.toLowerCase() || "";
          return brand.includes(searchTerm) || model.includes(searchTerm);
        });
        setTimeout(() => self.postMessage({ results }), 300);
      };
    `
    const blob = new Blob([workerCode], { type: "application/javascript" })
    workerRef.current = new Worker(URL.createObjectURL(blob))

    workerRef.current.onmessage = (event) => {
      const { results } = event.data
      setSearchResults(results)
      setIsSearching(false)
    }

    return () => workerRef.current?.terminate()
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
      const response = await fetch(`${API_BASE}/cars`)
      if (response.ok) {
        const data = await response.json()
        const carsData =
          Array.isArray(data)
            ? data
            : Array.isArray(data.data)
<<<<<<< HEAD
              ? data.data
              : Array.isArray(data.cars)
                ? data.cars
                : []
=======
            ? data.data
            : Array.isArray(data.cars)
            ? data.cars
            : []
>>>>>>> 6768db0c3fff17bd8144269a8c5689ae311eef3d
        if (carsData.length) {
          setAllCars(carsData)
          setApiStatus("online")
          return
        }
      }
      throw new Error("API not available or invalid response")
    } catch (error) {
      console.warn("API not available, using mock data:", error)
      setApiStatus("offline")
      setAllCars(generateMockCars())
    } finally {
      setLoading(false)
    }
  }

  const filterAndPaginateCars = () => {
    let filtered = allCars
    if (selectedBrand && selectedBrand !== "all") {
      filtered = allCars.filter((car) => car.brand === selectedBrand)
    }
    const totalItems = filtered.length
    setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE))
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    setCars(filtered.slice(start, start + ITEMS_PER_PAGE))
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      setIsSearching(true)
      workerRef.current?.postMessage({ cars: allCars, query })
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const handleLogin = (username, password) => {
    if (username === "fn37-best" && password === "maybe") {
      setIsAuthenticated(true)
      localStorage.setItem("carapp_auth", "authenticated")
      setShowLogin(false)
      if (pendingAction === "add") setShowForm(true)
      if (pendingAction === "edit" && editingCar) setShowForm(true)
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

  const handleEditCarClick = (car) => {
    if (!isAuthenticated) {
      setEditingCar(car)
      setPendingAction("edit")
      setShowLogin(true)
      return
    }
    setEditingCar(car)
    setShowForm(true)
  }

  const handleCreateCar = async (carData) => {
    const newCar = { id: `car-${Date.now()}`, ...carData }
    if (apiStatus === "online") {
      try {
        const res = await fetch(`${API_BASE}/cars`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(carData),
        })
        if (res.ok) {
          setAllCars((prev) => [newCar, ...prev])
          setShowForm(false)
          return
        }
      } catch (e) {
        console.error("Error creating car via API:", e)
      }
    }
    setAllCars((prev) => [newCar, ...prev])
    setShowForm(false)
  }

  const handleUpdateCar = async (id, carData) => {
    if (apiStatus === "online") {
      try {
        const res = await fetch(`${API_BASE}/cars/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(carData),
        })
        if (res.ok) {
          setAllCars((prev) =>
            prev.map((car) => (car.id === id ? { ...car, ...carData } : car)),
          )
          setEditingCar(null)
          setShowForm(false)
          return
        }
      } catch (e) {
        console.error("Error updating car via API:", e)
      }
    }
    setAllCars((prev) =>
      prev.map((car) => (car.id === id ? { ...car, ...carData } : car)),
    )
    setEditingCar(null)
    setShowForm(false)
  }

  const handleDeleteCar = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return
    if (apiStatus === "online") {
      try {
        const res = await fetch(`${API_BASE}/cars/${id}`, { method: "DELETE" })
        if (res.ok) {
          setAllCars((prev) => prev.filter((car) => car.id !== id))
          return
        }
      } catch (e) {
        console.error("Error deleting car via API:", e)
      }
    }
    setAllCars((prev) => prev.filter((car) => car.id !== id))
  }

  const displayedCars = searchQuery ? searchResults : cars

  return (
    <div className="app">
      <div className="container">
        {/* ───────── Header ───────── */}
        <div className="header">
          <div className="header-top">
            <h1>Car Manager</h1>
            {isAuthenticated && (
              <div className="user-info">
                <span className="user-badge">
                  👤 <strong>fn37-best</strong>
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          <div className="controls">
            <SearchBar onSearch={handleSearch} isSearching={isSearching} />
            <FilterBar
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
            />
            <button className="add-btn" onClick={handleAddCarClick}>
              ➕ Add Car
            </button>
          </div>
        </div>

        {/* ───────── Car List ───────── */}
        <CarList
          cars={displayedCars}
          loading={loading || isSearching}
          onCarClick={setSelectedCar}
          onEditCar={handleEditCarClick}
          onDeleteCar={handleDeleteCar}
        />

        {!searchQuery && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

<<<<<<< HEAD
        {/* ───────── Modals ───────── */}
=======
>>>>>>> 6768db0c3fff17bd8144269a8c5689ae311eef3d
        {selectedCar && (
          <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
        )}

        {showForm && isAuthenticated && (
          <CarForm
            car={editingCar}
            onSubmit={
              editingCar
                ? (data) => handleUpdateCar(editingCar.id, data)
                : handleCreateCar
            }
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

/* ──────────────────────────
   ▸ Mock data generator
   ────────────────────────── */
function generateMockCars() {
  const brands = ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Ford"]
  const models = [
    "Sedan",
    "SUV",
    "Hatchback",
    "Coupe",
    "Convertible",
    "Truck",
    "Wagon",
  ]
  const colors = [
    "Red",
    "Blue",
    "Black",
    "White",
    "Silver",
    "Gray",
    "Green",
    "Yellow",
  ]
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

  return Array.from({ length: 50 }, (_, i) => ({
    id: `car-${i + 1}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
<<<<<<< HEAD
    model: `${models[Math.floor(Math.random() * models.length)]} ${2015 + Math.floor(Math.random() * 9)
      }`,
=======
    model: `${models[Math.floor(Math.random() * models.length)]} ${
      2015 + Math.floor(Math.random() * 9)
    }`,
>>>>>>> 6768db0c3fff17bd8144269a8c5689ae311eef3d
    year: 2015 + Math.floor(Math.random() * 9),
    price: 15000 + Math.floor(Math.random() * 50000),
    color: colors[Math.floor(Math.random() * colors.length)],
    mileage: Math.floor(Math.random() * 100000),
    description:
      "This is an excellent vehicle, perfect for daily commuting and long trips.",
    thumbnails: Array.from({ length: 3 }, () =>
      carImages[Math.floor(Math.random() * carImages.length)],
    ),
  }))
}

export default App
