/**
 * Created by Lazarus of Bethany on 04/05/2017.
 */
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');
var User = require('../models/users');
var localStorage = require('localStorage')


module.exports = function(passport) {


    passport.serializeUser(function (user, done) {
        done(null, user);
    });
// used to deserialize the user
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    passport.use(new FacebookStrategy({

            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL,
            passReqToCallback : true // allows us  to pass in the req from our route (lets us check if a user is logged in or  not)

        },
        function(req, token, refreshToken,  profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already  logged in
                if (!req.user) {

                    User.findOne({ 'facebookId'  : profile.id }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user!=null) {

                            // if there is a user  id already but no token (user was linked at one point and then removed)
                            if  (!user.facebookToken) {
                                user.facebookToken = token;
                                user.facebookName  =  profile.displayName;
                                user.save(function(err) {
                                    if (err)
                                        throw  err;
                                    return  done(null, user);
                                });
                            }
                            localStorage.setItem('facebookAuth',profile.displayName)
                            return done(null,  user); // user found, return that user
                        } else {
                            // if there is no  user, create them
                            var newUser            = new User();
                            newUser.facebookId    =  profile.id;
                            newUser.facebookToken =  token;
                            newUser.facebookName  =  profile.displayName;
                            newUser.active=true
                            newUser.image=false
                            newUser.name=profile.displayName
                            localStorage.setItem('facebookAuth',profile.displayName)
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null,  newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is  logged in, we have to link accounts
                    var user            = new User(); // pull the user out  of the session
                    user.facebookId    = profile.id;
                    user.facebookToken = token;
                    user.facebookName  = profile.displayName;
                    user.name=profile.displayName
                    user.active=true
                    user.image=false
                    localStorage.setItem('facebookAuth',profile.displayName)
                    user.save(function(err,us) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });

                }
            });

        }));


};

