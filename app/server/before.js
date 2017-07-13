'use strict';

const mongoose       = require('./deps/mongo');
const initRoutes     = require('./../api').initRoutes;
require('./express');

module.exports.start = () => {
    console.log(`Preparing server`);
    return mongoose.connect()
        .then(initRoutes);
};