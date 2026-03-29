import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// ── QueryClient ───────────────────────────────────────────────────
// One instance shared across the entire app.
// staleTime: how long before data is considered stale and refetched
// gcTime: how long unused data stays in cache before garbage collected
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes
      retry: 1,                    // retry failed requests once
      refetchOnWindowFocus: false, // don't refetch just because user switched tabs
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
                <AuthProvider>
        <App />

        <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
