const gulp = require('gulp');
const babel = require('gulp-babel');
const rimraf = require('rimraf');
const zip = require('gulp-zip');

function dest(str) {
    if (str) {
        return './dest/' + str;
    } else {
        return './dest/';
    }
}

gulp.task('delete', function (cb) {
    rimraf(dest(), cb);
});

gulp.task('copylocales', ['delete'], function (cb) {
    gulp.src('app/_locales/*/**')
        .pipe(gulp.dest(dest('_locales')))
        .on('end', cb);
});

gulp.task('copyimages', ['delete'], function (cb) {
    gulp.src('app/images/*')
        .pipe(gulp.dest(dest('images')))
        .on('end', cb);
});

gulp.task('copyoptions', ['delete'], function (cb) {
    gulp.src('app/options/*')
        .pipe(babel({
            only: ['**/*.js'],
            presets: ['@babel/env'],
            comments: false
        }))
        .pipe(gulp.dest(dest('options')))
        .on('end', cb);
});

gulp.task('copyconstants', ['delete'], function (cb) {
    gulp.src('app/constants/*')
        .pipe(babel({
            presets: ['@babel/env'],
            comments: false
        }))
        .pipe(gulp.dest(dest('constants')))
        .on('end', cb);
});

gulp.task('copymanifest', ['delete'], function (cb) {
    gulp.src('app/manifest.json')
        .pipe(gulp.dest(dest()))
        .on('end', cb);
});

gulp.task('babelify', ['delete'], function (cb) {
    gulp.src('app/scripts/*.js')
        .pipe(babel({
            presets: ['@babel/env'],
            comments: false
        }))
        .pipe(gulp.dest(dest('scripts')))
        .on('end', cb);
});

gulp.task('zip', ['copylocales', 'copyimages', 'copymanifest', 'copyoptions', 'copyconstants', 'babelify'], function (cb) {
    gulp.src(dest('**/*'))
        .pipe(zip('bigtube.zip'))
        .pipe(gulp.dest('.'))
        .on('end', cb);
});

gulp.task('default', ['zip']);
