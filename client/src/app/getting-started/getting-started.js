(function() {
  'use strict';

  /**
   * @name  config
   * @description config block
   */
  function config($stateProvider) {
    $stateProvider
      .state('root.getting-started', {
        url: '/',
        views: {
          '@': {
            templateUrl: 'src/app/getting-started/getting-started.tpl.html',
            controller: 'GettingStartedCtrl as start'
          }
        }
      });
  }

  /**
   * @name  gettingStartedCtrl
   * @description Controller
   */
  function GettingStartedCtrl($log, $state, Backand, BackandService,Underscore) {

    var start = this;

    (function init() {
      start.username = '';
      start.password = '';
      start.appName = '';
      start.objects = null;
      start.isLoggedIn = false;
      start.objectData = '{}';
      start.results = 'Not connected to Backand yet';
      start.content = [];
      start.configFile = [];
      start.pageNum = 1;
      start.selectedDateTime = {
        value:new Date(2015,11,25)
      };
      start.defaultObject = ['clientSystemId','createdAt','date','firstName','groupId','id','lastName','objectId','time','updatedAt'];
      loadObjects();
    }());


    start.signin = function () {

      Backand.setAppName(start.appName);

      Backand.signin(start.username, start.password)
        .then(
        function () {
          start.results = "you are in";
          loadObjects();
        },
        function (data, status, headers, config) {
          $log.debug("authentication error", data, status, headers, config);
          start.results = data;
        }
      );
    };

    start.signout = function (){
      Backand.signout();
      $state.go('root.getting-started',{}, {reload: true});
    }

    function loadObjects() {
      BackandService.listOfObjects().then(loadObjectsSuccess, errorHandler);
    }

    function loadObjectsSuccess(list) {
      start.objects = list.data.data;
      start.results = "Objects loaded";
      start.isLoggedIn = true;
    }

    start.loadObjectData = function(){
      //BackandService.objectData(start.objectSelected).then(loadObjectDataSuccess, errorHandler);
    }

    start.loadObjectDataFiltered = function(){
      BackandService.objectData(start.objectSelected,1000,start.pageNum,"", JSON.stringify([ {    "fieldName": "createdAt",    "operator": "greaterThan",    "value": start.latestObjectDate  }])).then(
        loadObjectDataSuccess, errorHandler
      )
    }

    start.loadLatestObjectDataFiltered = function(){
      BackandService.objectData(start.objectSelected,1,1, JSON.stringify([ {    "fieldName": "createdAt",    "order": "desc"  }])).then(
        loadLatestObjectDataFilteredSuccess, errorHandler
      )
    }

    function loadLatestObjectDataFilteredSuccess(ObjectData) {
      if (ObjectData.data.data.length > 0) {
        start.latestObjectDate = ObjectData.data.data[0].createdAt;
      }else{
        var tempDate = new Date();
        tempDate.setMonth(tempDate.getMonth()-3);
        start.latestObjectDate = tempDate;
      }
    }


    function filterResultData() {

      var filterdValues = [];
      angular.forEach(start.objectData, function(value, key) {
        value = _.pick(value,start.defaultObject);
        angular.forEach(Object.keys(start.configFile.config[0]),function(key,index){
          if (value[key] < start.configFile.config[0][key]){
           value[key] = undefined;
          }
        })
        this.push(value);
      }, filterdValues);
      console.log(filterdValues);
      if (filterdValues.length > 0) {
        start.uploadData('testsResultsFiltered', filterdValues);
      }
      if (start.objectData.length >= 1000){
        start.pageNum +=1;
        start.loadObjectDataFiltered();
      }


    }

    function loadObjectDataSuccess(ObjectData) {
      start.objectData = ObjectData.data.data;
      filterResultData();
    }

    function errorHandler(error, message) {
      $log.debug(message, error)
    }

    start.showContent = function($fileContent){
      start.content = $fileContent;
      start.content = JSON.parse(start.content);
    };

    start.readConfigFile = function($fileContent){
      start.configFile = $fileContent;
      start.configFile = JSON.parse(start.configFile);
      start.defaultObject.push.apply(start.defaultObject,_.allKeys(start.configFile.config[0]));

    };

    start.uploadData = function(tableName,values){
        BackandService.postObjectData(tableName,values).then(
          function success(data){
            console.log(data);
          },
          function error(err){
            console.error(err);
          }
        )
    }
  }

  angular.module('getting-started', [])
    .config(config)
    .controller('GettingStartedCtrl', ['$log', '$state', 'Backand','BackandService', GettingStartedCtrl]);
})();
