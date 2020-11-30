const gulp = require('gulp')
const babel = require('gulp-babel')
const rimraf = require('rimraf')
const zip = require('gulp-zip')

function dest(str) {
  if (str) {
    return './dest/' + str
  } else {
    return './dest/'
  }
}

function deleteDest(cb) {
  rimraf(dest(), cb)
}

function copyLocales(cb) {
  gulp
    .src('app/_locales/*/**')
    .pipe(gulp.dest(dest('_locales')))
    .on('end', cb)
}

function copyImages(cb) {
  gulp
    .src('app/images/*')
    .pipe(gulp.dest(dest('images')))
    .on('end', cb)
}

function copyOptions(cb) {
  gulp
    .src('app/options/*')
    .pipe(
      babel({
        only: ['**/*.js'],
        presets: ['@babel/env'],
        comments: false,
      })
    )
    .pipe(gulp.dest(dest('options')))
    .on('end', cb)
}

function copyConstants(cb) {
  gulp
    .src('app/constants/*')
    .pipe(
      babel({
        presets: ['@babel/env'],
        comments: false,
      })
    )
    .pipe(gulp.dest(dest('constants')))
    .on('end', cb)
}

function copyManifest(cb) {
  gulp.src('app/manifest.json').pipe(gulp.dest(dest())).on('end', cb)
}

function babelify(cb) {
  gulp
    .src('app/scripts/*.js')
    .pipe(
      babel({
        presets: ['@babel/env'],
        comments: false,
      })
    )
    .pipe(gulp.dest(dest('scripts')))
    .on('end', cb)
}

function package(cb) {
  gulp
    .src(dest('**/*'))
    .pipe(zip('bigtube.zip'))
    .pipe(gulp.dest('.'))
    .on('end', cb)
}

exports.build = gulp.series(
  deleteDest,
  gulp.parallel(
    copyLocales,
    copyImages,
    copyManifest,
    copyOptions,
    copyConstants,
    babelify
  )
)

exports.default = gulp.series(exports.build, package)
