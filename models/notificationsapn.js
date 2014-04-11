/**
 * Created by igbopie on 11/04/14.
 */
// Locate your certificate
var join = require('path').join;
// Create a new agent
var apnagent = require('apnagent');
var pfx = join(__dirname, '../_certs/aps_production.p12');
var agent = new apnagent.Agent();


// set our credentials
agent.set("pfx file", pfx);
// our credentials were for development
//agent.enable('sandbox');

agent.on('message:error', function (err, msg) {
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



agent.connect(function (err) {
    if (err) throw err;

    // it worked!
    var env = agent.enabled('sandbox')
        ? 'sandbox'
        : 'production';

    console.log('apnagent [%s] gateway connected', env);


    //b401a0af2b7edb04732cfb3575db3bdbbbd700ed940dbe0217b1d90329adc3a4
    //var nachoToken ="<b401a0af 2b7edb04 732cfb35 75db3bdb bbd700ed 940dbe02 17b1d903 29adc3a4>";
    //var nachoToken ="b401a0af2b7edb04732cfb3575db3bdbbbd700ed940dbe0217b1d90329adc3a4";
    //var dougToken ="abf625ad5b82741dede97f6be25c68e1aee2c714d5afff9fb7ee2bff90542cc0";
    //abf625ad5b82741dede97f6be25c68e1aee2c714d5afff9fb7ee2bff90542cc0
    //var dougToken ="<abf625ad 5b82741d ede97f6b e25c68e1 aee2c714 d5afff9f b7ee2bff 90542cc0>";
    //var azaToken="7ecf94e5dc0b627442b3b86897fb2332c7cfe533d0c50b3be13d7b2271b07926";
    agent.createMessage()
        .device(dougToken)
        .alert('Hey! this a SEEM notification :)')
        .expires('1h')
        .send(function (err) {
            if(err){
                console.log("Error:"+err);
            }   else {
                console.log("Sent!");
            }
        });
});