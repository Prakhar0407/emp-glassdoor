const allRoles = {
  employee: ['viewOwnProfile', 'replyReview', 'reportReview', 'getNotifications', 'raiseConcern'],
  employer: ['createReview', 'viewEmployees', 'getNotifications', 'markNotification', 'replyConcern'],
  admin: [
    'getUsers',
    'manageUsers',
    'createReview',
    'viewEmployees',
    'manageReviews',
    'reportReview',
    'raiseConcern',
    'replyConcern',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  allRoles,
  roles,
  roleRights,
};
