"use client"

import { useState } from "react"

function SearchBar({ onSearch, isSearching }) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by brand or model..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onSearch(e.target.value)
          }}
          className="search-input"
        />
        {isSearching && <span className="search-loading">⏳</span>}
      </div>
    </form>
  )
}

export default SearchBar
