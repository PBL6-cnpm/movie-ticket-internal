import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'

interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

interface BranchesResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: Branch[]
}

interface BranchMovie {
    id: string
    name: string
    description: string
    duration: number
    ageLimit: number
    director: string
    trailer: string
    poster: string
    releaseDate: string
    screeningStart: string
    screeningEnd: string
    avgRating?: number | null
    averageRating?: number | null
    genres: Array<{ id: string; name: string }>
    actors: Array<{
        id: string
        name: string
        description?: string | null
        picture?: string | null
    }>
    createdAt: string
    updatedAt: string
}

interface BranchMoviesResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: BranchMovie[]
    }
}

interface ShowTime {
    id: string
    time: string
    totalSeats?: number
    availableSeats?: number
    occupiedSeats?: number
    roomId?: string
    roomName?: string
}

interface ShowTimeDay {
    dayOfWeek: {
        name: string
        value: string
    }
    times: ShowTime[]
}

interface ShowTimesResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data: {
        items: ShowTimeDay[]
    }
}

interface BranchShowTimesItem {
    movie: BranchMovie
    showTimes: Array<{
        dayOfWeek: {
            name: string
            value: string
        }
        times: ShowTime[]
    }>
}

interface BranchShowTimesMeta {
    limit?: number
    offset?: number
    total?: number
    totalPages?: number
}

interface BranchShowTimesResponse {
    success: boolean
    statusCode: number
    message: string
    code: string
    data:
        | BranchShowTimesItem[]
        | {
              items: BranchShowTimesItem[]
              meta?: BranchShowTimesMeta
          }
}

interface BranchShowTimesPageResult {
    items: BranchShowTimesItem[]
    meta: {
        limit: number
        offset: number
        total: number
        totalPages: number
    }
}

const fetchBranches = async (hasShowtimes?: boolean): Promise<Branch[]> => {
    const url = hasShowtimes ? '/branches?hasShowtimes=true' : '/branches'
    const response = await apiClient.get<BranchesResponse>(url)

    if (response.data.success && response.data.data) {
        return response.data.data
    }

    console.error('❌ API DEBUG - Failed to fetch branches:', response.data)
    throw new Error('Failed to fetch branches')
}

const fetchBranchMovies = async (branchId: string): Promise<BranchMovie[]> => {
    const response = await apiClient.get<BranchMoviesResponse>(
        `/movies/get-with-branches/${branchId}`
    )

    if (response.data.success && response.data.data?.items) {
        return response.data.data.items
    }

    throw new Error('Failed to fetch branch movies')
}

const fetchMovieShowTimes = async (movieId: string): Promise<ShowTimeDay[]> => {
    const response = await apiClient.get<ShowTimesResponse>(`/show-time/get-with-movie/${movieId}`)

    if (response.data.success && response.data.data?.items) {
        return response.data.data.items
    }

    console.error('❌ API DEBUG - Failed to fetch showtimes:', response.data)
    throw new Error('Failed to fetch movie showtimes')
}

const fetchBranchesByMovie = async (movieId: string): Promise<Branch[]> => {
    if (!movieId) {
        return []
    }

    const response = await apiClient.get<BranchesResponse>(`/branches/movies/${movieId}`)

    if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
            return response.data.data
        }

        if (Array.isArray((response.data.data as { items?: Branch[] }).items)) {
            return (response.data.data as { items: Branch[] }).items
        }
    }

    console.error('❌ API DEBUG - Failed to fetch branches for movie:', response.data)
    throw new Error('Failed to fetch movie branches')
}

const fetchBranchMovieShowTimes = async (
    movieId: string,
    branchId: string,
    includeDuplicates: boolean = false
): Promise<ShowTimeDay[]> => {
    const response = await apiClient.get<ShowTimesResponse>(
        `/show-time/get-with-branch?movieId=${movieId}&branchId=${branchId}&includeDuplicates=${includeDuplicates}`
    )

    if (response.data.success && response.data.data?.items) {
        return response.data.data.items
    }

    console.error('❌ API DEBUG - Failed to fetch branch showtimes:', response.data)
    throw new Error('Failed to fetch branch movie showtimes')
}

const sanitizeBranchShowTimes = (items: BranchShowTimesItem[]): BranchShowTimesItem[] => {
    return items
        .map((item) => {
            const sanitizedDays = (item.showTimes || [])
                .map((day) => ({
                    ...day,
                    times: (day.times || []).filter((time) => Boolean(time?.id && time?.time))
                }))
                .filter((day) => day.times.length > 0)

            return {
                ...item,
                showTimes: sanitizedDays
            }
        })
        .filter((item) => item.showTimes.length > 0)
}

const normalizeBranchShowTimesMeta = (
    meta: BranchShowTimesMeta | undefined,
    limit: number,
    offset: number,
    fallbackTotal: number
) => {
    const safeLimit = meta?.limit ?? limit
    const safeOffset = meta?.offset ?? offset
    const safeTotal = meta?.total ?? fallbackTotal
    const computedTotalPages = (() => {
        if (meta?.totalPages !== undefined) {
            return meta.totalPages
        }
        if (!safeLimit || safeLimit <= 0) {
            return safeTotal > 0 ? 1 : 0
        }
        if (!safeTotal || safeTotal <= 0) {
            return 0
        }
        return Math.ceil(safeTotal / safeLimit)
    })()

    return {
        limit: safeLimit,
        offset: safeOffset,
        total: safeTotal,
        totalPages: computedTotalPages
    }
}

const fetchBranchShowTimesPage = async (
    branchId: string,
    limit: number,
    offset: number
): Promise<BranchShowTimesPageResult> => {
    if (!branchId) {
        return {
            items: [],
            meta: {
                limit,
                offset,
                total: 0,
                totalPages: 0
            }
        }
    }

    const response = await apiClient.get<BranchShowTimesResponse>(
        `/branches/${branchId}/show-times`,
        {
            params: {
                limit,
                offset
            }
        }
    )

    if (response.data.success && response.data.data) {
        const payload = response.data.data
        let rawItems: BranchShowTimesItem[] = []
        let meta: BranchShowTimesMeta | undefined

        if (Array.isArray(payload)) {
            rawItems = payload
        } else {
            rawItems = Array.isArray(payload.items) ? payload.items : []
            meta = payload.meta
        }

        const sanitizedItems = sanitizeBranchShowTimes(rawItems)
        const normalizedMeta = normalizeBranchShowTimesMeta(
            meta,
            limit,
            offset,
            meta?.total ?? sanitizedItems.length
        )

        return {
            items: sanitizedItems,
            meta: normalizedMeta
        }
    }

    console.error('❌ API DEBUG - Failed to fetch branch showtimes:', response.data)
    throw new Error('Failed to fetch branch showtimes')
}

export const useBranches = (hasShowtimes?: boolean) => {
    return useQuery({
        queryKey: ['branches', hasShowtimes],
        queryFn: () => fetchBranches(hasShowtimes),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000 // 10 minutes
    })
}

export const useBranchesByMovie = (movieId: string) => {
    return useQuery({
        queryKey: ['branchesByMovie', movieId],
        queryFn: () => fetchBranchesByMovie(movieId),
        enabled: !!movieId,
        staleTime: 3 * 60 * 1000,
        gcTime: 5 * 60 * 1000
    })
}

export const useBranchMovies = (branchId: string) => {
    return useQuery({
        queryKey: ['branchMovies', branchId],
        queryFn: () => fetchBranchMovies(branchId),
        enabled: !!branchId,
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 5 * 60 * 1000 // 5 minutes
    })
}

export const useMovieShowTimes = (movieId: string) => {
    return useQuery({
        queryKey: ['movieShowTimes', movieId],
        queryFn: () => fetchMovieShowTimes(movieId),
        enabled: !!movieId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000 // 5 minutes
    })
}

export const useBranchMovieShowTimes = (
    movieId: string,
    branchId: string,
    includeDuplicates: boolean = false
) => {
    return useQuery({
        queryKey: ['branchMovieShowTimes', movieId, branchId, includeDuplicates],
        queryFn: () => fetchBranchMovieShowTimes(movieId, branchId, includeDuplicates),
        enabled: !!movieId && !!branchId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000 // 5 minutes
    })
}

export const useBranchShowTimes = (branchId: string, options?: { pageSize?: number }) => {
    const pageSize = options?.pageSize ?? 6

    return useInfiniteQuery({
        queryKey: ['branchShowTimes', branchId, pageSize],
        enabled: !!branchId,
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            fetchBranchShowTimesPage(
                branchId,
                pageSize,
                typeof pageParam === 'number' ? pageParam : 0
            ),
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.meta.offset + lastPage.items.length
            if (nextOffset >= lastPage.meta.total) {
                return undefined
            }
            return nextOffset
        },
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000
    })
}

export type { Branch, BranchMovie, BranchShowTimesItem, ShowTime, ShowTimeDay }
