import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AppShell } from "@/app/components/AppShell"
import Dashboard from "@/app/routes/Dashboard"
import Definitions from "@/app/routes/Definitions"
import Login from "@/app/routes/Login"
import Users from "@/app/routes/Users"
import Roles from "@/app/routes/Roles"
import Sales from "@/app/routes/Sales"
import Purchases from "@/app/routes/Purchases"
import Reports from "@/app/routes/Reports"
import Settings from "@/app/routes/Settings"
import { AuthInit } from "@/app/components/AuthInit"
import { ProtectedRoute, GuestRoute } from "@/routes/ProtectedRoute"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInit>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="definitions" element={<Definitions />} />
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
                <Route path="sales" element={<Sales />} />
                <Route path="purchases" element={<Purchases />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthInit>
    </QueryClientProvider>
  )
}
