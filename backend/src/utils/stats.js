const prisma = require('./prisma');

// Builds the analytics payload used by both Super Admin (college-wide)
// and Staff Admin (department-scoped) dashboards.
// `departmentId` — pass a number to scope to one department, or null for college-wide.
async function getAlumniAnalytics(departmentId = null) {
  const baseWhere = departmentId ? { departmentId } : {};

  const [total, verified, pending, rejected] = await Promise.all([
    prisma.alumniProfile.count({ where: baseWhere }),
    prisma.alumniProfile.count({ where: { ...baseWhere, verificationStatus: 'VERIFIED' } }),
    prisma.alumniProfile.count({ where: { ...baseWhere, verificationStatus: 'PENDING' } }),
    prisma.alumniProfile.count({ where: { ...baseWhere, verificationStatus: 'REJECTED' } }),
  ]);

  const activeMentors = await prisma.alumniProfile.count({
    where: {
      ...baseWhere,
      verificationStatus: 'VERIFIED',
      OR: [
        { mentorCareerGuidance: true },
        { mentorHigherStudiesGuidance: true },
        { mentorExamPrepGuidance: true },
        { mentorEntrepreneurshipGuidance: true },
        { mentorInternshipGuidance: true },
      ],
    },
  });

  const byBatchRaw = await prisma.alumniProfile.groupBy({
    by: ['batch'],
    where: { ...baseWhere, verificationStatus: 'VERIFIED' },
    _count: { _all: true },
  });

  const byCareerStatusRaw = await prisma.alumniProfile.groupBy({
    by: ['currentStatus'],
    where: { ...baseWhere, verificationStatus: 'VERIFIED' },
    _count: { _all: true },
  });

  const bySectorRaw = await prisma.alumniProfile.groupBy({
    by: ['employmentSector'],
    where: { ...baseWhere, verificationStatus: 'VERIFIED', currentStatus: 'WORKING' },
    _count: { _all: true },
  });

  const result = {
    totalAlumni: total,
    verifiedAlumni: verified,
    pendingAlumni: pending,
    rejectedAlumni: rejected,
    activeMentors,
    alumniByBatch: byBatchRaw.map((r) => ({ batch: r.batch, count: r._count._all })),
    careerStatusDistribution: byCareerStatusRaw.map((r) => ({ status: r.currentStatus, count: r._count._all })),
    employmentSectorDistribution: bySectorRaw
      .filter((r) => r.employmentSector)
      .map((r) => ({ sector: r.employmentSector, count: r._count._all })),
  };

  // College-wide dashboard additionally includes department breakdown + totals
  if (!departmentId) {
    const byDepartmentRaw = await prisma.alumniProfile.groupBy({
      by: ['departmentId'],
      where: { verificationStatus: 'VERIFIED' },
      _count: { _all: true },
    });

    const departments = await prisma.department.findMany();
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    result.alumniByDepartment = byDepartmentRaw.map((r) => ({
      department: deptMap.get(r.departmentId) || 'Unknown',
      count: r._count._all,
    }));

    result.totalDepartments = departments.length;
    result.totalStudents = await prisma.studentProfile.count();
  }

  return result;
}

module.exports = { getAlumniAnalytics };
