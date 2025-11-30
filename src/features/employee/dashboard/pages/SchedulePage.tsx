import { apiClient } from '@/shared/api/api-client'
import { useQuery } from '@tanstack/react-query'
import { addMinutes, format } from 'date-fns'
import { Calendar, Clock, Film, MapPin, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useEmployeeStore } from '../../stores/employee.store'

interface ShowTime {
    id: string
    timeStart: string
    showDate: string
    room: {
        id: string
        name: string
    }
    movie: {
        id: string
        name: string
        poster: string
        duration?: number // Assuming duration is available or we default it
    }
    totalSeats?: number
    availableSeats?: number
    occupiedSeats?: number
}

const SchedulePage: React.FC = () => {
    const { selectedBranchId } = useEmployeeStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRoom, setSelectedRoom] = useState<string>('all')

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [currentTime, setCurrentTime] = useState(new Date())

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const { data: showTimes = [], isLoading } = useQuery({
        queryKey: ['showTimesByDate', selectedBranchId, selectedDate],
        queryFn: async () => {
            if (!selectedBranchId) return []
            const response = await apiClient.get<{ data: ShowTime[] }>(
                `/show-time/show-date/${selectedDate}`
            )
            return response.data.data
        },
        enabled: !!selectedBranchId
    })

    // Group showtimes by Room
    const roomGroups = showTimes.reduce(
        (acc, st) => {
            if (!acc[st.room.id]) {
                acc[st.room.id] = {
                    roomName: st.room.name,
                    showTimes: []
                }
            }
            acc[st.room.id].showTimes.push(st)
            return acc
        },
        {} as Record<string, { roomName: string; showTimes: ShowTime[] }>
    )

    // Calculate Room Status
    const getRoomStatus = (roomShowTimes: ShowTime[]) => {
        const now = currentTime
        // Sort by time
        const sorted = [...roomShowTimes].sort(
            (a, b) => new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
        )

        const currentShow = sorted.find((st) => {
            const start = new Date(st.timeStart)
            const duration = 120 // Default 120 mins if missing
            const end = addMinutes(start, duration)
            return now >= start && now <= end
        })

        if (currentShow) {
            const occupancy = currentShow.totalSeats
                ? Math.round(((currentShow.occupiedSeats || 0) / currentShow.totalSeats) * 100)
                : 0
            return {
                status: 'SHOWING',
                movieName: currentShow.movie.name,
                occupancy,
                endTime: addMinutes(new Date(currentShow.timeStart), 120) // Approx
            }
        }

        const nextShow = sorted.find((st) => new Date(st.timeStart) > now)
        if (nextShow) {
            return {
                status: 'EMPTY',
                nextMovie: nextShow.movie.name,
                nextTime: new Date(nextShow.timeStart)
            }
        }

        return { status: 'CLOSED' }
    }

    // Filter logic
    const filteredShowTimes = showTimes.filter((st) => {
        const matchesSearch = st.movie.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRoom = selectedRoom === 'all' || st.room.id === selectedRoom
        return matchesSearch && matchesRoom
    })

    const uniqueRooms = Array.from(
        new Set(showTimes.map((st) => JSON.stringify({ id: st.room.id, name: st.room.name })))
    ).map((s) => JSON.parse(s))

    return (
        <div className="p-6 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#1a2232] p-4 rounded-xl border border-white/5">
                <div>
                    <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Real-time room status and daily schedule
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 xl:w-64">
                        <Film
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search movie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#131a27] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#fe7e32]"
                        />
                    </div>

                    {/* Room Filter */}
                    <div className="relative">
                        <MapPin
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="bg-[#131a27] border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-[#fe7e32] appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Rooms</option>
                            {uniqueRooms.map((room: { id: string; name: string }) => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-[#131a27] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#fe7e32] cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Room Status Grid (Only show if no filters active or filtering by room) */}
            {!searchTerm && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Object.entries(roomGroups)
                        .filter(([roomId]) => selectedRoom === 'all' || roomId === selectedRoom)
                        .map(([roomId, { roomName, showTimes }]) => {
                            const status = getRoomStatus(showTimes)
                            return (
                                <div
                                    key={roomId}
                                    className="bg-[#1a2232] rounded-xl border border-white/5 p-4 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#fe7e32]/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-white">{roomName}</h3>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${
                                                status.status === 'SHOWING'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : status.status === 'EMPTY'
                                                      ? 'bg-green-500/20 text-green-400'
                                                      : 'bg-gray-500/20 text-gray-400'
                                            }`}
                                        >
                                            {status.status}
                                        </span>
                                    </div>

                                    {status.status === 'SHOWING' ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Now Showing
                                                </p>
                                                <p
                                                    className="text-white font-medium truncate"
                                                    title={status.movieName}
                                                >
                                                    {status.movieName}
                                                </p>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                    <span>Occupancy</span>
                                                    <span>{status.occupancy}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${status.occupancy || 0 > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${status.occupancy}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : status.status === 'EMPTY' ? (
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Next Show</p>
                                            <p
                                                className="text-white font-medium truncate"
                                                title={status.nextMovie}
                                            >
                                                {status.nextMovie}
                                            </p>
                                            <div className="flex items-center gap-1 text-[#fe7e32] text-sm mt-1">
                                                <Clock size={14} />
                                                <span>
                                                    {status.nextTime
                                                        ? format(status.nextTime, 'HH:mm')
                                                        : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No more shows today</p>
                                    )}
                                </div>
                            )
                        })}
                </div>
            )}

            {/* Detailed Timeline List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        {searchTerm ? 'Search Results' : 'Detailed Schedule'}
                    </h2>
                    <div className="text-sm text-gray-400">
                        {filteredShowTimes.length} showtimes found
                    </div>
                </div>

                <div className="bg-[#1a2232] rounded-xl border border-white/5 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">Loading schedule...</div>
                    ) : filteredShowTimes.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No showtimes found matching your filters.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredShowTimes
                                .sort(
                                    (a, b) =>
                                        new Date(a.timeStart).getTime() -
                                        new Date(b.timeStart).getTime()
                                )
                                .map((st) => {
                                    const occupancy = st.totalSeats
                                        ? Math.round(
                                              ((st.occupiedSeats || 0) / st.totalSeats) * 100
                                          )
                                        : 0
                                    const isPast = new Date(st.timeStart) < currentTime

                                    return (
                                        <div
                                            key={st.id}
                                            className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/5 transition-colors ${isPast ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                        >
                                            <div className="flex items-center gap-4 min-w-[150px]">
                                                <div
                                                    className={`text-2xl font-bold font-mono ${isPast ? 'text-gray-500' : 'text-white'}`}
                                                >
                                                    {format(new Date(st.timeStart), 'HH:mm')}
                                                </div>
                                                <div className="text-sm text-gray-400 bg-white/5 px-2 py-1 rounded">
                                                    {st.room.name}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h3
                                                    className={`font-medium ${isPast ? 'text-gray-400' : 'text-white'}`}
                                                >
                                                    {st.movie.name}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users size={12} />
                                                        {st.occupiedSeats || 0} /{' '}
                                                        {st.totalSeats || 0} seats
                                                    </span>
                                                    <span
                                                        className={`${occupancy > 80 ? 'text-red-400' : 'text-green-400'}`}
                                                    >
                                                        {occupancy}% Full
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-full sm:w-32">
                                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${occupancy > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${occupancy}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SchedulePage
