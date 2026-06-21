const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

// POST /api/student/register
async function register(req, res) {
  const { fullName, registerNumber, departmentId, currentYear, email, username, password, confirmPassword } = req.body;

  const required = { fullName, registerNumber, departmentId, currentYear, email, username, password, confirmPassword };
  for (const [key, value] of Object.entries(required)) {
    if (!value) return res.status(400).json({ message: `${key} is required` });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
  if (!department) return res.status(400).json({ message: 'Invalid department' });

  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email or username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: 'STUDENT',
      departmentId: department.id,
      studentProfile: {
        create: {
          fullName,
          registerNumber,
          departmentId: department.id,
          currentYear,
          email,
        },
      },
    },
  });

  res.status(201).json({ message: 'Registration successful. You can now log in.' });
}

// GET /api/student/alumni/search
// Filters: department, batch, currentStatus, employmentSector, company (organizationName/institutionName), mentorAvailable
async function searchAlumni(req, res) {
  const { departmentId, batch, currentStatus, employmentSector, company, mentorAvailable } = req.query;

  const where = {
    verificationStatus: 'VERIFIED',
    profileVisibility: 'PUBLIC',
  };

  if (departmentId) where.departmentId = Number(departmentId);
  if (batch) where.batch = batch;
  if (currentStatus) where.currentStatus = currentStatus;
  if (employmentSector) where.employmentSector = employmentSector;

  // Each filter that needs an OR group is added as its own AND clause,
  // so multiple OR-based filters (company, mentorAvailable) combine correctly.
  const andConditions = [];

  if (company) {
    andConditions.push({
      OR: [
        { organizationName: { contains: company } },
        { institutionName: { contains: company } },
      ],
    });
  }

  if (mentorAvailable === 'true') {
    andConditions.push({
      OR: [
        { mentorCareerGuidance: true },
        { mentorHigherStudiesGuidance: true },
        { mentorExamPrepGuidance: true },
        { mentorEntrepreneurshipGuidance: true },
        { mentorInternshipGuidance: true },
      ],
    });
  }

  if (andConditions.length) where.AND = andConditions;

  const alumni = await prisma.alumniProfile.findMany({
    where,
    include: { department: true, skills: true },
    orderBy: { fullName: 'asc' },
  });

  res.json(alumni.map(toPublicAlumni));
}

// GET /api/student/alumni/:id
async function getAlumniProfile(req, res) {
  const profile = await prisma.alumniProfile.findUnique({
    where: { id: Number(req.params.id) },
    include: { department: true, skills: true, careerEntries: true },
  });

  if (!profile || profile.verificationStatus !== 'VERIFIED' || profile.profileVisibility !== 'PUBLIC') {
    return res.status(404).json({ message: 'Alumni profile not found' });
  }

  res.json(toPublicAlumni(profile, true));
}

// Strips private fields (mobile, email, internal notes) from an AlumniProfile
function toPublicAlumni(profile, includeCareer = false) {
  const mentorAvailable =
    profile.mentorCareerGuidance ||
    profile.mentorHigherStudiesGuidance ||
    profile.mentorExamPrepGuidance ||
    profile.mentorEntrepreneurshipGuidance ||
    profile.mentorInternshipGuidance;

  const base = {
    id: profile.id,
    fullName: profile.fullName,
    batch: profile.batch,
    department: profile.department ? { id: profile.department.id, name: profile.department.name } : null,
    degree: profile.degree,
    currentStatus: profile.currentStatus,
    organizationName: profile.organizationName,
    designation: profile.designation,
    institutionName: profile.institutionName,
    degreePursuing: profile.degreePursuing,
    examName: profile.examName,
    activityName: profile.activityName,
    employmentSector: profile.employmentSector,
    skills: profile.skills?.map((s) => s.name) || [],
    linkedin: profile.linkedin,
    portfolio: profile.portfolio,
    website: profile.website,
    mentorAvailable,
    mentorshipAreas: {
      careerGuidance: profile.mentorCareerGuidance,
      higherStudiesGuidance: profile.mentorHigherStudiesGuidance,
      examPrepGuidance: profile.mentorExamPrepGuidance,
      entrepreneurshipGuidance: profile.mentorEntrepreneurshipGuidance,
      internshipGuidance: profile.mentorInternshipGuidance,
    },
  };

  if (includeCareer) {
    base.careerEntries = profile.careerEntries;
  }

  return base;
}

// GET /api/student/me
async function getMyProfile(req, res) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
    include: { department: true },
  });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}

// PATCH /api/student/me — currently supports updating careerInterest
async function updateMyProfile(req, res) {
  const { careerInterest } = req.body;
  const data = {};
  if (careerInterest !== undefined) data.careerInterest = careerInterest;

  const profile = await prisma.studentProfile.update({
    where: { userId: req.user.id },
    data,
  });
  res.json(profile);
}

// GET /api/student/mentor-matches?careerInterest=...
// Phase 1+ "Smart Mentor Match" — lightweight rule-based suggestions.
// No ML: scores verified+public alumni by department overlap and
// career-interest keyword overlap against their role/organization/skills.
async function getMentorMatches(req, res) {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
    include: { department: true },
  });
  if (!studentProfile) return res.status(404).json({ message: 'Profile not found' });

  const careerInterest = (req.query.careerInterest ?? studentProfile.careerInterest ?? '').trim();

  const candidates = await prisma.alumniProfile.findMany({
    where: { verificationStatus: 'VERIFIED', profileVisibility: 'PUBLIC' },
    include: { department: true, skills: true },
  });

  const interestTerms = careerInterest
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length > 1);

  const scored = candidates.map((alumni) => {
    let score = 0;
    const reasons = [];

    // Department overlap
    if (alumni.departmentId === studentProfile.departmentId) {
      score += 2;
      reasons.push(`Same department (${alumni.department?.name})`);
    }

    // Career interest keyword overlap — checked against role/org/industry fields and skills
    if (interestTerms.length) {
      const haystack = [
        alumni.employmentSector,
        alumni.organizationName,
        alumni.designation,
        alumni.institutionName,
        alumni.degreePursuing,
        alumni.examName,
        alumni.activityName,
        ...alumni.skills.map((s) => s.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchedTerms = interestTerms.filter((term) => haystack.includes(term));
      if (matchedTerms.length) {
        score += 2 * matchedTerms.length;
        reasons.push(`Matches your interest in "${matchedTerms.join(', ')}"`);
      }
    }

    // Mentor availability bonus
    const mentorAvailable =
      alumni.mentorCareerGuidance ||
      alumni.mentorHigherStudiesGuidance ||
      alumni.mentorExamPrepGuidance ||
      alumni.mentorEntrepreneurshipGuidance ||
      alumni.mentorInternshipGuidance;

    if (mentorAvailable) {
      score += 1;
      reasons.push('Open to mentoring');
    }

    return { alumni, score, reasons, mentorAvailable };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ alumni, score, reasons, mentorAvailable }) => ({
      ...toPublicAlumni(alumni),
      matchScore: score,
      matchReasons: reasons,
      mentorAvailable,
    }));

  res.json({
    careerInterest,
    department: studentProfile.department,
    matches,
  });
}

module.exports = { register, searchAlumni, getAlumniProfile, getMyProfile, updateMyProfile, getMentorMatches };
