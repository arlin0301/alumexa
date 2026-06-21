const ExcelJS = require('exceljs');

(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'staff1', password: 'StaffPass123!' }),
    });
    if (!loginRes.ok) return console.error('Login failed', loginRes.status);
    const login = await loginRes.json();
    const token = login.token;

    const res = await fetch('http://localhost:5000/api/staff-admin/export/excel', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return console.error('Export failed', res.status);

    const buf = Buffer.from(await res.arrayBuffer());
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);

    const info = wb.worksheets.map((ws) => ({ name: ws.name, rowCount: ws.actualRowCount }));
    console.log(JSON.stringify(info, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
