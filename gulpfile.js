/**
 * Created by igbopie on 1/30/15.
 */
var gulp = require('gulp');
var env = require('gulp-env');
var child_process = require('child_process');
var mkdirp = require('mkdirp');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var runSequence = require('run-sequence');
var watchify = require('watchify');
var _ = require('underscore');
var bourbon = require('node-bourbon').includePaths;

gulp.task('run-dev',['build-frontend', 'build-frontend-css-watch', 'build-frontend-partials-watch'] , function() {
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

gulp.task('run',['build-frontend'] , function() {
  //run app
  var app = require("./dist/app");
});

gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('build-backend', ["clean"], function() {
  return gulp.src('src/**')
    .pipe(gulp.dest('dist'));
});


gulp.task('build-frontend-assets', function() {
  return gulp.src('src-frontend/assets/**')
    .pipe(gulp.dest('dist/public'));
});

gulp.task('build-frontend-css', function() {
  return gulp.src('src-frontend/scss/style.scss')
    .pipe(sass({
      includePaths: ['styles'].concat(bourbon)
    }).on('error', console.error))
    .pipe(gulp.dest('dist/public/css'));
});


gulp.task('build-frontend-css-watch', function () {
  return gulp.watch('src-frontend/scss/style.scss', ['build-frontend-css']);
});

gulp.task('build-frontend-css-dep', function() {
  return gulp.src(['./node_modules/font-awesome/css/font-awesome.min.css', './node_modules/angular-material/angular-material.min.css'])
    .pipe(gulp.dest('dist/public/css'));
});


gulp.task('build-frontend-html', function() {
  return gulp.src('src-frontend/index.html')
    .pipe(gulp.dest('dist/public'));
});

gulp.task('build-frontend-partials', function() {
  return gulp.src('src-frontend/partials/**')
    .pipe(gulp.dest('dist/public/partials'));
});

gulp.task('build-frontend-partials-watch', function () {
  return gulp.watch('src-frontend/partials/**', ['build-frontend-partials']);
});

gulp.task('build-frontend-browserify', buildWatchFrontEndJs);

gulp.task('build-frontend', ['build-backend'], function(callback) {
  runSequence('build-frontend-assets',
    'build-frontend-css',
    'build-frontend-css-dep',
    'build-frontend-browserify',
    'build-frontend-html',
    'build-frontend-partials',
    callback);
});


var customOpts = {
  entries: ['./src-frontend/js/app.js'],
  debug: true
};
var opts = _.defaults({}, watchify.args, customOpts);
var watchifyFrontendJs = watchify(browserify(opts));
function buildWatchFrontEndJs(){
  return watchifyFrontendJs.bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist/public/'))
}

watchifyFrontendJs.on('update', buildWatchFrontEndJs); // on any dep update, runs the bundler
watchifyFrontendJs.on('log', console.log);