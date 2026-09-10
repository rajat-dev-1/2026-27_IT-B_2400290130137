// duplicateA.js — contains duplicated block that also appears in duplicateB.js
export function processUserData(user) {
  if (!user) return null;
  const name = user.name ? user.name.trim() : 'Unknown';
  const email = user.email ? user.email.toLowerCase() : '';
  const role = user.role || 'viewer';
  const isActive = user.active === true;
  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  return { name, email, role, isActive, createdAt };
}

export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
