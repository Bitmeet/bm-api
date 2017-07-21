'use strict';

const User = require('./user.model').User;
const config = require('./../../../config');
const jwt = require('jsonwebtoken');
const sendgrid = require('sendgrid');
sendgrid(config.email.id);


function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function (err) {
        return res.status(statusCode).json(err);
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        return res.status(statusCode).send(err);
    };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
function index(req, res) {
    return User.find({}, '-salt -password').exec()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(handleError(res));
}

/**
 * Creates a new user
 */
function create(req, res) {
    const newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.save()
        .then(function (user) {
            const protocol = (req.secure) ? 'https://' : 'http://';
            const url = protocol + req.headers.host + '/';
            sendNewUserEmail(url, req.body.email, req.body.name, user._id);
            const token = jwt.sign({ _id: user._id }, config.secrets.session, {
                expiresIn: 60 * 60 * 5
            });
            res.json({ token });
        })
        .catch(validationError(res));
}

/**
 * Get a single user
 */
function show(req, res, next) {
    const userId = req.params.id;

    return User.findById(userId).exec()
        .then(user => {
            if (!user) {
                return res.status(404).end();
            }
            res.json(user.profile);
        })
        .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
function destroy(req, res) {
    return User.findByIdAndRemove(req.params.id).exec()
        .then(function () {
            res.status(204).end();
        })
        .catch(handleError(res));
}

/**
 * Change a users password
 */
function changePassword(req, res) {
    const userId = req.user._id;
    const oldPass = String(req.body.oldPassword);
    const newPass = String(req.body.newPassword);

    return User.findById(userId).exec()
        .then(user => {
            if (user.authenticate(oldPass)) {
                user.password = newPass;
                return user.save()
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            } else {
                return res.status(403).end();
            }
        });
}

/**
 * Get my info
 */
function me(req, res, next) {
    const userId = req.user._id;

    return User.findOne({ _id: userId }, '-salt -password').exec()
        .then(user => { // don't ever give out the password or salt
            if (!user) {
                return res.status(401).end();
            }
            res.json(user);
        })
        .catch(err => next(err));
}

/**
 * Authentication callback
 */
function authCallback(req, res) {
    res.redirect('/');
}

function sendNewUserEmail(url, email, name, id) {
    if (config.emai.sendEmail) {
        var params = {
            smtpapi: new sendgrid.smtpapi(),
            to: email,
            from: 'info@bitmeet.co',
            // subject: 'Welcome to Bitmeet',
            // html: '<b>Hello ' + name + ', </b><br><br>' +
            //  'Click on the link to complete registration : <a href="' + url + 'api/users/verify/' + id +'">' + url + 'api/users/verify/' + id +'</a>'
            subject: 'ברוכים הבאים ל-Bitmeet!',
            html: '<html lang="he" dir="rtl"><body dir="rtl"><b>שלום ' + name + ', </b><br><br>' +
            'אנא לחצו על הלינק להשלמת הרישום: <a href="' + url + 'api/users/verify/' + id + '">' + url + 'api/users/verify/' + id + '</a><br><br>' +
            'בתודה,<br>צוות Bitmeet</body></html>'
        };
        var sendEmail = new sendgrid.Email(params);
        sendgrid.send(sendEmail, function (err, json) {
            if (err) {
                return console.error(err)
            }
            console.log(json);
        });
    } else {
        console.warn(`Email sending was deiabled in the configuration. Use url: ${url + 'api/users/verify/'}`);
    }
}

module.exports = {
    index,
    create,
    show,
    destroy,
    changePassword,
    me,
    authCallback
};