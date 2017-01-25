import angular from 'angular';
import ngResource from 'angular-resource';
import './app.css';
import './app.scss';


const app = () => {
  return {
    template: require('./app.html'),
    controller: 'AppCtrl',
    controllerAs: 'app'
  }
};

const stackOverflowDao = function($http) {
  this.$inject = ['$http'];
  const baseUrl = 'https://api.stackexchange.com/2.2/questions/featured?order=desc&sort=activity&site=stackoverflow';

  return { 
    getQuestions: getQuestions 
  };


  function getQuestions(){
    const request = {
      method: 'GET',
      url: `${baseUrl}`,
      headers: { 'Content-Type': 'application/json' }
    }

    return $http(request);
  }
};
const stackOverflowDataService = function(stackOverflowDao) {
  this.$inject = ['stackOverflowDao'];

  return {
    getQuestions: getQuestions
  };

  function getQuestions() {
    return stackOverflowDao.getQuestions();
  }
};


const AppCtrl = function(stackOverflowDataService){
  this.$inject = ['stackOverflowDataService'];
  const vm = this;

  stackOverflowDataService
    .getQuestions()
    .then(displayResults);

  function displayResults(results){
    console.log('questions query results: ', results);
    vm.questions = results;
  }
}

const MODULE_NAME = 'app';
angular.module(MODULE_NAME, [])
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)
  .factory('stackOverflowDataService', stackOverflowDataService)
  .factory('stackOverflowDao', stackOverflowDao)
 