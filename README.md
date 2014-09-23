
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

 - BITLY
 BITLY_USERNAME
 BITLY_TOKEN
 BITLY_DOMAIN

 - EMAIL (require amazon)
 SEND_EMAIL = true


* To test:
mocha -R spec

# Starbucks
npm install -g bower

# Elastic search
brew update
brew install elasticsearch
==> Caveats
Data:    /usr/local/var/elasticsearch/elasticsearch_igbopie/
Logs:    /usr/local/var/log/elasticsearch/elasticsearch_igbopie.log
Plugins: /usr/local/var/lib/elasticsearch/plugins/

To have launchd start elasticsearch at login:
    ln -sfv /usr/local/opt/elasticsearch/*.plist ~/Library/LaunchAgents
Then to load elasticsearch now:
    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.elasticsearch.plist
Or, if you don't want/need launchctl, you can just run:
    elasticsearch --config=/usr/local/opt/elasticsearch/config/elasticsearch.yml
==> Summary

