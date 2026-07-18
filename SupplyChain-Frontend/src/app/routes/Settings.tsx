import { useState } from "react"
import { Info, Key, Check } from "lucide-react"
import { useNotificationStore } from "@/stores/notification.store"

export default function Settings() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [erpName, setErpName] = useState("NexusERP Enterprise")
  const [currency, setCurrency] = useState("USD")
  const [threshold, setThreshold] = useState("15")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [apiLogs, setApiLogs] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    addNotification({
      text: "System core preferences updated successfully.",
      read: false,
      type: "info",
    })
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Settings</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure ERP variables, integrations, and critical inventory indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Settings Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-4.5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">ERP Engine Configuration</h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  ERP Instance Name
                </label>
                <input
                  type="text"
                  required
                  value={erpName}
                  onChange={(e) => setErpName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Transactional Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="SGD">SGD - Singapore Dollar (S$)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Low Stock Threshold Trigger
                </label>
                <input
                  type="number"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="15"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <span className="text-[10px] text-slate-400 font-medium block mt-1.5 leading-relaxed">
                  Items with quantity at or below this setting trigger alerts.
                </span>
              </div>

              <div className="space-y-4 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Enable Email Stock Warnings</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={apiLogs}
                    onChange={(e) => setApiLogs(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Log Live API Requests in Header</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check className="w-4 h-4" /> Config saved!
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-100 transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Info Column */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Instance Metadata
            </h3>
            <div className="space-y-2.5 text-xs font-semibold text-slate-600">
              {[
                ["Kernel Version", "1.0.4-LTS"],
                ["Database Provider", "In-Memory LocalState"],
                ["Host Interface", "Vite-SPA Proxy"],
                ["Deployment Region", "US-Central1"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1 border-b border-slate-50 last:border-b-0">
                  <span>{label}</span>
                  <span className="font-mono text-[10px] text-slate-400">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" />
              Developer Keys
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              API Keys and JWT Access Credentials should be declared in your `.env.example` file.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
