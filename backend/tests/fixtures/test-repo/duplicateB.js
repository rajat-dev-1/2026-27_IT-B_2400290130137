// duplicateB.js — contains the same duplicated block as duplicateA.js
export function sanitizeUserData(user) {
  if (!user) return null;
  const name = user.name ? user.name.trim() : 'Unknown';
  const email = user.email ? user.email.toLowerCase() : '';
  const role = user.role || 'viewer';
  const isActive = user.active === true;
  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  return { name, email, role, isActive, createdAt };
}

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}
