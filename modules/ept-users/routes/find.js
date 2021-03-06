var Joi = require('@hapi/joi');
var _ = require('lodash');
var Boom = require('boom');
var querystring = require('querystring');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /users/:username Find
  * @apiName FindUser
  * @apiDescription Find a user by their username.
  *
  * @apiParam {string} username The username of the user to find
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} username The user's username
  * @apiSuccess {string} avatar URL to the user's avatar image
  * @apiSuccess {boolean} ignored Boolean idicating if user is being ignored
  * @apiSuccess {number} activity The user's activity number
  * @apiSuccess {string} signature The user's signature with any markup tags converted and parsed into html elements
  * @apiSuccess {string} raw_signature The user's signature as it was entered in the editor by the user
  * @apiSuccess {number} priority The user's role priority
  * @apiSuccess {number} post_count The number of posts made by this user
  * @apiSuccess {string[]} collapsed_categories Array containing id of categories the user collapsed
  * @apiSuccess {string[]} ignored_boards Array containing id of boards the user ignores
  * @apiSuccess {number} posts_per_page Preference indicating the number of posts the user wants to view per page
  * @apiSuccess {number} threads_per_page Preference indicating the number of threads the user wants to view per page
  * @apiSuccess {string} name The user's actual name (e.g. John Doe)
  * @apiSuccess {string} website URL to the user's website
  * @apiSuccess {string} gender The user's gender
  * @apiSuccess {timestamp} dob The user's date of birth
  * @apiSuccess {string} location The user's location
  * @apiSuccess {string} language The user's native language (e.g. English)
  * @apiSuccess {timestamp} created_at Timestamp of when the user's account was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the user's account was last updated
  * @apiSuccess {string[]} roles An array containing the users role lookups
  * @apiSuccess {string} role_name The name of the user's primary role
  * @apiSuccess {string} role_highlight_color The hex color to highlight the user's primary role
  *
  * @apiError (Error 404) NotFound The user was not found
  * @apiError (Error 500) InternalServerError There was an error looking up the user
  */
module.exports = {
  method: 'GET',
  path: '/api/users/{username}',
  options: {
    app: { hook: 'users.find' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: Joi.object({ username: Joi.string().required() }) },
    pre: [
      { method: (request) => request.server.methods.auth.users.find(request.server, request.auth, request.params), assign: 'view' },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ],
    handler: function(request) {
      return request.pre.processed;
    }
  }
};

function processing(request) {
  // get logged in user id
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }

  // get user by username
  var adminView = request.pre.view;
  var username = querystring.unescape(request.params.username);
  var promise = request.db.users.userByUsername(username)
  .then(function(user) {
    if (!user) { return Boom.notFound(); }
    delete user.passhash;
    delete user.confirmation_token;
    delete user.reset_token;
    delete user.reset_expiration;
    if (!adminView) {
      delete user.email;
      delete user.posts_per_page;
      delete user.thread_per_page;
      delete user.collapsed_categories;
      delete user.ignored_boards;
    }
    else {
      user.posts_per_page = user.posts_per_page || 25;
      user.threads_per_page = user.threads_per_page || 25;
      user.collapsed_categories = user.collapsed_categories || [];
      user.ignored_boards = user.ignored_boards || [];
    }
    user.priority = _.min(user.roles.map(function(role) { return role.priority; }));
    user.roles = user.roles.map(function(role) { return role.lookup; });
    if (user.roles.length < 1) { user.roles.push('user'); }
    return user;
  })
  .error(request.errorMap.toHttpError);

  return promise;
}
