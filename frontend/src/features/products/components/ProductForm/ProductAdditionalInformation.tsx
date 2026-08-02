import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "."

interface Props {
  form: UseFormReturn<ProductFormValues>
  mode: "create" | "edit" | "view"
}

export function ProductAdditionalInformation({ form, mode }: Props) {
  const isReadOnly = mode === "view"

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-bold text-slate-800">Additional Information</legend>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Weight</label>
        <input
          type="number"
          step="0.001"
          {...form.register("weight")}
          disabled={isReadOnly}
          placeholder="e.g. 1.500"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-75"
        />
        {form.formState.errors.weight && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.weight.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Thickness / GSM</label>
        <input
          type="number"
          step="0.001"
          {...form.register("thickness")}
          disabled={isReadOnly}
          placeholder="e.g. 250"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-75"
        />
        {form.formState.errors.thickness && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.thickness.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Colour Scheme</label>
        <input
          type="text"
          {...form.register("colourScheme")}
          disabled={isReadOnly}
          placeholder="e.g. Red/Black"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-75"
        />
        {form.formState.errors.colourScheme && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.colourScheme.message as string}</p>
        )}
      </div>
    </fieldset>
  )
}
