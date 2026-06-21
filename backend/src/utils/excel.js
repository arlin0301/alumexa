const ExcelJS = require('exceljs');

const BRAND_TEAL = '0F766E';
const HEADER_BG = 'E6F4F3';
const ALT_ROW = 'F8FAFB';

/**
 * Builds and sends a professional Excel workbook.
 * @param {Response} res - Express response
 * @param {string} filename - Download filename (without .xlsx)
 * @param {Array} sheets - [{ name, columns: [{header, key, width}], rows }]
 */
async function sendExcel(res, filename, sheets) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Alumexa';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  for (const sheet of sheets) {
    const ws = workbook.addWorksheet(sheet.name, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    ws.columns = sheet.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND_TEAL}` } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });
    headerRow.height = 22;

    // Add data rows with alternating row color
    sheet.rows.forEach((row, idx) => {
      const dataRow = ws.addRow(row);
      if (idx % 2 === 1) {
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${ALT_ROW.replace('#', '')}` } };
        });
      }
      dataRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: false };
        cell.font = { size: 10 };
      });
      dataRow.height = 18;
    });

    // Auto-filter on header row
    if (sheet.rows.length > 0) {
      ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columns.length },
      };
    }
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}-${formatDate(new Date())}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function safe(val) {
  if (val === null || val === undefined) return '';
  return String(val);
}

// ---- Column definitions reused across admin and staff exports ----

function alumniMasterColumns() {
  return [
    { header: 'Full Name', key: 'fullName', width: 24 },
    { header: 'Register No.', key: 'registerNumber', width: 18 },
    { header: 'Department', key: 'department', width: 28 },
    { header: 'Batch', key: 'batch', width: 10 },
    { header: 'Degree', key: 'degree', width: 16 },
    { header: 'Degree Type', key: 'degreeType', width: 16 },
    { header: 'Specialization', key: 'degreeSpecialization', width: 28 },
    { header: 'Institution', key: 'degreeInstitution', width: 28 },
    { header: 'Mobile', key: 'mobile', width: 16 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Current Status', key: 'currentStatus', width: 22 },
    { header: 'Verification', key: 'verificationStatus', width: 16 },
    { header: 'Date of Birth', key: 'dateOfBirth', width: 16 },
    { header: 'Address Line 1', key: 'addressLine1', width: 30 },
    { header: 'Address Line 2', key: 'addressLine2', width: 20 },
    { header: 'City', key: 'city', width: 16 },
    { header: 'District', key: 'district', width: 16 },
    { header: 'State', key: 'state', width: 16 },
    { header: 'Country', key: 'country', width: 16 },
    { header: 'PIN / ZIP', key: 'pinCode', width: 12 },
  ];
}

function toMasterRow(a) {
  return {
    fullName: safe(a.fullName),
    registerNumber: safe(a.registerNumber),
    department: safe(a.department?.name),
    batch: safe(a.batch),
    degree: safe(a.degree),
    degreeType: safe(a.degreeType),
    degreeSpecialization: safe(a.degreeSpecialization),
    degreeInstitution: safe(a.degreeInstitution),
    mobile: safe(a.mobile),
    email: safe(a.email),
    currentStatus: safe(a.currentStatus),
    verificationStatus: safe(a.verificationStatus),
    dateOfBirth: safe(a.dateOfBirth),
    addressLine1: safe(a.addressLine1),
    addressLine2: safe(a.addressLine2),
    city: safe(a.city),
    district: safe(a.district),
    state: safe(a.state),
    country: safe(a.country),
    pinCode: safe(a.pinCode),
  };
}

/**
 * Build all 10 sheets for a given alumni list.
 * Pass an optional `deptName` for the Department Summary sheet label.
 */
function buildSheets(alumni, deptName = 'All Departments') {
  const working = alumni.filter((a) => a.currentStatus === 'WORKING');
  const higherEd = alumni.filter((a) => a.currentStatus === 'HIGHER_EDUCATION');
  const entrepreneurs = alumni.filter((a) => a.currentStatus === 'ENTREPRENEURSHIP');
  const examPrep = alumni.filter((a) => a.currentStatus === 'EXAM_PREPARATION');
  const others = alumni.filter((a) => a.currentStatus === 'OTHERS');
  const verified = alumni.filter((a) => a.verificationStatus === 'VERIFIED');

  // Flatten career entries for employment and higher-ed sheets
  const workEntries = alumni.flatMap((a) =>
    (a.careerEntries || [])
      .filter((e) => e.type === 'WORKING')
      .map((e) => ({ alumni: a, entry: e }))
  );
  const higherEdEntries = alumni.flatMap((a) =>
    (a.careerEntries || [])
      .filter((e) => e.type === 'HIGHER_EDUCATION')
      .map((e) => ({ alumni: a, entry: e }))
  );
  const proofDocs = alumni.flatMap((a) =>
    (a.proofDocuments || []).map((d) => ({ alumni: a, doc: d }))
  );

  return [
    {
      name: '1 - Alumni Master Data',
      columns: alumniMasterColumns(),
      rows: alumni.map(toMasterRow),
    },
    {
      name: '2 - Working Alumni',
      columns: [
        { header: 'Full Name', key: 'fullName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Department', key: 'department', width: 28 },
        { header: 'Batch', key: 'batch', width: 10 },
        { header: 'Organization', key: 'organizationName', width: 28 },
        { header: 'Designation', key: 'designation', width: 22 },
        { header: 'Employment Type', key: 'employmentType', width: 22 },
        { header: 'Salary Package', key: 'salaryPackage', width: 16 },
        { header: 'Location', key: 'location', width: 20 },
      ],
      rows: working.map((a) => ({
        fullName: safe(a.fullName), registerNumber: safe(a.registerNumber),
        department: safe(a.department?.name), batch: safe(a.batch),
        organizationName: safe(a.organizationName), designation: safe(a.designation),
        employmentType: safe(a.employmentType), salaryPackage: safe(a.salaryPackage),
        location: safe(a.location),
      })),
    },
    {
      name: '3 - Higher Education',
      columns: [
        { header: 'Full Name', key: 'fullName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Department', key: 'department', width: 28 },
        { header: 'Batch', key: 'batch', width: 10 },
        { header: 'Institution', key: 'institutionName', width: 30 },
        { header: 'Degree Pursuing', key: 'degreePursuing', width: 24 },
        { header: 'Specialization', key: 'specialization', width: 28 },
        { header: 'Start Year', key: 'startYear', width: 12 },
        { header: 'Expected Completion', key: 'expectedCompletionYear', width: 20 },
      ],
      rows: higherEd.map((a) => ({
        fullName: safe(a.fullName), registerNumber: safe(a.registerNumber),
        department: safe(a.department?.name), batch: safe(a.batch),
        institutionName: safe(a.institutionName), degreePursuing: safe(a.degreePursuing),
        specialization: safe(a.specialization), startYear: safe(a.startYear),
        expectedCompletionYear: safe(a.expectedCompletionYear),
      })),
    },
    {
      name: '4 - Entrepreneurs',
      columns: [
        { header: 'Full Name', key: 'fullName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Department', key: 'department', width: 28 },
        { header: 'Business Name', key: 'businessName', width: 28 },
        { header: 'Industry', key: 'industry', width: 22 },
        { header: 'Founder Role', key: 'founderRole', width: 20 },
      ],
      rows: entrepreneurs.map((a) => ({
        fullName: safe(a.fullName), registerNumber: safe(a.registerNumber),
        department: safe(a.department?.name),
        businessName: safe(a.businessName || a.organizationName),
        industry: safe(a.industry || a.employmentSector),
        founderRole: safe(a.founderRole || a.designation),
      })),
    },
    {
      name: '5 - Exam Preparation',
      columns: [
        { header: 'Full Name', key: 'fullName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Department', key: 'department', width: 28 },
        { header: 'Exam Name', key: 'examName', width: 24 },
        { header: 'Preparation Type', key: 'preparationType', width: 22 },
        { header: 'Start Year', key: 'examStartYear', width: 12 },
        { header: 'Expected Exam Year', key: 'expectedExamYear', width: 20 },
      ],
      rows: examPrep.map((a) => ({
        fullName: safe(a.fullName), registerNumber: safe(a.registerNumber),
        department: safe(a.department?.name), examName: safe(a.examName),
        preparationType: safe(a.preparationType), examStartYear: safe(a.examStartYear),
        expectedExamYear: safe(a.expectedExamYear),
      })),
    },
    {
      name: '6 - Other Activities',
      columns: [
        { header: 'Full Name', key: 'fullName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Department', key: 'department', width: 28 },
        { header: 'Activity Name', key: 'activityName', width: 24 },
        { header: 'Description', key: 'description', width: 40 },
      ],
      rows: others.map((a) => ({
        fullName: safe(a.fullName), registerNumber: safe(a.registerNumber),
        department: safe(a.department?.name), activityName: safe(a.activityName),
        description: safe(a.description),
      })),
    },
    {
      name: '7 - Employment Details',
      columns: [
        { header: 'Alumni Name', key: 'alumniName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Organization', key: 'organizationName', width: 28 },
        { header: 'Designation', key: 'designation', width: 22 },
        { header: 'Employment Type', key: 'employmentType', width: 22 },
        { header: 'Salary Package', key: 'salaryPackage', width: 16 },
        { header: 'Start Date', key: 'startDate', width: 14 },
        { header: 'End Date', key: 'endDate', width: 14 },
        { header: 'Current', key: 'currentlyActive', width: 10 },
      ],
      rows: workEntries.map(({ alumni: a, entry: e }) => ({
        alumniName: safe(a.fullName), registerNumber: safe(a.registerNumber),
        organizationName: safe(e.organizationName), designation: safe(e.designation),
        employmentType: safe(e.employmentType), salaryPackage: safe(e.salaryPackage),
        startDate: safe(e.startDate), endDate: safe(e.endDate),
        currentlyActive: e.currentlyActive ? 'Yes' : 'No',
      })),
    },
    {
      name: '8 - Higher Ed Details',
      columns: [
        { header: 'Alumni Name', key: 'alumniName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Degree Type', key: 'degreeType', width: 16 },
        { header: 'Specialization', key: 'specialization', width: 28 },
        { header: 'Institution', key: 'institutionName', width: 30 },
        { header: 'Start Year', key: 'startYear', width: 12 },
        { header: 'End Year', key: 'endYear', width: 12 },
      ],
      rows: higherEdEntries.map(({ alumni: a, entry: e }) => ({
        alumniName: safe(a.fullName), registerNumber: safe(a.registerNumber),
        degreeType: safe(e.degreeType || e.degree), specialization: safe(e.specialization),
        institutionName: safe(e.institutionName), startYear: safe(e.startYear),
        endYear: safe(e.endYear || e.endDate),
      })),
    },
    {
      name: '9 - Proof Documents',
      columns: [
        { header: 'Alumni Name', key: 'alumniName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Department', key: 'department', width: 24 },
        { header: 'Proof Category', key: 'docType', width: 26 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'File Name', key: 'originalName', width: 36 },
        { header: 'Upload Date', key: 'uploadedAt', width: 18 },
        { header: 'Linked To', key: 'linkedTo', width: 22 },
        { header: 'Entry Context', key: 'entryContext', width: 30 },
      ],
      rows: proofDocs.map(({ alumni: a, doc: d }) => {
        // Find the career entry this doc belongs to (if any) to add context
        const entry = d.careerEntryId
          ? (a.careerEntries || []).find((e) => e.id === d.careerEntryId)
          : null;

        const entryContext = entry
          ? [entry.organizationName, entry.institutionName, entry.businessName, entry.examName, entry.activityName]
              .filter(Boolean)
              .join(' / ') || entry.type
          : 'Registration';

        return {
          alumniName: safe(a.fullName),
          registerNumber: safe(a.registerNumber),
          department: safe(a.department?.name),
          docType: safe(d.docType).replace(/_/g, ' '),
          description: safe(d.description),
          originalName: safe(d.originalName),
          uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-IN') : '',
          linkedTo: d.careerEntryId ? 'Career Entry' : 'Registration',
          entryContext: safe(entryContext),
        };
      }),
    },
    {
      name: '10 - Summary',
      columns: [
        { header: 'Category', key: 'category', width: 32 },
        { header: 'Count', key: 'count', width: 14 },
      ],
      rows: [
        { category: `Department: ${deptName}`, count: '' },
        { category: 'Total Alumni', count: alumni.length },
        { category: 'Verified Alumni', count: verified.length },
        { category: 'Working Alumni', count: working.length },
        { category: 'Higher Education', count: higherEd.length },
        { category: 'Entrepreneurs', count: entrepreneurs.length },
        { category: 'Exam Preparation', count: examPrep.length },
        { category: 'Other Activities', count: others.length },
        { category: 'Total Proof Documents', count: proofDocs.length },
        { category: 'Export Generated At', count: new Date().toLocaleString('en-IN') },
      ],
    },
    // Additional sheet with raw proof file details and direct download URLs
    {
      name: '11 - Proof Files',
      columns: [
        { header: 'Alumni Name', key: 'alumniName', width: 24 },
        { header: 'Register No.', key: 'registerNumber', width: 18 },
        { header: 'Department', key: 'department', width: 24 },
        { header: 'Doc ID', key: 'docId', width: 12 },
        { header: 'Doc Type', key: 'docType', width: 22 },
        { header: 'Original Name', key: 'originalName', width: 36 },
        { header: 'Stored Name', key: 'storedName', width: 36 },
        { header: 'Download URL', key: 'downloadUrl', width: 50 },
        { header: 'Uploaded At', key: 'uploadedAt', width: 18 },
      ],
      rows: proofDocs.map(({ alumni: a, doc: d }) => ({
        alumniName: safe(a.fullName),
        registerNumber: safe(a.registerNumber),
        department: safe(a.department?.name),
        docId: safe(d.id),
        docType: safe(d.docType),
        originalName: safe(d.originalName),
        storedName: safe(d.storedName),
        downloadUrl: safe(`/uploads/${d.storedName}`),
        uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toLocaleString('en-IN') : '',
      })),
    },
  ];
}

module.exports = { sendExcel, buildSheets };
