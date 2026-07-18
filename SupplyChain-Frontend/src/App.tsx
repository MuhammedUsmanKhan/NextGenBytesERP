import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "@/app/components/AppShell"
import { Dashboard } from "@/app/routes/Dashboard"
import { Definitions } from "@/app/routes/Definitions"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="definitions" element={<Definitions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
