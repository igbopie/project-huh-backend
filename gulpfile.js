/**
 * Created by igbopie on 1/30/15.
 */
var gulp = require('gulp');
var env = require('gulp-env');
var child_process = require('child_process');
var mkdirp = require('mkdirp');
var clean = require('gulp-clean');
var bower = require('gulp-bower');

gulp.task('run',['build-frontend'] , function() {
  /*
  #!/bin/bash
  export =
  export =
  export =
  node app.js*/
  // place code for your default task herenpm install --save-dev gulp-shell
  mkdirp('./db', function(err) {
    if (err) return console.err(err);

    // path was created unless there was error
    child_process.exec("mongod --dbpath ./db", function (err, stdout, stderr) {
      //console.log(stdout);
    });

    env({
      vars: {
        'AWS_ACCESS_KEY_ID': 'AKIAJ4GCCVHYQANYFALA',
        'AWS_SECRET_ACCESS_KEY': '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',
        'AWS_S3_BUCKET': 'left-dev-test-local'
      }
    });

    //run app
    var app = require("./dist/app");

  });

});
gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('build-backend', ["clean"], function() {
  return gulp.src('src/**')
    .pipe(gulp.dest('dist'));
});

gulp.task('bower', ['build-backend'], function() {
  return bower()
    .pipe(gulp.dest('dist/public/libs/'))
});

gulp.task('build-frontend', ['bower'], function() {
  return gulp.src('src-frontend/**')
    .pipe(gulp.dest('dist/public'));
});