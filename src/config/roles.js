const allRoles = {
  employee: ['viewOwnProfile', 'replyReview', 'reportReview'],
  employer: ['createReview', 'viewEmployees'],
  admin: ['getUsers', 'manageUsers', 'createReview', 'viewEmployees', 'manageReviews', 'reportReview'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  allRoles,
  roles,
  roleRights,
};
