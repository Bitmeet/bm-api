'use strict';

const Promise = require('bluebird'); // jshint ignore:line
const express = require('express');
const config  = require('./../../config');
const before  = require('./before');
const app     = require('./express').app;


module.exports.start = () => {
    return before.start()
        .then(startService)
};

function startService() {
    const deferred = Promise.defer();

    app.listen(config.port, (err) => {
        if (err) {
            console.log(`Failed to load service with message ${err.message}`);
            return deferred.reject(err);
        }
        console.log(`Express server listening on port ${config.port}, in mode ${config.env}`);
        return deferred.resolve();
    });
    return deferred.promise;
}