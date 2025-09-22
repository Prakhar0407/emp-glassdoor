const blockedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'rediffmail.com'];

function normalizeDomain(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
}

function isOfficialEmail(email, website) {
  if (!email || !email.includes('@') || !website) return false;

  const emailDomain = email.split('@')[1].toLowerCase();
  const siteDomain = normalizeDomain(website);

  // block personal domains
  if (blockedDomains.includes(emailDomain)) return false;

  // block academic domains
  if (emailDomain.endsWith('.ac.in') || emailDomain.endsWith('.edu') || emailDomain.endsWith('.edu.in')) {
    return false;
  }

  // email domain matches or contains website domain
  if (!(emailDomain === siteDomain || emailDomain.endsWith(`.${siteDomain}`))) {
    return false;
  }

  return true;
}

module.exports = { isOfficialEmail };
