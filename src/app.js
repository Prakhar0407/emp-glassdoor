const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

require('./config/passport'); // this should include your LinkedIn strategy

const app = express();

// Middlewares
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Routes
app.use('/v1', routes);

// Serve static files if local storage
if (process.env.STORAGE_TYPE === 'local') {
  app.use('/uploads', express.static('uploads'));
}

// Error Handling
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
