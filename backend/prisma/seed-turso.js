require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
];

// ─── STAFF ADMINS ─────────────────────────────────────────────────────────────
const STAFF_ADMINS = [
  { email: 'cs_admin@alumexa.com',  username: 'csadmin',  password: 'CsAdmin123!',  department: 'Computer Science' },
  { email: 'ec_admin@alumexa.com',  username: 'ecadmin',  password: 'EcAdmin123!',  department: 'Electronics & Communication' },
  { email: 'me_admin@alumexa.com',  username: 'meadmin',  password: 'MeAdmin123!',  department: 'Mechanical Engineering' },
];

// ─── ALUMNI (4 records — all 4 currentStatus scenarios) ──────────────────────
// verificationStatus: VERIFIED, PENDING, REJECTED, VERIFIED
const ALUMNI = [
  {
    // Scenario 1: WORKING — VERIFIED
    user: { email: 'aarav.sharma@example.com', username: 'aarav.sharma' },
    profile: {
      fullName: 'Aarav Sharma',
      registerNumber: 'CS2018001',
      batch: '2018',
      department: 'Computer Science',
      degree: 'UG',
      degreeType: 'UG',
      degreeSpecialization: 'Data Science',
      degreeInstitution: 'Anna University',
      mobile: '9880012345',
      email: 'aarav.sharma@example.com',
      dateOfBirth: '1997-06-15',
      addressLine1: '12, MG Road',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      country: 'India',
      pinCode: '560001',
      currentStatus: 'WORKING',
      employmentSector: 'Information Technology',
      employmentType: 'PRIVATE',
      organizationName: 'Zenith Solutions Pvt Ltd',
      designation: 'Senior Software Engineer',
      location: 'Bengaluru',
      salaryPackage: '18 LPA',
      verificationStatus: 'VERIFIED',
      profileVisibility: 'PUBLIC',
      linkedin: 'https://linkedin.com/in/aaravsharma',
      portfolio: 'https://aaravsharma.dev',
      mentorCareerGuidance: true,
      mentorInternshipGuidance: true,
      skills: ['Python', 'React', 'AWS', 'Machine Learning', 'Node.js'],
      careerEntries: [
        {
          type: 'WORKING',
          employmentSector: 'IT Services',
          employmentType: 'PRIVATE',
          organizationName: 'TechStart Pvt Ltd',
          designation: 'Junior Developer',
          location: 'Chennai',
          salaryPackage: '6 LPA',
          startDate: '2018-07-01',
          endDate: '2020-06-30',
          currentlyActive: false,
        },
        {
          type: 'WORKING',
          employmentSector: 'Information Technology',
          employmentType: 'PRIVATE',
          organizationName: 'Zenith Solutions Pvt Ltd',
          designation: 'Senior Software Engineer',
          location: 'Bengaluru',
          salaryPackage: '18 LPA',
          startDate: '2020-07-01',
          currentlyActive: true,
        },
      ],
    },
  },
  {
    // Scenario 2: HIGHER_EDUCATION — VERIFIED
    user: { email: 'meera.nair@example.com', username: 'meera.nair' },
    profile: {
      fullName: 'Meera Nair',
      registerNumber: 'EC2019002',
      batch: '2019',
      department: 'Electronics & Communication',
      degree: 'UG',
      degreeType: 'UG',
      degreeSpecialization: 'VLSI Design',
      degreeInstitution: 'Calicut University',
      mobile: '9960012345',
      email: 'meera.nair@example.com',
      dateOfBirth: '1998-03-22',
      addressLine1: '45, Palarivattom Road',
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      country: 'India',
      pinCode: '682025',
      currentStatus: 'HIGHER_EDUCATION',
      institutionName: 'IIT Madras',
      degreePursuing: 'M.Tech',
      specialization: 'VLSI Design',
      startYear: '2023',
      expectedCompletionYear: '2025',
      verificationStatus: 'VERIFIED',
      profileVisibility: 'PUBLIC',
      linkedin: 'https://linkedin.com/in/meeranair',
      mentorHigherStudiesGuidance: true,
      skills: ['VHDL', 'Verilog', 'Cadence', 'MATLAB', 'Embedded C'],
      careerEntries: [
        {
          type: 'HIGHER_EDUCATION',
          institutionName: 'IIT Madras',
          degree: 'M.Tech',
          specialization: 'VLSI Design',
          degreeType: 'PG',
          startYear: '2023',
          endYear: '2025',
          currentlyActive: true,
        },
      ],
    },
  },
  {
    // Scenario 3: EXAM_PREPARATION — PENDING
    user: { email: 'rohit.singh@example.com', username: 'rohit.singh' },
    profile: {
      fullName: 'Rohit Singh',
      registerNumber: 'ME2020003',
      batch: '2020',
      department: 'Mechanical Engineering',
      degree: 'UG',
      degreeType: 'UG',
      degreeSpecialization: 'Thermal Engineering',
      degreeInstitution: 'VTU',
      mobile: '9850012345',
      email: 'rohit.singh@example.com',
      dateOfBirth: '1999-11-08',
      addressLine1: '78, Sadar Bazar',
      city: 'Nagpur',
      district: 'Nagpur',
      state: 'Maharashtra',
      country: 'India',
      pinCode: '440001',
      currentStatus: 'EXAM_PREPARATION',
      examName: 'GATE',
      preparationType: 'Coaching',
      examInstitutionName: 'Prime GATE Institute',
      examStartYear: '2024',
      expectedExamYear: '2025',
      verificationStatus: 'PENDING',
      profileVisibility: 'PUBLIC',
      mentorExamPrepGuidance: true,
      skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Thermodynamics'],
      careerEntries: [
        {
          type: 'EXAM_PREPARATION',
          examName: 'GATE',
          preparationType: 'Coaching',
          examInstitution: 'Prime GATE Institute',
          startDate: '2024-01-01',
          currentlyActive: true,
        },
      ],
    },
  },
  {
    // Scenario 4: OTHERS — REJECTED
    user: { email: 'priya.menon@example.com', username: 'priya.menon' },
    profile: {
      fullName: 'Priya Menon',
      registerNumber: 'CS2019004',
      batch: '2019',
      department: 'Computer Science',
      degree: 'UG',
      degreeType: 'UG',
      degreeSpecialization: 'Artificial Intelligence',
      degreeInstitution: 'Anna University',
      mobile: '9870012345',
      email: 'priya.menon@example.com',
      dateOfBirth: '1998-07-30',
      addressLine1: '22, Anna Nagar',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pinCode: '600040',
      currentStatus: 'OTHERS',
      activityName: 'Freelance Content Creator & Tech Blogger',
      description: 'Running a YouTube channel on AI/ML tutorials with 50k subscribers',
      verificationStatus: 'REJECTED',
      rejectionReason: 'Submitted documents were unclear. Please re-upload valid degree certificate.',
      profileVisibility: 'PRIVATE',
      mentorEntrepreneurshipGuidance: true,
      skills: ['Content Writing', 'Video Editing', 'Python', 'TensorFlow'],
      careerEntries: [
        {
          type: 'OTHER',
          activityName: 'Freelance Tech Content Creator',
          description: 'YouTube + Blog covering AI/ML and programming tutorials',
          startDate: '2022-03-01',
          currentlyActive: true,
        },
      ],
    },
  },
];

// ─── STUDENTS (2 records) ─────────────────────────────────────────────────────
const STUDENTS = [
  {
    user: { email: 'nisha.patel@student.alumexa.com', username: 'nisha.patel' },
    profile: {
      fullName: 'Nisha Patel',
      registerNumber: 'ST2024001',
      department: 'Computer Science',
      currentYear: '2nd Year',
      email: 'nisha.patel@student.alumexa.com',
      careerInterest: 'Software development and web technologies',
    },
  },
  {
    user: { email: 'vikram.rao@student.alumexa.com', username: 'vikram.rao' },
    profile: {
      fullName: 'Vikram Rao',
      registerNumber: 'ST2024002',
      department: 'Electronics & Communication',
      currentYear: '3rd Year',
      email: 'vikram.rao@student.alumexa.com',
      careerInterest: 'VLSI design and embedded systems',
    },
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Connecting to Turso database...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  // ── 1. Super Admin ──
  const existingSA = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!existingSA) {
    const pw = await bcrypt.hash('ChangeMe123!', 10);
    await prisma.user.create({
      data: { email: 'superadmin@alumexa.com', username: 'superadmin', password: pw, role: 'SUPER_ADMIN', isActive: true },
    });
    console.log('✔ Super Admin created');
  } else {
    console.log('⏭  Super Admin already exists');
  }

  // ── 2. Departments ──
  const deptMap = {};
  for (const name of DEPARTMENTS) {
    const existing = await prisma.department.findFirst({ where: { name } });
    if (existing) {
      deptMap[name] = existing.id;
      console.log(`⏭  Department already exists: ${name}`);
    } else {
      const d = await prisma.department.create({ data: { name } });
      deptMap[name] = d.id;
      console.log(`✔ Department created: ${name}`);
    }
  }

  // ── 3. Staff Admins ──
  for (const s of STAFF_ADMINS) {
    const existing = await prisma.user.findFirst({ where: { email: s.email } });
    if (existing) { console.log(`⏭  Staff Admin already exists: ${s.username}`); continue; }
    const pw = await bcrypt.hash(s.password, 10);
    await prisma.user.create({
      data: { email: s.email, username: s.username, password: pw, role: 'STAFF_ADMIN', departmentId: deptMap[s.department], isActive: true },
    });
    console.log(`✔ Staff Admin created: ${s.username}`);
  }

  // ── 4. Alumni ──
  for (const a of ALUMNI) {
    const existing = await prisma.user.findFirst({ where: { email: a.user.email } });
    if (existing) { console.log(`⏭  Alumni already exists: ${a.user.username}`); continue; }

    const pw = await bcrypt.hash('Alumni123!', 10);
    const user = await prisma.user.create({
      data: { email: a.user.email, username: a.user.username, password: pw, role: 'ALUMNI', isActive: true },
    });

    const p = a.profile;
    const alumniProfile = await prisma.alumniProfile.create({
      data: {
        userId: user.id,
        fullName: p.fullName,
        registerNumber: p.registerNumber,
        batch: p.batch,
        departmentId: deptMap[p.department],
        degree: p.degree,
        degreeType: p.degreeType,
        degreeSpecialization: p.degreeSpecialization,
        degreeInstitution: p.degreeInstitution,
        mobile: p.mobile,
        email: p.email,
        dateOfBirth: p.dateOfBirth,
        addressLine1: p.addressLine1,
        city: p.city,
        district: p.district,
        state: p.state,
        country: p.country,
        pinCode: p.pinCode,
        currentStatus: p.currentStatus,
        employmentSector: p.employmentSector,
        employmentType: p.employmentType,
        organizationName: p.organizationName,
        designation: p.designation,
        location: p.location,
        salaryPackage: p.salaryPackage,
        institutionName: p.institutionName,
        degreePursuing: p.degreePursuing,
        specialization: p.specialization,
        startYear: p.startYear,
        expectedCompletionYear: p.expectedCompletionYear,
        examName: p.examName,
        preparationType: p.preparationType,
        examInstitutionName: p.examInstitutionName,
        examStartYear: p.examStartYear,
        expectedExamYear: p.expectedExamYear,
        activityName: p.activityName,
        description: p.description,
        verificationStatus: p.verificationStatus,
        rejectionReason: p.rejectionReason,
        profileVisibility: p.profileVisibility,
        linkedin: p.linkedin,
        portfolio: p.portfolio,
        mentorCareerGuidance: p.mentorCareerGuidance || false,
        mentorHigherStudiesGuidance: p.mentorHigherStudiesGuidance || false,
        mentorExamPrepGuidance: p.mentorExamPrepGuidance || false,
        mentorEntrepreneurshipGuidance: p.mentorEntrepreneurshipGuidance || false,
        mentorInternshipGuidance: p.mentorInternshipGuidance || false,
      },
    });

    // Skills
    for (const name of (p.skills || [])) {
      await prisma.skill.create({ data: { alumniProfileId: alumniProfile.id, name } });
    }

    // Career entries
    for (const entry of (p.careerEntries || [])) {
      await prisma.careerJourneyEntry.create({
        data: { alumniProfileId: alumniProfile.id, ...entry },
      });
    }

    console.log(`✔ Alumni created: ${p.fullName} (${p.verificationStatus})`);
  }

  // ── 5. Students ──
  for (const s of STUDENTS) {
    const existing = await prisma.user.findFirst({ where: { email: s.user.email } });
    if (existing) { console.log(`⏭  Student already exists: ${s.user.username}`); continue; }

    const pw = await bcrypt.hash('Student123!', 10);
    const user = await prisma.user.create({
      data: { email: s.user.email, username: s.user.username, password: pw, role: 'STUDENT', isActive: true },
    });

    const p = s.profile;
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        fullName: p.fullName,
        registerNumber: p.registerNumber,
        departmentId: deptMap[p.department],
        currentYear: p.currentYear,
        email: p.email,
        careerInterest: p.careerInterest,
      },
    });
    console.log(`✔ Student created: ${p.fullName}`);
  }

  console.log('\n✅ All demo data seeded successfully!');
  console.log('\n── LOGIN CREDENTIALS ──────────────────────────────');
  console.log('Super Admin:  superadmin / ChangeMe123!');
  console.log('Staff Admins: csadmin / CsAdmin123!');
  console.log('              ecadmin / EcAdmin123!');
  console.log('              meadmin / MeAdmin123!');
  console.log('Alumni:       aarav.sharma / Alumni123!  (WORKING, VERIFIED)');
  console.log('              meera.nair   / Alumni123!  (HIGHER_EDUCATION, VERIFIED)');
  console.log('              rohit.singh  / Alumni123!  (EXAM_PREPARATION, PENDING)');
  console.log('              priya.menon  / Alumni123!  (OTHERS, REJECTED)');
  console.log('Students:     nisha.patel  / Student123!');
  console.log('              vikram.rao   / Student123!');
  console.log('───────────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
