
var accountSid =  process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_TOKEN;
var phoneFrom = process.env.TWILIO_FROM;
var client = null;

if(authToken != null && authToken != "" ){
	client = require('twilio')(accountSid, authToken);
} else{
	console.log("WILL NOT SEND SMSs - using log")
}
  
exports.send = function (to,text,callback) {
	if(client != null){
		client.sms.messages.create({
   		body:text,
   		to: to,
   		from: phoneFrom},
   		 function(err, message) {
   		 	console.log("SMS Sent err:"+err+" message:"+message);
   		 	callback(err,message)
	   		 process.stdout.write(message.sid);
	   		 });	
	} else{
		var message = {to:to,body:text};
		console.log("SEND SMS:"+message);
		callback(null,message);
	}
};


