const prisma = require('../utils/prisma');

// GET /api/departments — public, used by registration forms and filters
async function listDepartments(req, res) {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  res.json(departments);
}

// POST /api/super-admin/departments
async function createDepartment(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  const existing = await prisma.department.findUnique({ where: { name: name.trim() } });
  if (existing) {
    return res.status(409).json({ message: 'A department with this name already exists' });
  }

  const department = await prisma.department.create({ data: { name: name.trim() } });
  res.status(201).json(department);
}

module.exports = { listDepartments, createDepartment };
