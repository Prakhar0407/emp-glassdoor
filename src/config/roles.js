const allRoles = {
  employee: ['viewOwnProfile', 'replyReview', 'reportReview', 'getNotifications'],
  employer: ['createReview', 'viewEmployees', 'getNotifications', 'markNotification'],
  admin: ['getUsers', 'manageUsers', 'createReview', 'viewEmployees', 'manageReviews', 'reportReview'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  allRoles,
  roles,
  roleRights,
};
