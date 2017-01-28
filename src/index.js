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
  const baseUrl = 'https://api.stackexchange.com/2.2/questions';

  return { 
    getQuestions: getQuestions,
    getAnswersForQuestion: getAnswersForQuestion
  };


  function getQuestions(pageNumber=1, pagesize=10, sortOrder='desc'){
    const queryUrl = `${baseUrl}/featured?page=${pageNumber}&pagesize=${pagesize}&order=${sortOrder}&sort=activity&site=stackoverflow`;
    const request = {
      method: 'GET', url: queryUrl, headers: { 'Content-Type': 'application/json' }
    }

    return $http(request);
  }
  function getAnswersForQuestion(questionId){
    const queryUrl = `${baseUrl}/${questionId}/answers?order=desc&sort=activity&site=stackoverflow`;
    const request = {
      method: 'GET', url: queryUrl, headers: { 'Content-Type': 'application/json' }
    }

    return $http(request);
  }
};

const stackOverflowDataService = function(stackOverflowDao) {
  this.$inject = ['stackOverflowDao'];

  return {
    getQuestionsWithAnswers: getQuestionsWithAnswers,
    getAnswersForQuestion: getAnswersForQuestion
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
  function getAnswersForQuestion(questionId){
    return stackOverflowDao.getAnswersForQuestion(questionId);
  }
};

const unsafeFilter = function ($sce) {
   return function (val) {
      if( (typeof val == 'string' || val instanceof String) ) {
         return $sce.trustAsHtml(val);
      }
   }; 
};


const AppCtrl = function(stackOverflowDataService){
  this.$inject = ['stackOverflowDataService'];
  const vm = this;

  vm.initialize = initialize;
  vm.getAnswersForQuestion = getAnswersForQuestion;

  initialize();


  function initialize(){
    stackOverflowDataService
      .getQuestionsWithAnswers()
      .then(displayResults);

    function displayResults(results){
      console.log('questions query results: ', results);
      vm.questions = results;
    }
  }

  function getAnswersForQuestion(questionId=0){
      stackOverflowDataService
        .getAnswersForQuestion(questionId)
        .then(displayResults);

    function displayResults(results){
      console.log('answers for question query results: ', results);
      vm.answers = results;
    }  
  }
};

const MODULE_NAME = 'app';
angular.module(MODULE_NAME, [])
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)
  .factory('stackOverflowDataService', stackOverflowDataService)
  .factory('stackOverflowDao', stackOverflowDao)
  .filter('unsafe', unsafeFilter);
 