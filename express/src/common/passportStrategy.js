'use strict';

var JWTStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('./../model/userModel'),
    Student = require('./../model/studentModel'),
    config = require('./../config').get(process.env.NODE_ENV);

// Hooks the JWT Strategy.
function hookJWTStrategy(passport) {
    var options = {};

    options.secretOrKey = config.keys.secret;
    options.jwtFromRequest = ExtractJwt.fromAuthHeader();
    options.ignoreExpiration = false;

    passport.use(new JWTStrategy(options, function(JWTPayload, callback) {
        //console.log(JWTPayload.is_user)
        if(JWTPayload.is_user){
            User.findOne({ where: { email: JWTPayload.email } })
                .then(function(user) {
                    // check is_login field in order to log out 
                    if(!user || !(user.is_login)) {
                        callback(null, false);
                        return;
                    }
                    callback(null, user);
            });
        } else {
            if(JWTPayload.is_student){
                Student.findOne({ where: { email: JWTPayload.email } })
                    .then(function(student) {
                        //console.log(student)
                        if(!student) {
                            callback(null, false);
                            return;
                        }
                        callback(null, student);
                });
            } else {
                callback(null, false);
                return;
            }
        }
    }));
}


module.exports = hookJWTStrategy;