import { useState } from "react"
import { FileText, Calendar, ArrowDown, Printer, RefreshCcw, Sparkles } from "lucide-react"
import { useNotificationStore } from "@/stores/notification.store"

const templates = [
  { id: "sales", name: "Sales Revenue Summary", desc: "Outbound sales, customer analytics, and revenue metrics." },
  { id: "inventory", name: "Inventory Valuation", desc: "Current warehouse stock levels, assets value, and alerts." },
  { id: "supplier", name: "Supplier Fulfillment", desc: "Procurement costs, lead times, and supplier performance." },
  { id: "pnl", name: "Profit & Loss Ledger", desc: "Consolidated overview of sales revenue vs purchase costs." },
]

const reportData: Record<string, { metrics: { label: string; value: string }[]; summary: string }> = {
  sales: {
    metrics: [
      { label: "Gross Billings", value: "$394,820" },
      { label: "Avg Order Value", value: "$32,901" },
    ],
    summary: "Historical sales data shows sustained demand across Electronics and Premium Seating lines. Order cycle times average 2.1 days.",
  },
  inventory: {
    metrics: [
      { label: "Current Stock Assets", value: "$1,104,250" },
      { label: "Warehouse Occupancy", value: "72% Capacity" },
    ],
    summary: "London East is at critical capacity, carrying over-allocated industrial equipment assets. Transshipment routes are recommended.",
  },
  supplier: {
    metrics: [
      { label: "Procurement Expenditure", value: "$185,500" },
      { label: "Lead Time Average", value: "4.3 Days" },
    ],
    summary: "NexusPrime has a 99.4% on-time delivery metric, while Caterpillar Freight has dropped below SLAs to 91.2% due to route delays.",
  },
  pnl: {
    metrics: [
      { label: "Net Revenue Earnings", value: "$209,320" },
      { label: "Operational Margin", value: "53% Profit" },
    ],
    summary: "With outbound invoices reaching $394k and acquisition costs contained at $185k, NexusERP represents a robust business ledger.",
  },
}

export default function Reports() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [activeTemplate, setActiveTemplate] = useState("sales")
  const [startDate, setStartDate] = useState("2026-01-01")
  const [endDate, setEndDate] = useState("2026-07-18")
  const [warehouse, setWarehouse] = useState("All")
  const [loading, setLoading] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  const handleGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setReportGenerated(true)
      addNotification({
        text: `Generated analytical report: "${templates.find((t) => t.id === activeTemplate)?.name}"`,
        read: false,
        type: "success",
      })
    }, 1200)
  }

  const handleDownload = () => {
    // Simulate download
  }

  const handlePrint = () => {
    window.print()
  }

  const currentReport = reportData[activeTemplate]

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Home</span>
        <span>/</span>
        <span className="text-slate-800">Reports Hub</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Synthesize transaction histories into formal, audited corporate summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Template Selector Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-5 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800">1. Select Template</h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose a report baseline schema.</p>
          </div>

          <div className="space-y-2">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => { setActiveTemplate(tmpl.id); setReportGenerated(false) }}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  activeTemplate === tmpl.id
                    ? "bg-blue-50/20 border-blue-200 shadow-sm"
                    : "bg-white border-slate-100 hover:bg-slate-50/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm ${
                    activeTemplate === tmpl.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-slate-50 border-slate-200/50 text-slate-500"
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-slate-800">{tmpl.name}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 leading-normal truncate">
                      {tmpl.desc}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-50 pt-5 space-y-4">
            <div>
              <h2 className="text-xs font-bold text-slate-800">2. Configure Filters</h2>
              <p className="text-[10px] text-slate-400">Refine report constraints.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setReportGenerated(false) }}
                    className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setReportGenerated(false) }}
                    className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Warehouse Scope
              </label>
              <select
                value={warehouse}
                onChange={(e) => { setWarehouse(e.target.value); setReportGenerated(false) }}
                className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Depots & Terminals</option>
                <option value="WH-001">London East Depot (WH-001)</option>
                <option value="WH-002">Texas Central Hub (WH-002)</option>
                <option value="WH-004">Singapore Shipping (WH-004)</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Synthesizing Data..." : "Generate Consolidated Report"}
            </button>
          </div>
        </div>

        {/* Preview Panel Card */}
        <div className="lg:col-span-7">
          {!reportGenerated && !loading && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center h-[460px]">
              <FileText className="w-12 h-12 text-slate-300 stroke-1" />
              <h3 className="text-sm font-bold text-slate-700 mt-4">Preview Pane Idle</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                Configure template criteria and click "Generate Consolidated Report" on the left to pull data.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center text-slate-400 flex flex-col items-center justify-center h-[460px]">
              <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <h3 className="text-sm font-bold text-slate-700 mt-5">Synthesizing Datasets</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                Querying ledgers, validating checksums, and building report models. Please wait.
              </p>
            </div>
          )}

          {reportGenerated && !loading && currentReport && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-[460px]">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-blue-100 rounded text-blue-700">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                    AISTUDIO-AUDITED-LEDGER
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-5">
                <div className="text-center border-b border-slate-100 pb-5">
                  <h3 className="text-base font-extrabold text-slate-900 font-display">
                    {templates.find((t) => t.id === activeTemplate)?.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium font-mono mt-1">
                    RANGE: {startDate} TO {endDate} | SCOPE: {warehouse === "All" ? "GLOBAL" : warehouse}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {currentReport.metrics.map((m) => (
                      <div key={m.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <span className="text-[9px] font-bold uppercase text-slate-400">{m.label}</span>
                        <p className="mt-0.5 text-base font-bold text-slate-800">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-semibold leading-relaxed text-slate-500">
                    {currentReport.summary}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">
                VERIFIED CORPORATE DOCUMENT • NexusERP v1.0
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
