const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const CURRENT_STATUSES = ['WORKING', 'HIGHER_EDUCATION', 'EXAM_PREPARATION', 'OTHERS'];
const DEGREES = ['UG', 'PG', 'MPHIL', 'PHD'];

// POST /api/alumni/register
async function register(req, res) {
  const {
    fullName,
    registerNumber,
    batch,
    departmentId,
    degree,
    mobile,
    email,
    currentStatus,
    username,
    password,
    confirmPassword,

    // Working
    employmentSector,
    organizationName,
    designation,
    location,
    otherSectorDetails,

    // Higher Education
    institutionName,
    degreePursuing,
    specialization,
    startYear,
    expectedCompletionYear,

    // Exam Preparation
    examName,
    preparationType,
    examInstitutionName,
    examStartYear,
    expectedExamYear,

    // Others
    activityName,
    description,
  } = req.body;

  // --- Basic validation ---
  const required = { fullName, registerNumber, batch, departmentId, degree, mobile, email, currentStatus, username, password, confirmPassword };
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      return res.status(400).json({ message: `${key} is required` });
    }
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (!DEGREES.includes(degree)) {
    return res.status(400).json({ message: 'Invalid degree' });
  }

  if (!CURRENT_STATUSES.includes(currentStatus)) {
    return res.status(400).json({ message: 'Invalid current status' });
  }

  const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
  if (!department) {
    return res.status(400).json({ message: 'Invalid department' });
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email or username already exists' });
  }

  // --- Conditional field validation ---
  if (currentStatus === 'WORKING') {
    if (!employmentSector || !organizationName || !designation) {
      return res.status(400).json({ message: 'Employment sector, organization name and designation are required for Working status' });
    }
  } else if (currentStatus === 'HIGHER_EDUCATION') {
    if (!institutionName || !degreePursuing || !startYear || !expectedCompletionYear) {
      return res.status(400).json({ message: 'Institution, degree pursuing, start year and expected completion year are required for Higher Education status' });
    }
  } else if (currentStatus === 'EXAM_PREPARATION') {
    if (!examName || !examStartYear || !expectedExamYear) {
      return res.status(400).json({ message: 'Exam name, start year and expected exam year are required for Exam Preparation status' });
    }
  } else if (currentStatus === 'OTHERS') {
    if (!activityName || !description) {
      return res.status(400).json({ message: 'Activity name and description are required for Others status' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: 'ALUMNI',
      departmentId: department.id,
      alumniProfile: {
        create: {
          fullName,
          registerNumber,
          batch,
          departmentId: department.id,
          degree,
          mobile,
          email,
          currentStatus,
          verificationStatus: 'PENDING',

          employmentSector: currentStatus === 'WORKING' ? employmentSector : null,
          organizationName: currentStatus === 'WORKING' ? organizationName : null,
          designation: currentStatus === 'WORKING' ? designation : null,
          location: currentStatus === 'WORKING' ? location : null,
          otherSectorDetails: currentStatus === 'WORKING' && employmentSector === 'Other' ? otherSectorDetails : null,

          institutionName: currentStatus === 'HIGHER_EDUCATION' ? institutionName : null,
          degreePursuing: currentStatus === 'HIGHER_EDUCATION' ? degreePursuing : null,
          specialization: currentStatus === 'HIGHER_EDUCATION' ? specialization : null,
          startYear: currentStatus === 'HIGHER_EDUCATION' ? startYear : null,
          expectedCompletionYear: currentStatus === 'HIGHER_EDUCATION' ? expectedCompletionYear : null,

          examName: currentStatus === 'EXAM_PREPARATION' ? examName : null,
          preparationType: currentStatus === 'EXAM_PREPARATION' ? preparationType : null,
          examInstitutionName: currentStatus === 'EXAM_PREPARATION' ? examInstitutionName : null,
          examStartYear: currentStatus === 'EXAM_PREPARATION' ? examStartYear : null,
          expectedExamYear: currentStatus === 'EXAM_PREPARATION' ? expectedExamYear : null,

          activityName: currentStatus === 'OTHERS' ? activityName : null,
          description: currentStatus === 'OTHERS' ? description : null,
        },
      },
    },
    include: { alumniProfile: true },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role, username: user.username, departmentId: user.departmentId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'Registration successful. Your account is pending verification by a staff admin.',
    status: user.alumniProfile.verificationStatus,
    token,
  });
}

// GET /api/alumni/me
async function getMyProfile(req, res) {
  const profile = await prisma.alumniProfile.findUnique({
    where: { userId: req.user.id },
    include: { department: true, careerEntries: true, skills: true },
  });

  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

// PATCH /api/alumni/me — onboarding updates (social links, mentorship prefs, visibility)
async function updateMyProfile(req, res) {
  const {
    linkedin,
    portfolio,
    website,
    mentorCareerGuidance,
    mentorHigherStudiesGuidance,
    mentorExamPrepGuidance,
    mentorEntrepreneurshipGuidance,
    mentorInternshipGuidance,
    profileVisibility,
  } = req.body;

  const data = {};
  if (linkedin !== undefined) data.linkedin = linkedin;
  if (portfolio !== undefined) data.portfolio = portfolio;
  if (website !== undefined) data.website = website;
  if (mentorCareerGuidance !== undefined) data.mentorCareerGuidance = !!mentorCareerGuidance;
  if (mentorHigherStudiesGuidance !== undefined) data.mentorHigherStudiesGuidance = !!mentorHigherStudiesGuidance;
  if (mentorExamPrepGuidance !== undefined) data.mentorExamPrepGuidance = !!mentorExamPrepGuidance;
  if (mentorEntrepreneurshipGuidance !== undefined) data.mentorEntrepreneurshipGuidance = !!mentorEntrepreneurshipGuidance;
  if (mentorInternshipGuidance !== undefined) data.mentorInternshipGuidance = !!mentorInternshipGuidance;
  if (profileVisibility !== undefined) {
    if (!['PUBLIC', 'PRIVATE'].includes(profileVisibility)) {
      return res.status(400).json({ message: 'Invalid profile visibility value' });
    }
    data.profileVisibility = profileVisibility;
  }

  const profile = await prisma.alumniProfile.update({
    where: { userId: req.user.id },
    data,
  });

  res.json(profile);
}

// PATCH /api/alumni/me/basic-info — editable basic info + address
async function updateBasicInfo(req, res) {
  const ALLOWED = [
    'fullName', 'mobile', 'email', 'batch',
    'degreeType', 'degreeCustomName', 'degreeSpecialization', 'degreeInstitution',
    'dateOfBirth',
    'addressLine1', 'addressLine2', 'city', 'district', 'state', 'country', 'pinCode',
  ];

  const data = {};
  for (const field of ALLOWED) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  // Department update — validate if provided
  if (req.body.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: Number(req.body.departmentId) } });
    if (!dept) return res.status(400).json({ message: 'Invalid department' });
    data.departmentId = dept.id;
    // Also update the user's departmentId
    await prisma.user.update({ where: { id: req.user.id }, data: { departmentId: dept.id } });
  }

  const profile = await prisma.alumniProfile.update({
    where: { userId: req.user.id },
    data,
    include: { department: true },
  });

  res.json(profile);
}

// PATCH /api/alumni/me/current-status — update current status + position details
async function updateCurrentStatus(req, res) {
  const VALID_STATUSES = ['WORKING', 'HIGHER_EDUCATION', 'ENTREPRENEURSHIP', 'EXAM_PREPARATION', 'OTHERS'];

  const { currentStatus } = req.body;
  if (currentStatus && !VALID_STATUSES.includes(currentStatus)) {
    return res.status(400).json({ message: 'Invalid current status' });
  }

  const ALLOWED = [
    'currentStatus',
    // Working / current position
    'employmentSector', 'employmentType', 'organizationName', 'designation',
    'location', 'salaryPackage', 'otherSectorDetails',
    // Higher Education
    'institutionName', 'degreePursuing', 'specialization', 'startYear', 'expectedCompletionYear',
    // Entrepreneurship (reuse existing fields)
    'businessName', 'industry', 'founderRole',
    // Exam Prep
    'examName', 'preparationType', 'examInstitutionName', 'examStartYear', 'expectedExamYear',
    // Others
    'activityName', 'description',
  ];

  const data = {};
  for (const field of ALLOWED) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const profile = await prisma.alumniProfile.update({
    where: { userId: req.user.id },
    data,
    include: { department: true, careerEntries: true, skills: true, proofDocuments: true },
  });

  res.json(profile);
}

// --- Career Journey Entries ---

const ENTRY_TYPES = ['WORKING', 'HIGHER_EDUCATION', 'ENTREPRENEURSHIP', 'EXAM_PREPARATION', 'OTHER'];

// POST /api/alumni/me/career-entries
async function addCareerEntry(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const { type } = req.body;
  if (!ENTRY_TYPES.includes(type)) {
    return res.status(400).json({ message: 'Invalid career entry type' });
  }

  const entry = await prisma.careerJourneyEntry.create({
    data: {
      alumniProfileId: profile.id,
      type,
      employmentSector: req.body.employmentSector || null,
      employmentType: req.body.employmentType || null,
      organizationName: req.body.organizationName || null,
      designation: req.body.designation || null,
      location: req.body.location || null,
      salaryPackage: req.body.salaryPackage || null,
      institutionName: req.body.institutionName || null,
      degree: req.body.degree || null,
      degreeType: req.body.degreeType || null,
      specialization: req.body.specialization || null,
      startYear: req.body.startYear || null,
      endYear: req.body.endYear || null,
      businessName: req.body.businessName || null,
      industry: req.body.industry || null,
      founderRole: req.body.founderRole || null,
      examName: req.body.examName || null,
      preparationType: req.body.preparationType || null,
      examInstitution: req.body.examInstitution || null,
      activityName: req.body.activityName || null,
      description: req.body.description || null,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      currentlyActive: !!req.body.currentlyActive,
    },
  });

  res.status(201).json(entry);
}

// PATCH /api/alumni/me/career-entries/:id
async function updateCareerEntry(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const entry = await prisma.careerJourneyEntry.findUnique({ where: { id: Number(req.params.id) } });
  if (!entry || entry.alumniProfileId !== profile.id) {
    return res.status(404).json({ message: 'Career entry not found' });
  }

  const allowedFields = [
    'employmentSector', 'employmentType', 'organizationName', 'designation', 'location', 'salaryPackage',
    'institutionName', 'degree', 'degreeType', 'specialization', 'startYear', 'endYear',
    'businessName', 'industry', 'founderRole',
    'examName', 'preparationType', 'examInstitution',
    'activityName', 'description', 'startDate', 'endDate', 'currentlyActive',
  ];
  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const updated = await prisma.careerJourneyEntry.update({ where: { id: entry.id }, data });
  res.json(updated);
}

// DELETE /api/alumni/me/career-entries/:id
async function deleteCareerEntry(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const entry = await prisma.careerJourneyEntry.findUnique({ where: { id: Number(req.params.id) } });
  if (!entry || entry.alumniProfileId !== profile.id) {
    return res.status(404).json({ message: 'Career entry not found' });
  }

  await prisma.careerJourneyEntry.delete({ where: { id: entry.id } });
  res.status(204).send();
}

// --- Skills ---

// POST /api/alumni/me/skills  { name } or { names: [...] }
async function addSkill(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const names = req.body.names || (req.body.name ? [req.body.name] : []);
  if (!names.length) return res.status(400).json({ message: 'At least one skill name is required' });

  const created = await prisma.$transaction(
    names.map((name) =>
      prisma.skill.create({ data: { alumniProfileId: profile.id, name: String(name).trim() } })
    )
  );

  res.status(201).json(created);
}

// DELETE /api/alumni/me/skills/:id
async function deleteSkill(req, res) {
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const skill = await prisma.skill.findUnique({ where: { id: Number(req.params.id) } });
  if (!skill || skill.alumniProfileId !== profile.id) {
    return res.status(404).json({ message: 'Skill not found' });
  }

  await prisma.skill.delete({ where: { id: skill.id } });
  res.status(204).send();
}

module.exports = {
  register,
  getMyProfile,
  updateMyProfile,
  updateBasicInfo,
  updateCurrentStatus,
  addCareerEntry,
  updateCareerEntry,
  deleteCareerEntry,
  addSkill,
  deleteSkill,
};
