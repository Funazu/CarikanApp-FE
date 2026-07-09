import React from 'react';

const StatusBadge = ({ status }) => {
  let classes = "";
  let text = "";

  switch (status) {
    case 'OPEN':
      classes = "bg-primary-container text-primary-fixed-dim border border-primary/20";
      text = "Aktif (Open)";
      break;
    case 'IN_PROCESS':
      classes = "bg-amber-50 text-amber-700 border border-amber-200";
      text = "Dalam Proses (In Process)";
      break;
    case 'RETURNED':
      classes = "bg-emerald-50 text-emerald-700 border border-emerald-200";
      text = "Selesai (Returned)";
      break;
    default:
      classes = "bg-gray-100 text-gray-700 border border-gray-200";
      text = status;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {text}
    </span>
  );
};

export default StatusBadge;
