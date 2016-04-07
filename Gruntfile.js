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
      templates: {
        files: [{
          expand: true,
          cwd: 'src/templates',
          src: '**/*.html',
          dest: '.tmp/templates'
        }]
      },
      fonts: {
        files: [{
          expand: true,
          cwd: 'src/css/icons/fonts',
          src: '*.*',
          dest: 'dist/css/fonts',
        }],
      },
      dev: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.*',
          dest: 'dev'
        }]
      }
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
      html: '.tmp/index.html',
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
          'dist/js/templates.js': ['.tmp/ngtemplates/templates.js'],
        },
      },
    },

    filerev: {
      options: {
        process: function(basename, name, extension) {
          return basename + '-' + name + '.' + extension;
        }
      },
      assets: {
        src: [
          'dist/js/**/*.js',
          'dist/css/**/*.{css,eot,svg,ttf,woff}',
          'dist/images/**/*.{png,jpg,jpeg,gif}',
        ]
      },
      templates: {
        src: 'dist/js/templates.js'
      }
    },

    usemin: {
      html: ['.tmp/index.html', '.tmp/templates/**/*.tpl.html'],
      css: 'dist/css/**/*.css',
      options: {
        assetsDirs: ['dist', 'dist/images', 'dist/css', 'dist/css/fonts'] 
      }
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
          cwd: '.tmp',
          src: 'templates/**/*.html',
          dest: '.tmp/htmlmin',
        }],
      },
    },

    ngtemplates: {
      app: {
        cwd: '.tmp/htmlmin',
        src: 'templates/**/*.html',
        dest: '.tmp/ngtemplates/templates.js',
      },
    },

    cloudinary: {
      options: {
        roots: [
          'dist'
        ]
      },
      // templates: {
      //   files: [{
      //     expand: true,
      //     cwd: 'src',
      //     src: ['templates/**/*.html'],
      //     dest: '.tmp/cloudinary'
      //   }]
      // },
      assets: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: ['css/**/*.css', '**/*.html'],
          dest: 'dist'
        }],
      },
    },

    replace: {
      dev: {
        options: {
          patterns: [{
            match: /<!-- env:product -->(.|\s)*?<!-- endenv -->/g,
            replacement: ''
          }, {
            match: /\/\* env:product \*\/(.|\s)*?\/\* endenv \*\//g,
            replacement: ''
          }]
        },
        files: [{
          expand: true,
          cwd: 'dev',
          src: ['js/**/*.js', 'index.html', 'css/**/*.css'],
          dest: 'dev'
        }]
      },
      product: {
        options: {
          patterns: [{
            match: /<!-- env:dev -->(.|\s)*?<!-- endenv -->/g,
            replacement: ''
          }, {
            match: /\/\* env:dev \*\/(.|\s)*?\/\* endenv \*\//g,
            replacement: ''
          }]
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: ['js/**/*.js', 'index.html', 'css/**/*.css'],
          dest: '.tmp'
        }]
      }
    },

    connect: {
      options: {
        hostname: '0.0.0.0'
      },
      dev: {
        options: {
          port: 8000,
          base: ['.', 'dev'],
          livereload: true,
        },
      },
      build: {
        options: {
          port: 8000,
          base: ['dist'],
          keepalive: true
        }
      },
    },
    open: {
      dev: {
        url: 'http://localhost:88/',
      },
      build: {
        url: 'http://localhost:88/'
      },
    },
    watch: {
      html: {
        files: ['src/**/*.html', 'src/**/*.js', 'src/**/*.css', 'src/**/*.json'],
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
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-cloudinary-upload');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('build', [
    'clean',
    'replace:product',
    'unzip',
    'copy:templates',
    'copy:fonts',
    'sass',
    'imagemin',
    'useminPrepare', 
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'filerev:assets',
    'usemin',
    'htmlmin:templates',
    // 'cloudinary:templates',
    'ngtemplates',
    'uglify:templates',
    'filerev:templates',
    'usemin:html',
    'htmlmin:html',
    'cloudinary:assets',
    'connect:build',
    'open:build',
    'watch'
  ]);

  grunt.registerTask('default', [
    'sass',
    'copy:dev',
    'replace:dev',
    'unzip',
    'connect:dev',
    'open:dev',
    'watch'
  ]);

};