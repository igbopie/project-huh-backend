'use strict';
// Locate your certificate
var join = require('path').join,
    apnagent = require('apnagent'),
    UserService = require('../models/user').Service,
    prodCert = join(__dirname, '../../_certs/HuhAPNProd.p12'),
    devCert = join(__dirname, '../../_certs/HuhAPNDev.p12');


// ---------------------------------------
//      Worker part
// ---------------------------------------
function Apn(certificate, sandbox) {

    this.feedback = new apnagent.Feedback();
    this.agent = new apnagent.Agent();

    if (sandbox) {
        this.agent.enable('sandbox');
    }

    this.feedback.on('feedback:connect', function () {
        console.log('APN Feedback Connected');
    });

    this.feedback.on('feedback:close', function () {
        console.log('APN Feedback Closed');
    });

    this.feedback.on('feedback:error', function (error) {
        console.error('APN Feedback Error: ' + error);
    });


    this.feedback.set('pfx file', certificate);

    this.feedback
        .set('interval', '30s') // default is 30 minutes?
        .connect();
    this.feedback.set('concurrency', 1);

    this.feedback.use(function (device, timestamp, done) {
        var token = device.toString(),
            ts = timestamp.getTime();

        console.log('I should unsubscribe token:' + token);
        UserService.unsubscribeApn(token, ts, false, function (err) {
            if (err) {
                console.log('Error apn unsubscribing:' + err);
            } else {
                console.log('Success unsubscribing.');
            }
            done();
        });
    });


    // ---------------------------------------
    //      Send notifications part
    // ---------------------------------------

    // set our credentials
    this.agent.set('pfx file', certificate);
    this.agent.on('message:error', function (err, msg) {
        switch (err.name) {
        // This error occurs when Apple reports an issue parsing the message.
        case 'GatewayNotificationError':
            console.log('[message:error] GatewayNotificationError: %s', err.message);

            // The err.code is the number that Apple reports.
            // Example: 8 means the token supplied is invalid or not subscribed
            // to notifications for your application.
            if (err.code === 8) {
                console.log('    > %s', msg.device().toString());
                // In production you should flag this token as invalid and not
                // send any futher messages to it until you confirm validity
            }

            break;

        // This happens when apnagent has a problem encoding the message for transfer
        case 'SerializationError':
            console.log('[message:error] SerializationError: %s', err.message);
            break;

        // unlikely, but could occur if trying to send over a dead socket
        default:
            console.log('[message:error] other error: %s', err.message);
            break;
        }
    });


    this.agent.connect(function (err) {
        if (err) { throw err; }
        // it worked!
        var env = this.agent.enabled('sandbox') ? 'sandbox' : 'production';
        console.log('apnagent [%s] gateway connected', env);

    }.bind(this));

    this.send = function (token, msg, data, badge) {

        var message = this.agent.createMessage()
            .device(token)
            .badge(badge)
            .alert(msg)
            .expires(0);

        if (data) {
            message.set(data);
        }

        message.send(function (err) {
            if (err) {
                console.log('Error:' + err);
            } else {
                console.log('Sent!');
            }
        });
    };
}

Apn.prototype.close = function () {
    this.feedback.close();
    this.agent.close();
};

var apnDev = new Apn(devCert, true);
var apnProd = new Apn(prodCert, false);

exports.send = function (token, message, data, badge) {
    apnDev.send(token, message, data, badge);
    apnProd.send(token, message, data, badge);
};

exports.close = function () {
    apnDev.close();
    apnProd.close();
};
