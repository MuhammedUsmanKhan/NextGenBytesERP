import { useEffect } from "react"
import { useForm, type UseFormReturn, type FieldValues, type Resolver, type DefaultValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { z } from "zod"

type FormValuesOf<T extends z.ZodTypeAny> = z.infer<T> & FieldValues

interface DefinitionFormDialogProps<T extends z.ZodTypeAny> {
  open: boolean
  onClose: () => void
  title: string
  schema: T
  defaultValues: FormValuesOf<T>
  onSubmit: (data: FormValuesOf<T>) => void
  isSubmitting: boolean
  isEditMode: boolean
  children: (form: UseFormReturn<FormValuesOf<T>>) => React.ReactNode
}

export function DefinitionFormDialog<T extends z.ZodTypeAny>({
  open,
  onClose,
  title,
  schema,
  defaultValues,
  onSubmit,
  isSubmitting,
  isEditMode,
  children,
}: DefinitionFormDialogProps<T>) {
  const resolver = (zodResolver as unknown as (schema: T) => Resolver<FormValuesOf<T>>)(schema)

  const form = useForm<FormValuesOf<T>>({
    resolver,
    defaultValues: defaultValues as DefaultValues<FormValuesOf<T>>,
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, defaultValues, form])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-100 p-1 rounded-lg text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          {children(form)}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create Entry"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
