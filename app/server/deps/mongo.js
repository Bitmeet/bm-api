'use strict';

const mongoose = require('mongoose');
const config   = require('./../../../config');

mongoose.Promise = require('bluebird');

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${config.mongo.uri}`);
});

mongoose.connection.on('error', (err) => {
    console.log(`Mongoose error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
});

module.exports = {
    connect: () => {
        return mongoose.connect(config.mongo.uri);
    },
    close: () => {
        return mongoose.connection.close();
    }
};
