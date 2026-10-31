import React from "react"

interface Props {
  preparedTitle?: string
  checkedTitle?: string
  approvedTitle?: string
  receivedTitle?: string
}

export const PayrollSignoffFooter: React.FC<Props> = ({
  preparedTitle = "Payroll Accountant",
  checkedTitle = "Internal Audit / HR",
  approvedTitle = "General Manager / Director",
  receivedTitle = "Cashier / Bank Officer",
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-slate-300 avoid-break">
      <div className="grid grid-cols-4 gap-6 text-center text-xs">
        <div>
          <div className="border-b border-slate-400 w-36 mx-auto mb-1.5 h-10"></div>
          <span className="font-bold text-slate-900 block">Prepared By</span>
          <span className="text-[10px] text-slate-500 block">{preparedTitle}</span>
        </div>
        <div>
          <div className="border-b border-slate-400 w-36 mx-auto mb-1.5 h-10"></div>
          <span className="font-bold text-slate-900 block">Checked By</span>
          <span className="text-[10px] text-slate-500 block">{checkedTitle}</span>
        </div>
        <div>
          <div className="border-b border-slate-400 w-36 mx-auto mb-1.5 h-10"></div>
          <span className="font-bold text-slate-900 block">Approved By</span>
          <span className="text-[10px] text-slate-500 block">{approvedTitle}</span>
        </div>
        <div>
          <div className="border-b border-slate-400 w-36 mx-auto mb-1.5 h-10"></div>
          <span className="font-bold text-slate-900 block">Disbursed / Received By</span>
          <span className="text-[10px] text-slate-500 block">{receivedTitle}</span>
        </div>
      </div>
      <div className="mt-4 text-center text-[10px] text-slate-400 font-mono">
        This is a computer-generated official payroll record issued under NextGenBytes ERP security controls.
      </div>
    </div>
  )
}

