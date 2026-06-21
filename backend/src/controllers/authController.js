const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// POST /api/auth/login
// Accepts either email or username in the "identifier" field
async function login(req, res) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    include: { department: true },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'This account has been deactivated. Contact the administrator.' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // For Alumni, block login until verified
  if (user.role === 'ALUMNI') {
    const profile = await prisma.alumniProfile.findUnique({ where: { userId: user.id } });
    if (profile && profile.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        message: `Your registration is currently ${profile.verificationStatus.toLowerCase()}. You can log in once a staff admin verifies your account.`,
        verificationStatus: profile.verificationStatus,
      });
    }
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      departmentId: user.departmentId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      department: user.department ? { id: user.department.id, name: user.department.name } : null,
    },
  });
}

module.exports = { login };
