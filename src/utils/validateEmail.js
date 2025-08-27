const blockedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'rediffmail.com'];

function isOfficialEmail(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].toLowerCase();

  // block personal domains
  if (blockedDomains.includes(domain)) return false;

  // block academic domains
  if (domain.endsWith('.ac.in') || domain.endsWith('.edu') || domain.endsWith('.edu.in')) {
    return false;
  }

  return true;
}

module.exports = { isOfficialEmail };
