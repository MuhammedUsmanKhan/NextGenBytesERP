import { useState, useRef } from "react"
import {
  X,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HelpCircle,
} from "lucide-react"
import { useUploadBiometricDat } from "../hooks/useBiometricAttendance"
import type { BiometricUploadResponseDto } from "@/types/biometric-attendance.types"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function BiometricUploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<BiometricUploadResponseDto | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const uploadMutation = useUploadBiometricDat()

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
      setResult(null)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    uploadMutation.mutate(selectedFile, {
      onSuccess: (data) => {
        setResult(data)
        if (onSuccess) onSuccess()
      },
    })
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Upload Biometric Device Logs
              </h3>
              <p className="text-xs text-slate-500">
                Process ZKTeco / Biometric device logs (.dat, ATTLOG, .txt)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset()
              onClose()
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {uploadMutation.isError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {(uploadMutation.error as any)?.response?.data?.message ||
                  uploadMutation.error?.message ||
                  "Failed to upload or parse biometric file. Please check file format and try again."}
              </span>
            </div>
          )}

          {!result ? (
            <>
              {/* Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50"
                    : selectedFile
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".dat,.txt,.csv,.log"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-700">
                    <FileCheck className="w-12 h-12 text-emerald-500" />
                    <span className="font-semibold text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <span className="text-xs text-blue-600 mt-1 hover:underline">
                      Click or drop another file to change
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="w-12 h-12 text-slate-400" />
                    <span className="font-semibold text-sm text-slate-700">
                      Click to choose or drop biometric log file
                    </span>
                    <span className="text-xs text-slate-400">
                      Supports ZKTeco tab-delimited <code>1_attlog.dat</code> format
                    </span>
                  </div>
                )}
              </div>

              {/* Information pill */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-600">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-slate-700">Automatic Processing Engine</p>
                  <p>
                    Rapid duplicate scans (&lt;60s) are automatically coalesced. Cross-midnight
                    night shifts and grace periods are paired automatically according to shift schedules.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Biometric File Processed Successfully
                  </h4>
                  <p className="text-xs text-emerald-700">
                    All scans have been registered into the raw audit log and daily shift records.
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Valid Punches Stored</div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {result.validPunchesImported.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    From {result.totalLinesRead.toLocaleString()} total rows
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Daily Shifts Paired</div>
                  <div className="text-xl font-bold font-mono text-blue-600">
                    {result.dailyRecordsCreated.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ready for review & roster</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">RTC Battery Reset Ignored</div>
                  <div className="text-xl font-bold font-mono text-slate-600">
                    {result.discardedResetPunches}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Device year &lt; 2020</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Exceptions Flagged</div>
                  <div className="text-xl font-bold font-mono text-amber-600">
                    {result.exceptionsFlagged}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Missing check-in / check-out</div>
                </div>
              </div>

              {/* Unmapped Device IDs Alert */}
              {result.unmappedBiometricIds && result.unmappedBiometricIds.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-semibold">
                      Unmapped Biometric IDs ({result.unmappedBiometricIds.length})
                    </p>
                    <p className="text-amber-700">
                      The following machine IDs were found in the file but are not yet assigned to an employee:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {result.unmappedBiometricIds.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-0.5 bg-white font-mono font-medium rounded-md border border-amber-300 text-amber-800 text-[11px]"
                        >
                          PIN {id}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-600 pt-1">
                      Assign these machine PINs in <strong>Staff Directory</strong>, then re-upload or re-sync.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
          {!result ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-100 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>{uploadMutation.isPending ? "Parsing & Pairing..." : "Process Biometric File"}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleReset()
                onClose()
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
