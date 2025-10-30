import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import Catalog from './pages/Catalog.jsx'
import FilmDetail from './pages/FilmDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Logo from './assets/images/Sakila.svg'
import MagnifyIcon from './assets/images/Search.svg'

function Navbar({ searchQ, setSearchQ, rating, setRating, onSearch }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = location.pathname === '/' ? 'catalog' : ''
  const token = localStorage.getItem('token')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch(searchQ)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <header
      style={{ backgroundColor: '#121212ff' }}
      className="sticky top-0 z-40 text-white shadow transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <Link to="/" className="flex items-center">
          <img src={Logo} alt="SAKILA Logo" className="h-10" />
        </Link>

        {/* SEARCH BAR */}
        {location.pathname !== '/login' && location.pathname !== '/register' && (
          <div className="flex flex-1 justify-center md:justify-start gap-3 flex-wrap mt-2 md:mt-0 relative">
            <div className="relative flex-1 max-w-[300px]">
              <img
                src={MagnifyIcon}
                alt="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70 pointer-events-none"
              />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for Movies"
                className="rounded-full pl-12 pr-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-black placeholder-black/70 w-full"
              />
            </div>

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="rounded-full px-4 py-2 shadow-sm bg-transparent text-white font-bold focus:outline-none border border-transparent hover:border-slate-400"
            >
              <option value="" className="text-white">
                All ratings
              </option>
              {['G', 'PG', 'PG-13', 'R', 'NC-17'].map((r) => (
                <option key={r} value={r} className="text-black">
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* NAV LINKS */}
        <nav className="flex gap-3 md:gap-6 mt-2 md:mt-0">
          <Link
            to="/"
            className="px-3 py-2 text-lg font-bold hover:border-slate-400 rounded-full border-2 border-transparent"
          >
            Catalog
          </Link>

          {token ? (
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-lg font-bold hover:text-red-400"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-2 text-lg font-bold hover:text-blue-400"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const [searchQ, setSearchQ] = useState('')
  const [rating, setRating] = useState('')
  const [categoryId, setCategoryId] = useState('')

  function handleSearch(query) {
    setSearchQ(query)
  }

  return (
    <BrowserRouter>
      <style>{`body { overflow-y: scroll; }`}</style>
      <div
        className="min-h-full flex flex-col text-slate-100"
        style={{ backgroundColor: '#090909ff' }}
      >
        <Navbar
          searchQ={searchQ}
          setSearchQ={setSearchQ}
          rating={rating}
          setRating={setRating}
          onSearch={handleSearch}
        />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <Catalog searchParams={{ q: searchQ, rating, categoryId }} />
              }
            />
            <Route path="/film/:id" element={<FilmDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
