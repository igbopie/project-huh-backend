
SEEM BACKEND
================

This is the seem backend. To start it up you would a localhost mongodb installation.

* Setup:
npm install

* ENV needed:
 - AWS (Required)
 AWS_ACCESS_KEY_ID
 AWS_SECRET_ACCESS_KEY
 AWS_S3_BUCKET

 - TWILIO (Optional - just production or SMS)
 TWILIO_ACCOUNT_SID
 TWILIO_TOKEN
 TWILIO_FROM

 - MONGO (Optional - just production heroku)
  MONGOLAB_URI || MONGOHQ_URL

* To test:
mocha -R spec