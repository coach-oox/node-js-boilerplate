import gulp, { series } from "gulp";
import del from "del";
import image from "gulp-image";
import autoprefixer from "gulp-autoprefixer";
import pug from "gulp-pug";
import sass from "gulp-sass";
import minify from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import webserver from "gulp-webserver";
import ghPages from "gulp-gh-pages";
sass.compiler = require("node-sass");

const path = {
    image: {
        src: "src/images/*",
        dset: "build/images",
    },
    pug: {
        watch: "src/*.pug",
        src: "src/index.pug",
        dest: "build",
    },
    scss: {
        watch: "src/scss/*.scss",
        src: "src/scss/style.scss",
        dest: "build",
    },
    js: {
        watch: "src/js/*.js",
        src: "src/js/*.js",
        dest: "build/js",
    },
};

function compileImage() {
    return gulp
        .src(path.image.src)
        .pipe(image())
        .pipe(gulp.dest(path.image.dset));
}

function compilePug() {
    return gulp
        .src(path.pug.src)
        .pipe(pug())
        .pipe(gulp.dest(path.pug.dest));
}

function compileScss() {
    return gulp
        .src(path.scss.src)
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(gulp.dest(path.scss.dest));
}

function compileJs() {
    return gulp
        .src(path.js.src)
        .pipe(
            bro({
                transform: [
                    babelify.configure({
                        presets: ["@babel/preset-env"],
                    }),
                    ["uglifyify", { global: true }],
                ],
            })
        )
        .pipe(gulp.dest(path.js.dest));
}

function devServer() {
    return gulp
        .src("build")
        .pipe(webserver({ livereload: true, open: true }));
}

function ghDeploy() {
    return gulp.src("build/**/*").pipe(ghPages());
}

function clean() {
    return del(["build"]);
}

function watch() {
    gulp.watch(path.pug.watch, gulp.series(compilePug));
    gulp.watch(path.scss.watch, gulp.series(compileScss));
    gulp.watch(path.js.watch, gulp.series(compileJs));
}

const build = gulp.series(
    clean,
    compileImage,
    compilePug,
    compileScss,
    compileJs
);

const dev = gulp.parallel(devServer, watch);

gulp.task("start", gulp.series(build, dev));
gulp.task("deploy", gulp.series(build, ghDeploy));
