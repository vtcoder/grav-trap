/// <binding AfterBuild='compile:ts' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var gulpTs = require('gulp-typescript');
var gulpSrcMaps = require('gulp-sourcemaps');
var tsProj = gulpTs.createProject('tsconfig.json');

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('test', function () {
    // place code for your default task here
});

gulp.task('compile:ts', function () {
    var tsResult =
        gulp.src('./wwwroot/gt.ts')
        .pipe(gulpSrcMaps.init())
        .pipe(tsProj());

    return tsResult.js
        .pipe(gulpSrcMaps.write('.'))
        .pipe(gulp.dest('./wwwroot/'));
});