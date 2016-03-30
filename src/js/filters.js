/**
 * app.filters Module
 *
 * Description
 */
angular.module('app.filters', [])
  .filter('marked', function() {
    return function(input) {
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
      });
      return marked(input);
    };
  });