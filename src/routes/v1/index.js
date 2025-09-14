const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const reviewRoute = require('./review.route');
const linkedinRoute = require('./linkedin.route');
const employeeRoute = require('./employee.route');
const employerRoute = require('./employer.route');
const adminRoute = require('./admin.route');
const notificationRoute = require('./notification.route');
const uploadRoute = require('./upload.route');

const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/employer',
    route: employerRoute,
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
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/upload',
    route: uploadRoute,
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

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
