const allRoles = {
  employee: ['viewOwnProfile', 'replyReview', 'reportReview'],
  employer: ['createReview', 'viewEmployees'],
  admin: ['getUsers', 'manageUsers', 'createReview', 'viewEmployees', 'manageReviews'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
