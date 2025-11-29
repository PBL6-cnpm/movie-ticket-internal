import { useBookingStore } from '@/features/booking/stores/booking.store'
import { useNavigate } from '@tanstack/react-router'
import { Clock, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useBranchMovieShowTimes, useMovieShowTimes } from '../hooks/useBookingApi'
import { useNowShowingMovies } from '../hooks/useMovies'

import { useEmployeeStore } from '@/features/employee/stores/employee.store'

const StaffBookingEntryPage: React.FC = () => {
    const navigate = useNavigate()
    const { setBookingState } = useBookingStore()
    const { selectedBranchId } = useEmployeeStore()

    const [selectedMovieId, setSelectedMovieId] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch movies (paginated, but we'll just fetch first page for now or implement search)

    // Fetch movies (paginated, but we'll just fetch first page for now or implement search)
    const { data: moviesData } = useNowShowingMovies({
        limit: 20,
        offset: 0,
        sortBy: 'releaseDate',
        sortOrder: 'DESC',
        branchId: selectedBranchId || undefined
    })

    const movies = useMemo(() => {
        if (!moviesData?.movies) return []
        if (!searchQuery) return moviesData.movies
        return moviesData.movies.filter((m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [moviesData, searchQuery])

    // Reset date when branch changes
    React.useEffect(() => {
        setSelectedDate('')
    }, [selectedBranchId])

    // Fetch showtimes based on selection
    const { data: movieShowTimes = [] } = useMovieShowTimes(selectedMovieId)
    const { data: branchMovieShowTimes = [] } = useBranchMovieShowTimes(
        selectedMovieId,
        selectedBranchId || '',
        true
    )

    const showTimesToDisplay = useMemo(() => {
        if (selectedBranchId && selectedMovieId) {
            return branchMovieShowTimes
        }
        if (selectedMovieId) {
            return movieShowTimes
        }
        return []
    }, [selectedBranchId, selectedMovieId, branchMovieShowTimes, movieShowTimes])

    const availableDates = useMemo(() => {
        return showTimesToDisplay.map((st) => st.dayOfWeek)
    }, [showTimesToDisplay])

    const availableTimes = useMemo(() => {
        if (!selectedDate) return []
        const dayData = showTimesToDisplay.find((st) => st.dayOfWeek.value === selectedDate)
        return dayData ? dayData.times : []
    }, [showTimesToDisplay, selectedDate])

    const handleShowtimeSelect = (showtimeId: string) => {
        setBookingState({
            branchId: selectedBranchId || undefined, // If no branch selected, it might be inferred later or require selection
            movieId: selectedMovieId,
            date: selectedDate,
            showtimeId: showtimeId
        })
        navigate({ to: '/staff/booking' })
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">New Booking</h1>
                    <p className="text-[var(--brand-text-muted)]">
                        Select a movie and showtime to proceed
                    </p>
                </div>
                <div className="bg-[var(--brand-surface)] px-4 py-2 rounded-lg border border-gray-700/50 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span className="text-sm text-gray-300">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)]">
                {/* Left Column: Movie Selection */}
                <div className="lg:col-span-4 flex flex-col h-full">
                    <div className="bg-[var(--brand-surface)] rounded-xl border border-gray-700/50 flex flex-col h-full overflow-hidden shadow-xl">
                        <div className="p-5 border-b border-gray-700/50 bg-[var(--brand-surface)] sticky top-0 z-10">
                            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-[var(--brand-primary)]" />
                                Search Movies
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type movie name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#1a2232] border border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-white placeholder-gray-500 transition-all"
                                />
                                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {movies.map((movie) => (
                                <div
                                    key={movie.id}
                                    onClick={() => {
                                        setSelectedMovieId(movie.id)
                                        setSelectedDate('')
                                    }}
                                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex gap-4 group ${
                                        selectedMovieId === movie.id
                                            ? 'bg-[var(--brand-primary)] shadow-lg transform scale-[1.02]'
                                            : 'hover:bg-[#1a2232] border border-transparent hover:border-gray-700'
                                    }`}
                                >
                                    <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden shadow-md">
                                        <img
                                            src={movie.poster}
                                            alt={movie.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                                        <h3
                                            className={`font-semibold text-base mb-1 truncate ${selectedMovieId === movie.id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}
                                        >
                                            {movie.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span
                                                className={`px-2 py-0.5 rounded-full ${selectedMovieId === movie.id ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-300'}`}
                                            >
                                                {movie.duration} min
                                            </span>
                                            <span
                                                className={`${selectedMovieId === movie.id ? 'text-white/80' : 'text-gray-500'}`}
                                            >
                                                {movie.ageLimit ? `${movie.ageLimit}+` : 'G'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Showtimes */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="bg-[var(--brand-surface)] p-6 rounded-xl border border-gray-700/50 h-full shadow-xl flex flex-col">
                        {!selectedMovieId ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <div className="w-20 h-20 bg-[#1a2232] rounded-full flex items-center justify-center mb-2">
                                    <Search className="w-10 h-10 opacity-50" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-300 mb-1">
                                        No Movie Selected
                                    </h3>
                                    <p className="text-gray-500">
                                        Please select a movie from the list to view available
                                        showtimes
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-700/50">
                                    <div className="p-2 bg-[#1a2232] rounded-lg">
                                        <Clock className="w-6 h-6 text-[var(--brand-primary)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Select Showtime
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Choose a date and time for the booking
                                        </p>
                                    </div>
                                </div>

                                {/* Date Tabs */}
                                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                                    {availableDates.length > 0 ? (
                                        availableDates.map((day) => (
                                            <button
                                                key={day.value}
                                                onClick={() => setSelectedDate(day.value)}
                                                className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                                                    selectedDate === day.value
                                                        ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-lg transform -translate-y-0.5'
                                                        : 'bg-[#1a2232] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                                                }`}
                                            >
                                                {day.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="w-full text-center py-8 bg-[#1a2232]/50 rounded-xl border border-dashed border-gray-700">
                                            <p className="text-gray-400">
                                                No showtimes available for this selection.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Time Grid */}
                                {selectedDate && (
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {availableTimes.map((time) => (
                                                <button
                                                    key={time.id}
                                                    onClick={() => handleShowtimeSelect(time.id)}
                                                    className="relative flex flex-col items-center justify-center p-5 bg-[#1a2232] border border-gray-700 rounded-xl hover:border-[var(--brand-primary)] hover:shadow-[0_0_15px_rgba(254,126,50,0.15)] transition-all duration-200 group"
                                                >
                                                    <span className="text-2xl font-bold text-white group-hover:text-[var(--brand-primary)] transition-colors">
                                                        {time.time}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${(time.availableSeats ?? 0) > 10 ? 'bg-green-500' : (time.availableSeats ?? 0) > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        />
                                                        <span className="text-xs text-gray-400 group-hover:text-gray-300">
                                                            {time.availableSeats} seats left
                                                        </span>
                                                    </div>
                                                    {time.roomName && (
                                                        <span className="text-[10px] text-gray-500 mt-1 group-hover:text-gray-400">
                                                            {time.roomName}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StaffBookingEntryPage
