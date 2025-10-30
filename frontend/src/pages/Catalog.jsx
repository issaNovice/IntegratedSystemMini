// frontend/src/pages/Catalog.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Logo from '../assets/images/Sakila.svg'

export default function Catalog({ searchParams }) {
  const [films, setFilms] = useState([])
  const [pagination, setPagination] = useState({ total: 0, limit: 16, offset: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const BASE_IMAGE_URL = import.meta.env.VITE_BASE_IMAGE_URL

  const params = useMemo(() => ({
    q: searchParams.q || undefined,
    rating: searchParams.rating || undefined,
    category_id: searchParams.categoryId || undefined,
    limit: pagination.limit,
    offset: pagination.offset,
  }), [searchParams.q, searchParams.rating, searchParams.categoryId, pagination.limit, pagination.offset])

  useEffect(() => {
    let cancelled = false
    async function fetchFilms() {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get('/api/films', { params })
        if (!cancelled) {
          setFilms(res.data.data || [])
          setPagination(p => ({ ...p, ...res.data.pagination }))
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchFilms()

    // scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })

    return () => { cancelled = true }
  }, [params])

  function go(delta) {
    const next = Math.max(0, pagination.offset + delta)
    setPagination(p => ({ ...p, offset: next }))
  }

  return (
    <div className="space-y-4">

      {/* Header (only on first page) */}
      {pagination.offset === 0 && (
        <div className="bg-gradient-to-r p-6 flex flex-col justify-center items-center">
          <img src={Logo} alt="SAKILA Logo" className="h-20" />
          <h1 className="text-3xl font-semibold tracking-tight text-center mt-1">Explore the Catalog</h1>
          <p className="text-m text-center mt-1">Browse thousands of titles from the Sakila dataset.</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white shadow-sm h-64 w-full rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-red-600 px-12">{error}</div>}

      {/* Film Cards */}
      {!loading && (
        <div className="px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-4">

            {films.map(f => {
              // compute initial src: use poster if present else default
              const initialSrc = f.poster ? `${BASE_IMAGE_URL}/${f.poster}` : `${BASE_IMAGE_URL}/default.jpg`;

              return (
                <Link
                  key={f.film_id}
                  to={`/film/${f.film_id}`}
                  className="relative group bg-white dark:bg-slate-900 h-90 w-full flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-md"
                >
                  {/* Poster image — covers the whole card */}
                  <img
                    src={initialSrc}
                    alt={f.title}
                    loading="lazy"
                    // fallback to default on error (404, CORS fail, etc.)
                    onError={(e) => {
                      // prevent infinite loop if default.jpg also fails (compare first)
                      const fallback = `${BASE_IMAGE_URL}/default.jpg`;
                      if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* optional overlay (same as your original) */}
                  <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-2">
                    <div className="font-bold text-lg text-white mb-8 drop-shadow-md">{f.title}</div>
                    <div className="text-xs text-indigo-100 flex flex-wrap gap-1 justify-center">
                      {(f.categories || '').split(',').filter(Boolean).map(cat => (
                        <span key={cat} className="px-2 py-0.5 rounded-full bg-indigo-700/40">{cat}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}

          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center gap-3 justify-center px-12">
        <button 
          className="px-3 py-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm disabled:opacity-50"
          disabled={pagination.offset === 0} 
          onClick={() => go(-pagination.limit)}
        >
          Prev
        </button>
        <div className="text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded px-3 py-2 shadow-sm">
          {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
        </div>
        <button 
          className="px-3 py-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm disabled:opacity-50"
          disabled={pagination.offset + pagination.limit >= pagination.total} 
          onClick={() => go(pagination.limit)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
