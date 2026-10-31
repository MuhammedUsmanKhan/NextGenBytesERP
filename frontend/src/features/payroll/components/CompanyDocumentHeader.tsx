import React from "react"

interface Props {
  documentTitle?: string
  subTitle?: string
  monthYear?: string
}

export const CompanyDocumentHeader: React.FC<Props> = ({
  documentTitle,
  subTitle,
  monthYear,
}) => {
  return (
    <div className="w-full">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3">
        {/* Left: NextGen Bytes ERP Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Stylized Vector "N" Mark */}
          <div className="w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Dark Navy polygon limbs */}
              <polygon points="12,15 36,15 36,85 12,85" fill="#0e2a47" />
              <polygon points="64,15 88,15 88,85 64,85" fill="#0e2a47" />
              {/* Vibrant Gold diagonal ribbon crossbar */}
              <polygon points="26,18 48,15 76,75 54,78" fill="#e69a19" />
              <polygon points="40,30 52,28 78,85 66,85" fill="#f59e0b" opacity="0.9" />
            </svg>
          </div>

          {/* Brand Wordmark */}
          <div className="flex flex-col leading-none select-none">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-[#0e2a47] font-display">
                NextGen
              </span>
              <span className="text-2xl font-black tracking-tight text-[#e69a19] font-display">
                Bytes
              </span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.38em] text-[#0e2a47] uppercase mt-0.5">
              E R P
            </span>
          </div>
        </div>

        {/* Center/Right Vertical Divider & Contact Block */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-[1.5px] bg-slate-300"></div>

          <div className="text-left text-[11px] text-slate-600 leading-tight space-y-0.5">
            <div className="font-bold text-slate-800 text-xs">
              NextGen Bytes ERP
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">📍</span>
              <span>123 Business Avenue, Karachi, Pakistan</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">✉</span>
              <span>info@nextgenbytes.com</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-400">🌐</span>
              <span>www.nextgenbytes.com</span>
            </div>
          </div>

          {/* Optional Document Classification Pill (if provided) */}
          {documentTitle && (
            <div className="hidden sm:block text-right pl-3 border-l border-slate-200">
              <span className="inline-block px-2.5 py-1 rounded bg-[#0e2a47] text-white text-[10px] font-bold uppercase tracking-wider">
                {documentTitle}
              </span>
              {subTitle && (
                <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                  {subTitle}
                </div>
              )}
              {monthYear && (
                <div className="text-[10px] font-mono text-slate-500 font-medium mt-1">
                  Period: <span className="font-bold text-slate-800">{monthYear}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gold & Navy Accent Stripe */}
      <div className="w-full h-1 bg-gradient-to-r from-[#e69a19] via-[#f59e0b] to-[#0e2a47] rounded-full mb-4"></div>
    </div>
  )
}

/**
 * Bottom decorative curved swoosh matching the reference document footer
 */
export const CompanyDocumentFooter: React.FC<{
  generatedDate?: string
  pageNumber?: number
  totalPages?: number
}> = ({
  generatedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  pageNumber = 1,
  totalPages = 1,
}) => {
  return (
    <div className="mt-8 pt-3 border-t border-slate-200 avoid-break w-full">
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold">
            i
          </span>
          <span>Generated on: {generatedDate}</span>
          <span className="mx-1 text-slate-300">•</span>
          <span>Page {pageNumber} of {totalPages}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          NextGen Bytes ERP • Certified Document
        </span>
      </div>

      {/* Signature Curved Bottom Navy & Gold Swoosh Bar */}
      <div className="w-full h-2.5 bg-[#0e2a47] relative overflow-hidden rounded-xs">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-[#e69a19] transform -skew-x-12"></div>
        <div className="absolute right-1/4 top-0 bottom-0 w-12 bg-[#f59e0b] opacity-80 transform -skew-x-12"></div>
      </div>
    </div>
  )
}
