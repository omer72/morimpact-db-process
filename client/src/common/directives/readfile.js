(function() {
  'use strict';

  function readFileDir($parse) {
    return {
      restrict: 'A',
      /*jshint unused:false*/
      link: function(scope, elm, attrs) {
        var fn = $parse(attrs.onReadFile);
        elm.on('change', function (onChangeEvent) {
          var reader = new FileReader();

          reader.onload = function (onLoadEvent) {
            scope.$apply(function () {
              fn(scope, {$fileContent: onLoadEvent.target.result});
            });
          };

          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        })
      }
    };
  }

  angular.module('common.directives.readfile', [])
    .directive('onReadFile', readFileDir);
})();
