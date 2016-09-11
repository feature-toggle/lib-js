var gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    del = require('del');

gulp.task('scripts', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('featuretoggle.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(notify({message: 'Scripts task complete' }));
});

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('scripts');
});