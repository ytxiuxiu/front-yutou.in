'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);

	grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['.tmp', 'dist'],
    },
    unzip: {
      'src/css/icons': 'src/css/icons.zip',
    },
    copy: {
      html: {
        files: {
          '.tmp/index.html': 'src/index.html',
        },
      },
      fonts: {
        files: [{
          expand: true,
          cwd: 'src/css/icons/fonts',
          src: '*.*',
          dest: 'dist/css/fonts',
        }],
      },
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
    imagemin: {
      img: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'dist/',
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
      templates: {
        files: {
          'dist/js/templates.min.js': ['.tmp/ngtemplates/templates.js'],
        },
      },
    },

    usemin: {
      html: '.tmp/index.html'
    },

    ngtemplates: {
      app: {
        cwd: '.tmp/htmlmin',
        src: 'templates/**/*.html',
        dest: '.tmp/ngtemplates/templates.js',
      },
    },

    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true,
      },
      html: {
        files: [{
          src: '.tmp/index.html',
          dest: 'dist/index.html',
        }],
      },
      templates: {
        files: [{
          expand: true,
          cwd: 'src',
          src: 'templates/**/*.html',
          dest: '.tmp/htmlmin',
        }],
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
      unzip: {
        files: ['src/css/icons.zip'],
        tesks: ['unzip'],
      }
    },
	});

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('build', [
    'clean',
    'unzip',
    'copy',
    'htmlmin:templates',
    'sass',
    'imagemin',
    'useminPrepare', 
    'ngtemplates',
    'concat:generated', 
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'htmlmin:html',
    'uglify:templates',
    'connect:build',
    'open:build',
    'watch'
  ]);

  grunt.registerTask('default', [
    'sass',
    'unzip',
    'connect:dev',
    'open:dev',
    'watch'
  ]);

};