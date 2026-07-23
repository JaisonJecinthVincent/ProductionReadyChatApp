import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// Trim whitespace/newlines from env vars (common copy-paste issue)
const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const googleCallbackUrl = (process.env.GOOGLE_CALLBACK_URL || '').trim();

console.log(`🔍 GOOGLE_CLIENT_ID length: ${googleClientId.length}, starts with: ${googleClientId.substring(0, 10)}...`);
console.log(`🔍 GOOGLE_CLIENT_SECRET length: ${googleClientSecret.length}, starts with: ${googleClientSecret.substring(0, 6)}...`);
console.log(`🔍 GOOGLE_CALLBACK_URL: ${googleCallbackUrl}`);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to create or update user
const createOrUpdateUser = async (profile, provider, accessToken, refreshToken) => {
  try {
    const providerData = {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.name || profile.username,
    };

    // Add provider-specific data
    switch (provider) {
      case 'google':
        providerData.picture = profile.photos?.[0]?.value;
        break;
      case 'github':
        providerData.username = profile.username;
        providerData.avatar_url = profile.photos?.[0]?.value;
        break;
      case 'facebook':
        providerData.picture = profile.photos?.[0]?.value;
        break;
      case 'twitter':
        providerData.username = profile.username;
        providerData.profile_image_url = profile.photos?.[0]?.value;
        break;
      case 'linkedin':
        providerData.picture = profile.photos?.[0]?.value;
        break;
    }

    // Check if user exists with this provider
    const existingUser = await User.findOne({
      [`oauthProviders.${provider}.id`]: profile.id
    });

    if (existingUser) {
      // Update existing user
      existingUser.oauthProviders[provider] = providerData;
      existingUser.lastLogin = new Date();
      existingUser.loginCount += 1;
      await existingUser.save();
      return existingUser;
    }

    // Check if user exists with same email
    const emailUser = await User.findOne({ email: providerData.email });
    if (emailUser) {
      // Link OAuth provider to existing account
      emailUser.oauthProviders[provider] = providerData;
      emailUser.lastLogin = new Date();
      emailUser.loginCount += 1;
      await emailUser.save();
      return emailUser;
    }

    // Create new user
    const newUser = new User({
      email: providerData.email,
      fullName: providerData.name,
      profilePic: providerData.picture || "",
      oauthProviders: {
        [provider]: providerData
      },
      isEmailVerified: true, // OAuth emails are considered verified
      lastLogin: new Date(),
      loginCount: 1,
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

// Google OAuth Strategy - only initialize if credentials are provided
if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl || "/api/auth/oauth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await createOrUpdateUser(profile, 'google', accessToken, refreshToken);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
  console.log('✅ Google OAuth strategy initialized');
} else {
  console.log('⚠️  Google OAuth disabled (GOOGLE_CLIENT_ID/SECRET not set)');
}

// Commented out other strategies for now
// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback"
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const user = await createOrUpdateUser(profile, 'github', accessToken, refreshToken);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// }));

// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/api/auth/facebook/callback",
//   profileFields: ['id', 'emails', 'name', 'picture']
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const user = await createOrUpdateUser(profile, 'facebook', accessToken, refreshToken);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// }));

// passport.use(new TwitterStrategy({
//   consumerKey: process.env.TWITTER_CONSUMER_KEY,
//   consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//   callbackURL: process.env.TWITTER_CALLBACK_URL || "/api/auth/twitter/callback"
// }, (token, tokenSecret, profile, done) => {
//   try {
//     const user = await createOrUpdateUser(profile, 'twitter', token, tokenSecret);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// }));

// passport.use(new LinkedInStrategy({
//   clientID: process.env.LINKEDIN_CLIENT_ID,
//   clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
//   callbackURL: process.env.LINKEDIN_CALLBACK_URL || "/api/auth/linkedin/callback",
//   scope: ['r_emailaddress', 'r_liteprofile']
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const user = await createOrUpdateUser(profile, 'linkedin', accessToken, refreshToken);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// }));

export default passport;



