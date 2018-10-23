'use strict';
const fs    = require('fs');
const utils = require('./utils');

/**
 * getRules - description
 *
 * @param  {type} path     description
 * @param  {type} encoding description
 * @return {type}          description
 */
function getRules(path, encoding) {
  let rules, buffer;

  try {
    buffer = fs.readFileSync(path, { encoding });
    rules = JSON.parse(buffer);
  } catch (error) {
    throw Error(error);
  }

  return rules;
}

/**
 * resource - description
 *
 * @param  {type} next    description
 * @param  {type} url     description
 * @param  {type} baseUrl description
 * @return {type}         description
 */
function resource(url, baseUrl) {
  let base = (baseUrl) ? baseUrl.match(/([A-Z])\w+/gi) : '';
  let lengthOfTheBaseUrl = (base) ? base.length : 0;
  let arr = url.match(/([A-Z])\w+/gi);

  if (arr) {
    arr = arr.splice(lengthOfTheBaseUrl);
    return arr[0];
  }
  return false;
}

/**
 * getPolicy - description
 *
 * @param  {type} permissions description
 * @param  {type} resource    description
 * @return {type}             description
 */
function getPolicy(permissions, resource) {
  let policy = permissions.find(item => item.resource === resource);

  if (policy) {
    return {
      methods: policy.methods
    };
  }
  return policy;
}

/**
 * getRole - description
 *
 * @param  {type} res     description
 * @param  {type} decoded description
 * @param  {type} session description
 * @return {type}         description
 */
function getRole(decoded, session) {
  if (decoded && decoded.role) {
    return String(decoded.role);
  }

  if (session && session.role) {
    return session.role;
  }

  return false;
}

/**
 * getGroup - description
 *
 * @param  {type} permissions description
 * @param  {type} group       description
 * @return {type}             description
 */
function getGroup(permissions, group) {

    let groupII =group.replace(/["']/g, "");
    let permissionsForGroup = permissions.find(item => item.group === groupII);
    return permissionsForGroup ? permissionsForGroup.permissions : false;
}

module.exports = {
  getRules: getRules,
  resource: resource,
  getPolicy: getPolicy,
  getRole: getRole,
  getGroup: getGroup
};
