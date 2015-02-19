var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var sources = [
	'./src/konsoll.js',
	'./src/*.js',
	'./src/**/*.js'
];

gulp.task('compile', [], function() {
	return gulp.src(sources)
	.pipe(concat('konsoll.js'))
	.pipe(gulp.dest('./dist/'));
});

gulp.task('minify', [], function() {
	return gulp.src(sources)
	.pipe(concat('konsoll.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./dist/'));
});

gulp.task('validate', [], function() {
	return gulp.src(sources)
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});
gulp.task('default', [
	'validate',
	'compile',
	'minify',
]);

gulp.task('watch', function() {
	gulp.watch(sources, ['default']);
});
