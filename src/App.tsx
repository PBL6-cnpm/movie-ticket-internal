import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/shared/api/query-client'

// feature

function App() {
    return <QueryClientProvider client={queryClient}></QueryClientProvider>
}

export default App
