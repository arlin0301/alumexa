export default function StatusBadge({ status }) {
  const map = {
    PENDING: { className: 'badge-pending', label: 'Pending' },
    VERIFIED: { className: 'badge-verified', label: 'Verified' },
    REJECTED: { className: 'badge-rejected', label: 'Rejected' },
  };

  const config = map[status] || { className: 'badge bg-slate-100 text-slate-600', label: status };

  return <span className={config.className}>{config.label}</span>;
}
