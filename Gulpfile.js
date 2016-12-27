const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', () => {
    gulp.src('./styles/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
          browsers: ['last 8 versions'],
          cascade: true
        }))
        .pipe(gulp.dest('./styles/css/'));
});

gulp.task('es6', () => {
  return gulp.src('./javascript/es6/*.js')
      .pipe(babel({ presets: ['es2015'] }))
      .pipe(gulp.dest('./javascript/es5/'));
});

//Watch task
gulp.task('default', ['sass', 'es6'], () => {
    gulp.watch('./styles/sass/*.scss', ['sass']);
    gulp.watch('./javascript/es6/*.js', ['es6']);
});
