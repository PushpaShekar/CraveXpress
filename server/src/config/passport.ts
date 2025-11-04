import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';
import { UserRole } from '../../../types';

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy (optional - only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if user exists with same email
            user = await User.findOne({ email: profile.emails?.[0].value });

            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              if (!user.avatar && profile.photos?.[0].value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
            } else {
              // Create new user
              user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0].value,
                avatar: profile.photos?.[0].value,
                role: UserRole.CUSTOMER,
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
  console.log('✓ Google OAuth configured');
} else {
  console.log('⚠ Google OAuth not configured (credentials missing)');
}

export default passport;

