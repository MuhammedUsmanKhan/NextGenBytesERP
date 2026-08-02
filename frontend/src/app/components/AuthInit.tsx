import { useEffect, useState } from "react"
import { refresh } from "@/api/auth.api"
import { useAuthStore } from "@/stores/auth.store"
import { Loader2 } from "lucide-react"

export function AuthInit({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  useEffect(() => {
    async function init() {
      try {
        const data = await refresh()
        setAccessToken(data.accessToken)
      } catch {
        // Not authenticated — stay on login
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [setAccessToken])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}
