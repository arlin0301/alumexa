require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
];

const STAFF_ADMINS = [
  { email: 'cs_admin@alumexa.com', username: 'csadmin', password: 'CsAdmin123!', department: 'Computer Science' },
  { email: 'ec_admin@alumexa.com', username: 'ecadmin', password: 'EcAdmin123!', department: 'Electronics & Communication' },
  { email: 'me_admin@alumexa.com', username: 'meadmin', password: 'MeAdmin123!', department: 'Mechanical Engineering' },
];

const ALUMNI = [
  {
    fullName: 'Aarav Sharma',
    registerNumber: 'CS2021001',
    batch: '2021',
    department: 'Computer Science',
    degree: 'UG',
    mobile: '9880012345',
    email: 'aarav.sharma@example.com',
    currentStatus: 'WORKING',
    employmentSector: 'Information Technology',
    employmentType: 'PRIVATE',
    organizationName: 'Zenith Solutions',
    designation: 'Software Engineer',
    location: 'Bengaluru',
    salaryPackage: '12 LPA',
    mentorCareerGuidance: true,
    profileVisibility: 'PUBLIC',
    linkedin: 'https://linkedin.com/in/aaravsharma',
    portfolio: 'https://aaravsharma.dev',
  },
  {
    fullName: 'Meera Nair',
    registerNumber: 'EC2021002',
    batch: '2021',
    department: 'Electronics & Communication',
    degree: 'UG',
    mobile: '9960012345',
    email: 'meera.nair@example.com',
    currentStatus: 'HIGHER_EDUCATION',
    institutionName: 'IIT Madras',
    degreePursuing: 'M.Tech',
    specialization: 'VLSI Design',
    startYear: '2023',
    expectedCompletionYear: '2025',
    mentorHigherStudiesGuidance: true,
    profileVisibility: 'PUBLIC',
  },
  {
    fullName: 'Rohit Singh',
    registerNumber: 'ME2021003',
    batch: '2021',
    department: 'Mechanical Engineering',
    degree: 'UG',
    mobile: '9850012345',
    email: 'rohit.singh@example.com',
    currentStatus: 'EXAM_PREPARATION',
    examName: 'GATE',
    preparationType: 'Coaching',
    examInstitutionName: 'Prime Institute',
    examStartYear: '2024',
    expectedExamYear: '2025',
    mentorExamPrepGuidance: true,
    profileVisibility: 'PUBLIC',
  },
];

const STUDENTS = [
  {
    fullName: 'Nisha Patel',
    registerNumber: 'ST2024001',
    department: 'Computer Science',
    currentYear: '2nd Year',
    email: 'nisha.patel@student.alumexa.com',
    careerInterest: 'Software development and mentorship',
  },
  {
    fullName: 'Vikram Rao',
    registerNumber: 'ST2024002',
    department: 'Electronics & Communication',
    currentYear: '3rd Year',
    email: 'vikram.rao@student.alumexa.com',
    careerInterest: 'VLSI and semiconductor design',
  },
];

async function createSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@alumexa.com';
  const username = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    console.log('Super Admin account already exists — skipping Super Admin seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, username, password: hashedPassword, role: 'SUPER_ADMIN', isActive: true } });
  console.log('Super Admin account created:');
  console.log(`  Email:    ${email}`);
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
}

async function seedDemoData() {
  const departmentRecords = {};
  for (const name of DEPARTMENTS) {
    const department = await prisma.department.create({ data: { name } });
    departmentRecords[name] = department.id;
  }

  for (const staff of STAFF_ADMINS) {
    const hashedPassword = await bcrypt.hash(staff.password, 10);
    await prisma.user.create({
      data: {
        email: staff.email,
        username: staff.username,
        password: hashedPassword,
        role: 'STAFF_ADMIN',
        departmentId: departmentRecords[staff.department],
        isActive: true,
      },
    });
  }

  for (const alumni of ALUMNI) {
    const user = await prisma.user.create({
      data: {
        email: alumni.email,
        username: alumni.email.split('@')[0],
        password: await bcrypt.hash('Alumni123!', 10),
        role: 'ALUMNI',
        isActive: true,
      },
    });

    await prisma.alumniProfile.create({
      data: {
        userId: user.id,
        fullName: alumni.fullName,
        registerNumber: alumni.registerNumber,
        batch: alumni.batch,
        departmentId: departmentRecords[alumni.department],
        degree: alumni.degree,
        mobile: alumni.mobile,
        email: alumni.email,
        currentStatus: alumni.currentStatus,
        employmentSector: alumni.employmentSector,
        employmentType: alumni.employmentType,
        organizationName: alumni.organizationName,
        designation: alumni.designation,
        location: alumni.location,
        salaryPackage: alumni.salaryPackage,
        institutionName: alumni.institutionName,
        degreePursuing: alumni.degreePursuing,
        specialization: alumni.specialization,
        startYear: alumni.startYear,
        expectedCompletionYear: alumni.expectedCompletionYear,
        examName: alumni.examName,
        preparationType: alumni.preparationType,
        examInstitutionName: alumni.examInstitutionName,
        examStartYear: alumni.examStartYear,
        expectedExamYear: alumni.expectedExamYear,
        mentorCareerGuidance: alumni.mentorCareerGuidance || false,
        mentorHigherStudiesGuidance: alumni.mentorHigherStudiesGuidance || false,
        mentorExamPrepGuidance: alumni.mentorExamPrepGuidance || false,
        mentorEntrepreneurshipGuidance: alumni.mentorEntrepreneurshipGuidance || false,
        mentorInternshipGuidance: alumni.mentorInternshipGuidance || false,
        profileVisibility: alumni.profileVisibility,
        linkedin: alumni.linkedin,
        portfolio: alumni.portfolio,
      },
    });
  }

  for (const student of STUDENTS) {
    const user = await prisma.user.create({
      data: {
        email: student.email,
        username: student.email.split('@')[0],
        password: await bcrypt.hash('Student123!', 10),
        role: 'STUDENT',
        isActive: true,
      },
    });

    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        fullName: student.fullName,
        registerNumber: student.registerNumber,
        departmentId: departmentRecords[student.department],
        currentYear: student.currentYear,
        email: student.email,
        careerInterest: student.careerInterest,
      },
    });
  }

  console.log('Demo departments, staff admins, alumni, and students created.');
}

async function main() {
  await createSuperAdmin();

  if (process.argv.includes('--demo')) {
    console.log('Seeding demo data...');
    await seedDemoData();
    console.log('Demo data seeding complete.');
  } else {
    console.log('Seed complete. Run `npm run seed:demo` to add sample demo data.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
