/**
 * Created by Lazarus of Bethany on 04/05/2017.
 */
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');
module.exports = function(passport) {


    passport.serializeUser(function (user, done) {
        done(null, user);
    });
// used to deserialize the user
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    passport.use(new FacebookStrategy({

        clientID : configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: configAuth.facebookAuth.profileFields
    },

        myFacebookStrategy)
    );
}
function myFacebookStrategy(token, refreshToken, profile, done) {
    process.nextTick(function() {
//Save profile info into newUser object
        var newUser = Object();
        newUser.id = profile.id;
        newUser.name = profile.displayName;
        newUser.email = profile.emails[0].value; //multiple emails provided
        newUser.pic = profile.photos[0].value; //url of the profile picture
        newUser.provider = profile.provider;
//Save the token for later actions with facebook (real actions
//will require using facebook API or Node SDK (authorized by this token)

//will require using facebook API or Node SDK (authorized by this token)
        newUser.token = token;
//Assume the user is authenticated
//newUser is made accessible through the session (req.user)
//jump back to passport.authenticate()
        return done(null, newUser);
    });
}
