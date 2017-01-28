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
  const baseUrl = 'https://api.stackexchange.com/2.2/questions/featured?page=';

  return { 
    getQuestions: getQuestions 
  };


  function getQuestions(pageNumber=1, pagesize=10, sortOrder='desc'){
    const request = {
      method: 'GET',
      url: `${baseUrl}${pageNumber}&pagesize=${pagesize}&order=${sortOrder}&sort=activity&site=stackoverflow`,
      headers: { 'Content-Type': 'application/json' }
    }

    return $http(request);
  }
};
const stackOverflowDataService = function(stackOverflowDao) {
  this.$inject = ['stackOverflowDao'];

  return {
    getQuestionsWithAnswers: getQuestionsWithAnswers
  };

  // This function is intentionally private
  function getQuestions() {
    return stackOverflowDao.getQuestions();
  }
  function getQuestionsWithAnswers(questions = []){
    if (questions.length === 0) {
      return getQuestions().then(filterForAnsweredQuestions);
    }

    return filterForAnsweredQuestions(questions);


    function filterForAnsweredQuestions(queryResult) {
      const questionsWithAnswers = queryResult.data.items.filter(i => i.answer_count > 0);
      return questionsWithAnswers;
    }
  }
};


const AppCtrl = function(stackOverflowDataService){
  this.$inject = ['stackOverflowDataService'];
  const vm = this;

  stackOverflowDataService
    .getQuestionsWithAnswers()
    .then(displayResults);

  function displayResults(results){
    console.log('questions query results: ', results);
    vm.questions = results;
  }
};

const MODULE_NAME = 'app';
angular.module(MODULE_NAME, [])
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)
  .factory('stackOverflowDataService', stackOverflowDataService)
  .factory('stackOverflowDao', stackOverflowDao)
  .filter('unsafe', function ($sce) {
   return function (val) {
      if( (typeof val == 'string' || val instanceof String) ) {
         return $sce.trustAsHtml(val);
      }
   };
});
 