const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('./model/subscribers_model');

// Load Routes
const index = require('./router');

// subscriber route load push
const push = require('./router/push');

// subscriber route load
const subscriber = require('./router/subscriber');

// Load Keys
const keys = require('./config/keys');

// Handlebars Helpers

mongoose.Promise = global.Promise;

// Mongoose Connect
mongoose.set('debug', true); // turn on debug
mongoose.connect(keys.mongoURI, {
    auth: {
        authdb: "admin",
        user: "<username>",
        password: "<password>"
    }
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Create Express middleware
const app = express();
app.set('trust proxy', true);

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('selfsigned.key', 'utf8');
var certificate = fs.readFileSync('selfsigned.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

const port = process.env.PORT || 3000;

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', __dirname + '/public/js');

// Set global vars
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', index);
app.use('/subscriber', subscriber);
app.use('/push', push);


// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers

// Development error handler will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

httpServer.listen(port, () => {
    console.log(`HTTP server started on port ${port}`);
});
httpsServer.listen(3001, () => {
    console.log(`HTTPs server started on port 3001`);
});