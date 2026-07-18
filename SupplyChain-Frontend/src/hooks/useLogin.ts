import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { login as loginApi } from "@/api/auth.api"
import { useAuthStore } from "@/stores/auth.store"

export function useLogin() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      loginStore(data.accessToken)
      toast.success("Welcome back!")
      navigate("/", { replace: true })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid email or password"
      toast.error(message)
    },
  })
}
