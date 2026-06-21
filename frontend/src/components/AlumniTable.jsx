import StatusBadge from './StatusBadge';

const STATUS_LABELS = {
  WORKING: 'Working',
  HIGHER_EDUCATION: 'Higher Education',
  EXAM_PREPARATION: 'Exam Preparation',
  OTHERS: 'Others',
};

export default function AlumniTable({ alumni, showDepartment = true, renderActions }) {
  if (alumni.length === 0) {
    return <p className="text-sm text-slate-500 py-10 text-center">No alumni records found.</p>;
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="sm:hidden space-y-3">
        {alumni.map((a) => (
          <div key={a.id} className="rounded-xl border border-surface-200 bg-white p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{a.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{a.email}</p>
              </div>
              <StatusBadge status={a.verificationStatus} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div><span className="text-slate-400">Reg No:</span> {a.registerNumber}</div>
              <div><span className="text-slate-400">Batch:</span> {a.batch}</div>
              {showDepartment && <div><span className="text-slate-400">Dept:</span> {a.department?.name}</div>}
              <div><span className="text-slate-400">Status:</span> {STATUS_LABELS[a.currentStatus] || a.currentStatus}</div>
            </div>
            {a.organizationName && (
              <p className="text-xs text-slate-500">{a.designation} · {a.organizationName}</p>
            )}
            {a.institutionName && (
              <p className="text-xs text-slate-500">{a.degreePursuing} · {a.institutionName}</p>
            )}
            {renderActions && (
              <div className="pt-1">{renderActions(a)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-surface-200">
              <th className="py-2 pr-3 font-medium whitespace-nowrap">Name</th>
              <th className="py-2 pr-3 font-medium whitespace-nowrap">Register No.</th>
              <th className="py-2 pr-3 font-medium whitespace-nowrap">Batch</th>
              {showDepartment && <th className="py-2 pr-3 font-medium whitespace-nowrap">Department</th>}
              <th className="py-2 pr-3 font-medium whitespace-nowrap">Current Status</th>
              <th className="py-2 pr-3 font-medium whitespace-nowrap">Verification</th>
              {renderActions && <th className="py-2 font-medium whitespace-nowrap">Action</th>}
            </tr>
          </thead>
          <tbody>
            {alumni.map((a) => (
              <tr key={a.id} className="border-b border-surface-100 last:border-0 align-top">
                <td className="py-3 pr-3">
                  <p className="font-medium text-slate-700 whitespace-nowrap">{a.fullName}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[180px]">{a.email}</p>
                </td>
                <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{a.registerNumber}</td>
                <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{a.batch}</td>
                {showDepartment && <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">{a.department?.name}</td>}
                <td className="py-3 pr-3 text-slate-500">
                  {STATUS_LABELS[a.currentStatus] || a.currentStatus}
                  {a.organizationName && <p className="text-xs text-slate-400 truncate max-w-[160px]">{a.designation} · {a.organizationName}</p>}
                  {a.institutionName && <p className="text-xs text-slate-400 truncate max-w-[160px]">{a.degreePursuing} · {a.institutionName}</p>}
                  {a.examName && <p className="text-xs text-slate-400 truncate max-w-[160px]">{a.examName}</p>}
                  {a.activityName && <p className="text-xs text-slate-400 truncate max-w-[160px]">{a.activityName}</p>}
                </td>
                <td className="py-3 pr-3"><StatusBadge status={a.verificationStatus} /></td>
                {renderActions && <td className="py-3 whitespace-nowrap">{renderActions(a)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}