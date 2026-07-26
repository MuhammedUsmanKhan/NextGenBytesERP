interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  productCode: string
  isDeleting: boolean
}

export function ProductDeleteConfirm({ open, onClose, onConfirm, productName, productCode, isDeleting }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">Delete Product</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-100 p-1 rounded-lg text-xs cursor-pointer">Close</button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete <span className="font-bold">&ldquo;{productName}&rdquo;</span> ({productCode})?
          </p>
          <p className="text-xs text-slate-400">This action cannot be undone.</p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
