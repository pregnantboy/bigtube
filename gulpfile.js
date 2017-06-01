var gulp = require('gulp');
var rimraf = require('rimraf');
var javascriptObfuscator = require('gulp-javascript-obfuscator');


function dest(str) {
    if (str) {
        return './dest/' + str;
    } else {
        return './dest/'
    }
}

gulp.task('delete', function (cb) {
    rimraf(dest(), cb);
});

gulp.task('copylocales', ['delete'], function () {
    gulp.src('app/_locales/*/**')
        .pipe(gulp.dest(dest('_locales')));
});

gulp.task('copyimages', ['delete'], function () {
    gulp.src('app/images/*')
        .pipe(gulp.dest(dest('images')));
});

gulp.task('copymanifest', ['delete'], function () {
    gulp.src('app/manifest.json')
        .pipe(gulp.dest(dest()));
});

gulp.task('obfuscate', ['delete'], function () {
    gulp.src('app/scripts/*.js')
        .pipe(javascriptObfuscator())
        .pipe(gulp.dest(dest('scripts')));
});

gulp.task('default', ['copylocales', 'copyimages', 'copymanifest', 'obfuscate']);