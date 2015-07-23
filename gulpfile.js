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
var jshint = require('gulp-jshint');
var bourbon = require('node-bourbon').includePaths;
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var jscs = require('gulp-jscs');


var jslintConf = {
    node: true,
    nomen: true,
    "strict": true,
    "eqeqeq": true,
    "immed": true,
    "newcap": true,
    "maxparams": 6,//4,
    "maxdepth": 4,
    "maxstatements": 18, //15,
    "maxcomplexity": 6
};

var jslintConfFrontend = {
    nomen: true,
    browserify: true,
    browser: true,
    "strict": true,
    "eqeqeq": true,
    "immed": true,
    "newcap": true,
    "maxparams": 6,//4,
    "maxdepth": 4,
    "maxstatements": 18, //15,
    "maxcomplexity": 6
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

gulp.task('prerun-dev-backend-only', ['start-mongo', 'build-backend'], function (cb) {
    env({
        vars: {
            'AWS_ACCESS_KEY_ID': 'AKIAJ4GCCVHYQANYFALA',
            'AWS_SECRET_ACCESS_KEY': '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',
            'AWS_S3_BUCKET': 'left-dev-test-local'
        }
    });
    cb();
});

gulp.task('run-dev-test', ['prerun-dev-backend-only'], function (cb) {
    //run app
    var app = require("./dist/app");
    app.start();
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
        //.pipe(jslint(jslintConf))
        .pipe(jshint(jslintConf))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs())
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

gulp.task('build-frontend-font-dep', function () {
    return gulp.src(
        [
            './node_modules/font-awesome/fonts/*'
        ])
        .pipe(gulp.dest('dist/public/fonts'));
});
gulp.task('build-frontend-css-dep',['build-frontend-font-dep'], function () {
    return gulp.src(
        [
            './node_modules/font-awesome/css/font-awesome.min.css',
            './node_modules/angular-material/angular-material.min.css',
            './node_modules/angular-material-icons/angular-material-icons.css',
            './node_modules/textangular/dist/textAngular.css'
        ])
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
    return gulp.watch(['src-frontend/partials/**', 'src-frontend/index.html'], ['build-frontend-partials']);
});


gulp.task('build-frontend-lint', function() {
    return gulp.src('src-frontend/js/**')
        .pipe(jshint(jslintConfFrontend))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs())
        .on('error', function (error) {
            console.error(error);
        });
});

gulp.task('build-frontend-browserify', ['build-frontend-lint'], buildFrontEndJs);
gulp.task('build-frontend-browserify-watch', ['build-frontend-lint'], buildWatchFrontEndJs);

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

gulp.task('test', ['prerun-dev-backend-only'], function (cb) {
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