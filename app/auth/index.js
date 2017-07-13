'use strict';

const express = require('express');
const config  = require('./../../config');
const User    = require('./../api/user/user.model').User;

// Passport Configuration
require('./local/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local').default);

module.exports = {
    router
};