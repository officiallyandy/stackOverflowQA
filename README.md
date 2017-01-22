# mHelpDesk Engineering Angular 1.x Challenge

## Overview
You should build a small app that communicates with the Stack Overflow API. We recommend spending about an hour, but feel free to spend more or less time.

The app will show a list of questions, and clicking on a question will load that question and some answers.

## Running
This setup was tested with node `6.x`

After running `npm install` or `yarn`, you will have access to a webpack server.

Run `npm run dev` to start the server

## API
Use the StackOverflow [API Docs](https://api.stackexchange.com/docs) to make all Rest API calls.

Do not worry about using an access token, you should be able to use the un-authenticated routes for this challenge.

Try using their api query designer and editing the Filter to return all extra fields you need to display.

## Libraries
* [angular-ui-router](https://ui-router.github.io/ng1/)

### Webpack
There are a bunch of webpack plugins for loading ES6, [object spread](http://redux.js.org/docs/recipes/UsingObjectSpreadOperator.html)
and css modules.

Add whatever additional libraries you need, or throw away our boilerplate if you like!

## Specs

### Questions
* Display a list of the "hot" questions from Stack Overflow
* Display the Question Title and Owner's display name as a list
* See the actual site for some examples [here](http://stackoverflow.com/?tab=hot)
* Clicking on a question will load an Answer View

### Answers
* Display the Question Title, Question Body and Owner's display name
    * Don't worry too much about formatting the question body. Their API is tailored to HTML and can sometimes be tricky to format
* Display the Answers, and indicate the accepted answer
* Display the Answer Scores


## Extra ideas
* Make it look nicer
* Display dates
* Display a link / button to open on the Stack Overflow website from the Answer page
