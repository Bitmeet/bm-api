'use strict';

const _ = require('lodash');

const common = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 9000,
};

module.exports = _.merge(common, require(`./environment/${common.env}`) || {});