/**
 * Created by igbopie on 1/30/15.
 */
var gulp = require('gulp');
var child_process = require('child_process');
var mkdirp = require('mkdirp');

gulp.task('default', function() {
  /*
  #!/bin/bash
  export =
  export =
  export =
  node app.js*/
  // place code for your default task herenpm install --save-dev gulp-shell
  mkdirp('./db', function(err) {
    if(err) return console.err(err);

    // path was created unless there was error
    child_process.exec("mongod --dbpath ./db", function(err, stdout, stderr){
      console.log(stdout);


    });

    child_process.exec(
      "node app.js",
      {env:
        {
          'AWS_ACCESS_KEY_ID': 'AKIAJ4GCCVHYQANYFALA',
          'AWS_SECRET_ACCESS_KEY': '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',
          'AWS_S3_BUCKET': 'left-dev-test-local'
        }
      },
      function(err, stdout, stderr){
        console.log(stdout);
      }
    );
  });


});