const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const passport = require('passport');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

// JWT Strategy setup
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) return done(null, false);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
passport.use('jwt', jwtStrategy);

// LinkedIn Strategy setup
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ['openid', 'profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userInfoRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userInfo = userInfoRes.data;

        const email = userInfo.email;
        const name = userInfo.name || userInfo.given_name + ' ' + userInfo.family_name;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            password: 'linkedin_dummy_password',
            role: 'employee',
            isEmailVerified: true,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = {
  jwtStrategy,
};
