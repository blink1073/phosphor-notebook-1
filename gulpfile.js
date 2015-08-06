"use strict";
var gulp = require("gulp");
var gulpTypescript = require("gulp-typescript");
var concat = require('gulp-concat');
var header = require('gulp-header');
var stream = require('event-stream');
var rename = require('gulp-rename');
var del = require('del');
var typedoc = require('gulp-typedoc');
var typescript = require('typescript');
var karma = require('karma').server;


var typings = [
    "./typings/tsd.d.ts",
    "./es6.d.ts",
    "./logger.d.ts",
    "./components/phosphor/dist/phosphor.d.ts",
];

var testsTypings = typings.concat([
  './typings/expect.js/expect.js.d.ts',
  './typings/mocha/mocha.d.ts'
]);

var tsSources = [
    "index",
    "app",
    "NotebookComponent",
    "nbformat",
    "demodata",
    "mathjaxutils",
    "kernel",
    "session",
    "utils",
    "serialize"
].map(function(name) {return "./src/" + name + ".ts"; });


gulp.task('clean', function(cb) {
  del(['./dist'], cb);
});


gulp.task('src', function() {
    var project = gulpTypescript.createProject({
        typescript: typescript,
        experimentalDecorators: true,
        declarationFiles: true,
        noImplicitAny: true,
        target: 'ES5',
        module: 'amd'
    });

  var src = gulp.src(typings.concat(tsSources))
    .pipe(gulpTypescript(project));

  var dts = src.dts.pipe(concat('phosphor-notebook.d.ts'))
    .pipe(gulp.dest('./dist'));

  var js = src//.pipe(concat('phosphor-notebook.js'))
    .pipe(header('"use strict";\n'))
    .pipe(gulp.dest('./dist'));

  return stream.merge(dts, js);
});


gulp.task('build', ['src']);


gulp.task('dist', ['build'], function() {
  return gulp.src('./dist/phosphor-notebook.js')
    //.pipe(uglify())
    .pipe(rename('phosphor-notebook.min.js'))
    .pipe(gulp.dest('./dist'));
});


gulp.task('watch', function() {
  gulp.watch(tsSources, ['src']);
});


gulp.task('tests', function() {
  var project = gulpTypescript.createProject({
    typescript: typescript,
    experimentalDecorators: true,
    declarationFiles: false,
    noImplicitAny: true,
    target: 'ES5',
  });

  var sources = testsTypings.concat([
    //'dist/phosphor-notebook.d.ts',
    'tests/**/*.ts'
  ]);
  return gulp.src(sources)
    .pipe(gulpTypescript(project))
    .pipe(concat('index.js'))
    .pipe(header('"use strict";\n'))
    .pipe(gulp.dest('tests/build')); 
});


gulp.task('karma', function () {
  karma.start({
    configFile: __dirname + '/tests/karma.conf.js',
  });
});


gulp.task('default', ['dist']);


gulp.task('docs', function() {
  return gulp.src(typings.concat(tsSources))
    .pipe(typedoc({
      out: './build/docs',
      name: 'Phosphor-notebook',
      target: 'ES5',
      mode: 'modules',
      module: 'amd',
      includeDeclarations: false }));
});
