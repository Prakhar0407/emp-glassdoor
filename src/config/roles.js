const allRoles = {
  employee: ['viewOwnProfile', 'replyReview', 'reportReview'],
  employer: ['createReview', 'createReview', 'viewEmployees'],
  admin: ['getUsers', 'manageUsers', 'createReview', 'viewEmployees', 'manageReviews'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  allRoles,
  roles,
  roleRights,
};
