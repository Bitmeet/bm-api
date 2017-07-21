'use strict';

module.exports = {
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/local'
    },
    secrets: {
        session: 'bm-api'
    },
    email: {
        sendEmail: false
    }
};