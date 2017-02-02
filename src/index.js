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
  const baseUrl = 'https://api.stackexchange.com/2.2';

  return { 
    getQuestions: getQuestions,
    getAnswersForQuestion: getAnswersForQuestion
  };


  function getQuestions(pageNumber=1, pagesize=10, sortOrder='desc'){
    const queryUrl = `${baseUrl}/questions/featured?page=${pageNumber}&pagesize=${pagesize}&order=${sortOrder}&sort=activity&site=stackoverflow`;
    const request = {
      method: 'GET', url: queryUrl, headers: { 'Content-Type': 'application/json' }
    }

    return $http(request);
  }
  function getAnswersForQuestion(questionId){
    // TODO: Looks like these call backs aren't actually waiting for each promise to resolve... 

    return getAnswersMetaDataForQuestions(questionId)
            .then(getCompleteAnswersInfoForQuestion)
            .then(filterToFirstAnswer);


    function getAnswersMetaDataForQuestions(questionId){
      const questionQueryUrl = `${baseUrl}/questions/${questionId}/answers?order=desc&sort=activity&site=stackoverflow`;
      const questionsRequest = {
        method: 'GET', url: questionQueryUrl, headers: { 'Content-Type': 'application/json' }
      };

      return $http(questionsRequest);
    }

    function getCompleteAnswersInfoForQuestion(questionAnswerResult){
      console.log('question / answer meta info: ', questionAnswerResult);
      
      const metaData = questionAnswerResult.data.items;
      const answerId = (metaData.length > 0) ? metaData[0].answer_id : 0;
      const answerQueryUrl = `${baseUrl}/answers/${answerId}?order=desc&sort=activity&site=stackoverflow&filter=!9YdnSMKKT`;
      const answersRequest = {
        method: 'GET', url: answerQueryUrl, headers: { 'Content-Type': 'application/json' }
      };

      return $http(answersRequest);
    }

    function filterToFirstAnswer(answersResult){ 
      // console.log(answersResult.data);
      return answersResult.data.items[0]; 
    }
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


const AppCtrl = function($sce, stackOverflowDataService){
  this.$inject = ['$sce', 'stackOverflowDataService'];
  const vm = this;

  vm.initialize = initialize;
  vm.getAnswersForQuestion = getAnswersForQuestion;

  initialize();
 

  function initialize(){
    stackOverflowDataService
      .getQuestionsWithAnswers()
      .then(displayResults)
      .catch(oopsMyBad);

    function displayResults(results){
      console.log('questions query results: ', results);
      vm.questions = results;
    }
  }

  function getAnswersForQuestion(questionId=0){
      stackOverflowDataService
        .getAnswersForQuestion(questionId)
        .then(displayResults)
        .catch(oopsMyBad);

    function displayResults(results){
      console.log('answers for question query results: ', results);
      vm.answers = results;
      vm.answers.body = `<p>You can do it like :</p>
<p><div class=\"snippet\" data-lang=\"js\" data-hide=\"false\" data-console=\"true\" data-babel=\"false\">
<div class=\"snippet-code\">
<pre class=\"snippet-code-js lang-js prettyprint-override\"><code>(function($){
  $(function(){
    $(\"#RunCode\").click(function(e){
      var FormData = [];
      $(\"#form input.serialize\").each(function(){
        var name = $(this).attr(\"name\");
        name = name.split(\"[\")
        var id = name[1].replace(\"]\", \"\");
        name = name[0];
        if(typeof FormData[id] == \"undefined\"){ FormData[id] = {}; }
        FormData[id][name] = $(this).val();
        console.log(name, id, $(this).val(), FormData);
      });
      var str = JSON.stringify(FormData);
      alert(str);
      
      e.preventDefault();
      return false;
    });
  });
})(jQuery);</code></pre>
<pre class=\"snippet-code-html lang-html prettyprint-override\"><code>&lt;script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js\"&gt;&lt;/script&gt;
&lt;form id=\"form\"&gt;
    &lt;div&gt;
    &lt;input class=\"serialize\" type=\"hidden\" name=\"id[0]\" value=\"1\"&gt;
    &lt;input class=\"serialize\" name=\"quantity[0]\" min=\"0\" type=\"text\" value=\"10\" /&gt;
    &lt;/div&gt;
    &lt;div&gt;
    &lt;input class=\"serialize\" type=\"hidden\" name=\"id[1]\" value=\"2\"&gt;
    &lt;input class=\"serialize\" name=\"quantity[1]\" min=\"0\" type=\"text\" value=\"20\" /&gt;
    &lt;/div&gt;
    &lt;div&gt;
    &lt;input class=\"serialize\" type=\"hidden\" name=\"id[2]\" value=\"3\"&gt;
    &lt;input class=\"serialize\" name=\"quantity[2]\" min=\"0\" type=\"text\" value=\"30\" /&gt;
    &lt;/div&gt;
    &lt;input type=\"button\" id=\"RunCode\" value=\"Run Code\" /&gt;
&lt;/form&gt;</code></pre>
</div>
</div>
</p>`; 

    }  
  }

  function oopsMyBad(e){
    console.log('Error: ', e);
    alert('Error Occurred', e.toString());
  }
};

const MODULE_NAME = 'app';
angular.module(MODULE_NAME, [])
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)
  .factory('stackOverflowDataService', stackOverflowDataService)
  .factory('stackOverflowDao', stackOverflowDao)
  .filter('unsafe', unsafeFilter);
 