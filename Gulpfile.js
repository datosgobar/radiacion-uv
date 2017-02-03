const gulp          = require('gulp');
const sass          = require('gulp-sass');
const babel         = require('gulp-babel');
const cssnano       = require('gulp-cssnano');
const rucksack      = require('gulp-rucksack');
const autoprefixer  = require('gulp-autoprefixer');

gulp.task('es6', () => {
  return gulp.src('./public/javascript/es6/*.js')
      .pipe(babel({ presets: ['es2015', 'es2016', 'es2017'] }))
      .pipe(gulp.dest('./public/javascript/es5/'));
});
gulp.task('sass', () => {
    gulp.src('./public/styles/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rucksack())
        .pipe(autoprefixer({
          browsers: [
            'last 8 Chrome versions',
            'last 8 Firefox versions',
            'last 8 Explorer versions',
            'last 8 Edge versions',
            'last 8 iOS versions',
            'last 8 Opera versions',
            'last 8 Safari versions',
            'last 8 ExplorerMobile versions',
            'last 8 Android versions',
            'last 8 BlackBerry versions',
            'last 8 ChromeAndroid versions',
            'last 8 FirefoxAndroid versions',
            'last 8 OperaMobile versions',
            'last 8 OperaMini versions',
            'last 8 Samsung versions',
            'last 8 UCAndroid versions',
          ]
        }))
        .pipe(cssnano())
        .pipe(gulp.dest('./public/styles/css/'));
});

//Watch task
gulp.task('default', ['es6', 'sass'], () => {
    gulp.watch('./public/javascript/es6/*.js', ['es6']);
    gulp.watch('./public/styles/sass/*.scss', ['sass']);
});
