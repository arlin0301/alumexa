const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

// PATCH /api/*/account/password
async function changePassword(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All password fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
  res.json({ message: 'Password updated successfully' });
}

// PATCH /api/*/account/username
async function changeUsername(req, res) {
  const { username } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing && existing.id !== req.user.id) {
    return res.status(409).json({ message: 'Username is already taken' });
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { username: username.trim() },
  });
  res.json({ message: 'Username updated successfully', username: updated.username });
}

// PATCH /api/staff-admin/account/email  (staff only)
async function changeEmail(req, res) {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing && existing.id !== req.user.id) {
    return res.status(409).json({ message: 'Email is already in use' });
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { email: email.trim() },
  });
  res.json({ message: 'Email updated successfully', email: updated.email });
}

module.exports = { changePassword, changeUsername, changeEmail };
