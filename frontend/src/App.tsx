import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/app/components/ErrorBoundary"
import { AppShell } from "@/app/components/AppShell"
import Dashboard from "@/app/routes/Dashboard"
import Definitions from "@/app/routes/Definitions"
import Products from "@/app/routes/Products"
import InventoryOpeningStock from "@/app/routes/InventoryOpeningStock"
import InventoryPage from "@/app/routes/InventoryPage"
import InventoryTransactions from "@/app/routes/InventoryTransactions"
import AuditLogs from "@/app/routes/AuditLogs"
import Login from "@/app/routes/Login"
import Users from "@/app/routes/Users"
import Roles from "@/app/routes/Roles"
import Sales from "@/app/routes/Sales"
import SalesOrderForm from "@/app/routes/SalesOrderForm"
import SalesOrderView from "@/app/routes/SalesOrderView"
import Purchases from "@/app/routes/Purchases"
import Reports from "@/app/routes/Reports"
import Settings from "@/app/routes/Settings"
import { AuthInit } from "@/app/components/AuthInit"
import { ProtectedRoute, GuestRoute } from "@/routes/ProtectedRoute"
import { ModuleRoute } from "@/routes/ModuleRoute"
import EmployeeListPage from "@/features/payroll/components/EmployeeListPage"
import AttendancePage from "@/features/payroll/components/AttendancePage"
import LoansPage from "@/features/payroll/components/LoansPage"
import PayrollRunsPage from "@/features/payroll/components/PayrollRunsPage"
import PayrollReportsPage from "@/features/payroll/components/PayrollReportsPage"

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
    <ErrorBoundary>
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

                  {/* Payroll Module */}
                  <Route element={<ModuleRoute module="payroll" />}>
                    <Route path="payroll" element={<Navigate to="/payroll/employees" replace />} />
                    <Route path="payroll/employees" element={<EmployeeListPage />} />
                    <Route path="payroll/attendance" element={<AttendancePage />} />
                    <Route path="payroll/loans" element={<LoansPage />} />
                    <Route path="payroll/runs" element={<PayrollRunsPage />} />
                    <Route path="payroll/reports" element={<PayrollReportsPage />} />
                  </Route>

                  {/* Definitions Module */}
                  <Route element={<ModuleRoute module="definitions" />}>
                    <Route path="definitions" element={<Definitions />} />
                  </Route>

                  {/* Inventory & Products Module */}
                  <Route element={<ModuleRoute module="inventory" />}>
                    <Route path="products" element={<Products />} />
                    <Route path="inventory/opening-stock" element={<InventoryOpeningStock />} />
                    <Route path="inventory/stock" element={<InventoryPage />} />
                    <Route path="inventory/transactions" element={<InventoryTransactions />} />
                  </Route>

                  {/* Sales Orders Module */}
                  <Route element={<ModuleRoute module="salesOrders" />}>
                    <Route path="sales" element={<Sales />} />
                    <Route path="sales/sales-orders/new" element={<SalesOrderForm />} />
                    <Route path="sales/sales-orders/:id/edit" element={<SalesOrderForm />} />
                    <Route path="sales/sales-orders/:id" element={<SalesOrderView />} />
                  </Route>

                  {/* Purchases Module */}
                  <Route element={<ModuleRoute module="purchases" />}>
                    <Route path="purchases" element={<Purchases />} />
                  </Route>

                  {/* Administration Module */}
                  <Route element={<ModuleRoute module="administration" />}>
                    <Route path="users" element={<Users />} />
                    <Route path="roles" element={<Roles />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                  </Route>

                  {/* Common / Ungated */}
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </AuthInit>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
