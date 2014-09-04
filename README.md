
SEEM BACKEND
================
 
This is the seem backend. To start it up you would a localhost mongodb installation.

* Setup:

npm install

Need image magick to resize images... (http://aaronheckmann.tumblr.com/post/48943531250/graphicsmagick-on-heroku-with-nodejs)

brew install imagemagick


* Image magick on heroku
https://github.com/mcollina/heroku-buildpack-imagemagick

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

# Starbucks
npm install -g bower
