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
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var ngAnnotate = require('gulp-ng-annotate');
var _ = require('underscore');
var jslint = require('gulp-jslint');
var bourbon = require('node-bourbon').includePaths;
var istanbul = require('gulp-istanbul');
// We'll use mocha here, but any test framework will work
var mocha = require('gulp-mocha');


var jslintConf = {
    // these directives can
    // be found in the official
    // JSLint documentation.
    todo: true,
    node: true,
    nomen: true,

    // you can also set global
    // declarations for all source
    // files like so:
    global: [],
    predef: [],
    // both ways will achieve the
    // same result; predef will be
    // given priority because it is
    // promoted by JSLint

    // pass in your prefered
    // reporter like so:
    reporter: 'default',
    // ^ there's no need to tell gulp-jslint
    // to use the default reporter. If there is
    // no reporter specified, gulp-jslint will use
    // its own.

    // specify whether or not
    // to show 'PASS' messages
    // for built-in reporter
    errorsOnly: false
};

gulp.task('start-mongo', function (cb) {
    /*
     #!/bin/bash
     export =
     export =
     export =
     node app.js*/
    // place code for your default task herenpm install --save-dev gulp-shell
    mkdirp('./db', function (err) {
        if (err) return console.err(err);

        // path was created unless there was error
        child_process.exec("mongod --dbpath ./db", function (err, stdout, stderr) {
            //console.log(stdout);
            cb()
        });
    });
});

gulp.task('prerun-dev', ['build-frontend', 'build-frontend-css-watch', 'build-frontend-partials-watch', 'build-frontend-browserify-watch', 'start-mongo'], function (cb) {
    env({
        vars: {
            'AWS_ACCESS_KEY_ID': 'AKIAJ4GCCVHYQANYFALA',
            'AWS_SECRET_ACCESS_KEY': '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',
            'AWS_S3_BUCKET': 'left-dev-test-local'
        }
    });
    cb();
});

gulp.task('run-dev', ['prerun-dev'], function (cb) {
    //run app
    var app = require("./dist/app");
    app.start();
    cb();
});

gulp.task('run', ['build-frontend'], function (cb) {
    //run app
    var app = require("./dist/app");
    app.start();
    cb();
});

gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});
gulp.task('build-backend-js', ["clean"], function () {
    return gulp.src('src-backend/**')
        .pipe(jslint(jslintConf))
        .pipe(gulp.dest('dist'))
        .on('error', function (error) {
            console.error(error);
        });
});

gulp.task('build-backend-jade', ["build-backend-js"], function () {
    return gulp.src('src-jade/**')
        .pipe(gulp.dest('dist/views'))
        .on('error', function (error) {
            console.error(String(error));
        });
});

gulp.task('build-backend', ["build-backend-jade"], function () {
    return;
});

gulp.task('build-frontend-assets', function () {
    return gulp.src('src-frontend/assets/**')
        .pipe(gulp.dest('dist/public'));
});

gulp.task('build-frontend-css', function () {
    return gulp.src('src-frontend/scss/style.scss')
        .pipe(sass({
            includePaths: ['styles'].concat(bourbon)
        }).on('error', console.error))
        .pipe(gulp.dest('dist/public/css'));
});


gulp.task('build-frontend-css-watch', function () {
    return gulp.watch('src-frontend/scss/**/*', ['build-frontend-css']);
});

gulp.task('build-frontend-css-dep', function () {
    return gulp.src(['./node_modules/font-awesome/css/font-awesome.min.css', './node_modules/angular-material/angular-material.min.css'])
        .pipe(gulp.dest('dist/public/css'));
});


gulp.task('build-frontend-html', function () {
    return gulp.src('src-frontend/index.html')
        .pipe(gulp.dest('dist/public'));
});

gulp.task('build-frontend-partials', function () {
    return gulp.src('src-frontend/partials/**')
        .pipe(gulp.dest('dist/public/partials'));
});

gulp.task('build-frontend-partials-watch', function () {
    return gulp.watch('src-frontend/partials/**', ['build-frontend-partials']);
});

gulp.task('build-frontend-browserify', buildFrontEndJs);
gulp.task('build-frontend-browserify-watch', buildWatchFrontEndJs);

gulp.task('build-frontend', ['build-backend'], function (callback) {
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
function buildFrontEndJs() {
    return browserify(opts).bundle()
        .pipe(source('bundle.js'))
        .pipe(ngAnnotate())
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('dist/public/'))
}
function buildWatchFrontEndJs() {
    return watchifyFrontendJs.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist/public/'))
}

watchifyFrontendJs.on('update', buildWatchFrontEndJs); // on any dep update, runs the bundler
watchifyFrontendJs.on('log', console.log);

gulp.task('test', ['prerun-dev'], function (cb) {
    gulp.src('dist/**/*.js')
        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            var app = require("./dist/app");
            app.start(function () {
                gulp.src(['test/testcases/*.js'])
                    .pipe(mocha())
                    .pipe(istanbul.writeReports()) // Creating the reports after tests ran
                    //.pipe(istanbul.enforceThresholds({ thresholds: { global: 70 } })) // Enforce a coverage of at least 90%
                    .on('end', function () {
                        console.log("TEST FINISHED");
                        app.stop();

                        cb();
                    });
            });
        }
    );
});