import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Skeleton from '../components/Skeleton.jsx'
import Modal from '../components/Modal.jsx'
import Toast from '../components/Toast.jsx'

export default function FilmDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [staffId, setStaffId] = useState('1')
  const [renting, setRenting] = useState(false)
  const [rentError, setRentError] = useState('')
  const [rentOk, setRentOk] = useState('')
  const [rentOpen, setRentOpen] = useState(false)
  const [inventoryId, setInventoryId] = useState('')

  const BASE_IMAGE_URL = import.meta.env.VITE_BASE_IMAGE_URL

  useEffect(() => {
    let cancelled = false
    async function fetchFilm() {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(`/api/films/${id}`)
        if (!cancelled) setData(res.data)
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchFilm()
    return () => { cancelled = true }
  }, [id])

  async function rentSelected() {
    if (!data) return
    if (!inventoryId) { setRentError('Choose an inventory item'); return }
    if (!customerId) { setRentError('Enter customer id'); return }
    setRentError('')
    setRentOk('')
    setRenting(true)
    try {
      await axios.post('/api/rentals', {
        customer_name: customerId,  // name instead of ID
        inventory_id: Number(inventoryId),
        staff_id: Number(staffId || 1)
      });
      setRentOk('Rental created')
      setRentOpen(false)
    } catch (e) {
      setRentError(e?.response?.data?.error || 'Failed to rent')
    } finally {
      setRenting(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  )
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  const { film, cast, availability } = data
  const posterSrc = film.poster
    ? `${BASE_IMAGE_URL}/${film.poster}`
    : `${BASE_IMAGE_URL}/default.jpg`

  return (
    <div className="space-y-10 px-4 md:px-8">
      {/* Main Film Info Section */}
      <div className="flex flex-col md:flex-row items-start md:pl-6">
        {/* Poster */}
        <div className="w-full md:w-1/4 md:-translate-x-12">
          <img
            src={posterSrc}
            alt={film.title}
            onError={(e) => {
              const fallback = `${BASE_IMAGE_URL}/default.jpg`
              if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
            }}
            className="w-full rounded-xl object-cover shadow-sm"
          />
        </div>

        {/* Details Section */}
        <div className="flex-1 space-y-5 pt-4 md:pt-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{film.title}</h1>
            <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
              {film.rating && <span>{film.rating}</span>}
              {film.release_year && <span> • {film.release_year}</span>}
              {film.categories && <span> • {film.categories}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="text-gray-700 dark:text-gray-200 leading-relaxed">
            {film.description}
          </div>

          {/* Rental Section */}
          <div className="space-y-3 mt-6">
            <div className="font-medium">
              Availability: <span>{availability.available}</span> / {availability.total} copies
            </div>
            <div className="flex flex-wrap gap-3 items-center">
             <input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Customer Name"
                className="border rounded px-4 py-2 w-56"
              />
              <input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Staff ID"
                className="border rounded px-4 py-2 w-36"
              />
              <button
                disabled={renting || availability.available === 0}
                onClick={() => setRentOpen(true)}
                className="px-6 py-3 rounded-full bg-[#121212ff] hover:bg-[#1e1e1eff] text-white text-sm font-bold border-2 border-white transition-all disabled:opacity-50"
              >
                Rent Now
              </button>
            </div>
            {rentError && <div className="text-red-600 text-sm">{rentError}</div>}
            <Toast open={!!rentOk} message={rentOk} onClose={() => setRentOk('')} />
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-3">Cast</h2>
        <ul className="list-disc pl-6 text-gray-800 dark:text-gray-200 space-y-1">
          {cast.map(a => <li key={a.actor_id}>{a.name}</li>)}
        </ul>
      </div>

      {/* Modal for selecting inventory */}
      <Modal
        open={rentOpen}
        onClose={() => setRentOpen(false)}
        title="Select Copy to Rent"
        footer={(
          <>
            <button
              onClick={() => setRentOpen(false)}
              className="px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              disabled={renting}
              onClick={rentSelected}
              className="px-4 py-2 rounded bg-black hover:bg-gray-700 text-white"
            >
              Confirm
            </button>
          </>
        )}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Choose an available inventory item:
          </div>
          <select
            value={inventoryId}
            onChange={(e) => setInventoryId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select inventory</option>
            {(data.inventory || []).filter(i => i.available).map(i => (
              <option key={i.inventory_id} value={i.inventory_id}>
                Inventory #{i.inventory_id}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  )
}
