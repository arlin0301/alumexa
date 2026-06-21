// Lightweight CSV generator — avoids extra dependencies (ExcelJS/PDFKit) for Phase 1

function toCsv(rows, columns) {
  // columns: [{ key: 'fullName', label: 'Full Name' }, ...]
  const header = columns.map((c) => escapeCell(c.label)).join(',');

  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const value = typeof c.value === 'function' ? c.value(row) : row[c.key];
        return escapeCell(value);
      })
      .join(',')
  );

  return [header, ...lines].join('\n');
}

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function sendCsv(res, filename, rows, columns) {
  const csv = toCsv(rows, columns);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

module.exports = { toCsv, sendCsv };
