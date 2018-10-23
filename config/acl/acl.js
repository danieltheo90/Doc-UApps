'use strict';
const helper  = require('./helpers');
const utils   = require('./utils');
let opt       = {};

/**
 * config - description
 *
 * @param  {type} config description
 * @return {type}        description
 */
function config(config) {
  let options = config || {};
  opt.baseUrl = options.baseUrl;

  let defaultFilename = options.filename || 'acl.json';
  let filename = options.filename ? options.filename : defaultFilename;
  let path = filename && options.path ? (`${options.path}/${filename}`) : filename;

  opt.rules = helper.getRules(path, options.encoding);

  return opt.rules;
}

/**
 * authorize - description
 *
 * @param  {type} req  description
 * @param  {type} res  description
 * @param  {type} next description
 * @return {type}      description
 */
function authorize(req, res, next) {
  let method = req.method;
  let resource = helper.resource(req.originalUrl, opt.baseUrl);

  if(!resource) {
    var err = new Error('REQUIRED: Resource not found');
    err.status = 403;
    return next(err);
  }

  let role = helper.getRole(req.decoded, req.session);
  let groupPermissions = helper.getGroup(opt.rules, role);
  if (!groupPermissions || groupPermissions.length === 0) {
    var err = new Error('REQUIRED: Group not found');
    err.status = 403;
    return next(err);
  }

  let policy = helper.getPolicy(groupPermissions, resource);
  let methods = (policy) ? policy.methods : [];

  if (!policy) {
    var err = new Error('REQUIRED: Policy not found');
    err.status = 403;
    return next(err);
  }

  var available = utils.checkMethodPermission(method, methods, req.query);

  if (available) {
    return next();
  } else {
    var err = new Error('UNAUTHORIZED: Method or query string');
    err.status = 403;
    return next(err);
  }
}

module.exports = {
  config: config,
  authorize: authorize
};
