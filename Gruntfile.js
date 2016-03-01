'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);

	grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['dist'],
    },

    sass: {
      app: {
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['*.scss'],
          dest: 'src/css',
          ext: '.css',
        }],
      },
    },
    copy: {
      html: {
        src: 'src/index.html',
        dest: 'dist/index.html',
      },
    },
    imagemin: {
      img: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'dist/'
        }],
      },
    },
    useminPrepare: {
      html: 'src/index.html',
      options: {
        dest: 'dist',
      },
    },
    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
      },
    },

    usemin: {
      html: 'dist/index.html'
    },

    ngtemplates: {
      app: {
        cwd: 'src',
        src: 'templates/**/*.html',
        dest: 'dist/js/templates.js',
      },
    },

    connect: {
      dev: {
        options: {
          port: 8000,
          base: ['.', 'src'],
          livereload: true,
        },
      },
      build: {
        options: {
          port: 8001,
          base: ['dist'],
        }
      },
    },
    open: {
      dev: {
        url: 'http://localhost:8000/',
      },
      build: {
        url: 'http://localhost:8001/'
      },
    },
    watch: {
      html: {
        files: ['src/**/*.html', 'src/**/*.js', 'src/**/*.css'],
        options: {
          livereload: true,
          spawn: false,
        },
      },
      sass: {
        files: ['src/css/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: true,
          spawn: false,
        },
      },
    },
	});

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('build', [
    'clean',
    'copy',
    'sass',
    'imagemin',
    'useminPrepare', 
    'ngtemplates',
    'concat', 
    'cssmin',
    'uglify',
    'usemin',
    'connect:build',
    'open:build',
    'watch'
  ]);

  grunt.registerTask('default', [
    'sass',
    'connect:dev',
    'open:dev',
    'watch'
  ]);

};