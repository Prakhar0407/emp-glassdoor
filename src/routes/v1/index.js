const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const reviewRoute = require('./review.route');
const linkedinRoute = require('./linkedin.route');
const employeeRoute = require('./employee.route');
const employerAuthRoute = require('./employerAuth.route');
const adminRoute = require('./admin.route');

const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/employer-auth',
    route: employerAuthRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/reviews',
    route: reviewRoute,
  },
  {
    path: '/employees',
    route: employeeRoute,
  },
  {
    path: '/auth/linkedin',
    route: authRoute,
  },
  {
    path: '/linkedin',
    route: linkedinRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
