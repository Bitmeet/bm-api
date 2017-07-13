'use strict';

const app            = require('./../server/express').app;
const morgan         = require('morgan');
const shrinkRay      = require('shrink-ray');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const cookieParser   = require('cookie-parser');
const errorHandler   = require('errorhandler');
const path           = require('path');
const lusca          = require('lusca');
const config         = require('./../../config');
const passport       = require('passport');
const session        = require('express-session');
const connectMongo   = require('connect-mongo');
const mongoose       = require('mongoose');

function initRoutes() {
    console.log('Starting to init routes');
    init();
    app.get('/api/ping', (req, res) => {
        res.status(200).send('pong');
    });

    app.use((err, req, res, next) => {
        console.log(`An error occurred. ${err}`);

        if (res.headersSent) {
            return next(err);
        }

        const statusCode = err.statusCode || 500;

        res.status(statusCode).send({
            message: err.message
        });
    });

    app.use('/api/users', require('./user').router);
    app.use('/local', require('./../auth/local').router);
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get((req, res) => {
            const statusCode = 404;
            res.send(statusCode);
        });
}

function init() {

    var MongoStore = connectMongo(session);

    var env = app.get('env');

    // if (env === 'development' || env === 'test') {
    //     app.use(express.static(path.join(config.root, '.tmp')));
    // }
    //
    // if (env === 'production') {
    //     app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    // }

    app.use(morgan('dev'));

    app.set('views', `${config.root}/server/views`);
    // app.engine('html', require('ejs').renderFile);
    // app.set('view engine', 'html');
    app.use(shrinkRay());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(passport.initialize());


    // Persist sessions with MongoStore / sequelizeStore
    // We need to enable sessions for passport-twitter because it's an
    // oauth 1.0 strategy, and Lusca depends on sessions
    app.use(session({
        secret: config.secrets.session,
        saveUninitialized: true,
        resave: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            db: 'bm'
        })
    }));

    /**
     * Lusca - express server security
     * https://github.com/krakenjs/lusca
     */
    if (env !== 'test' && !process.env.SAUCE_USERNAME) {
        app.use(lusca({
            // csrf: {
            //     angular: true
            // },
            xframe: 'SAMEORIGIN',
            hsts: {
                maxAge: 31536000, //1 year, in seconds
                includeSubDomains: true,
                preload: true
            },
            xssProtection: true
        }));
    }


    if (env === 'development' || env === 'test') {
        app.use(errorHandler()); // Error handler - has to be last
    }

}

module.exports = {
    initRoutes
};