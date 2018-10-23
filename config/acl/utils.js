'use strict';

/**
 * checkMethodPermission - description
 *
 * @param  {type} method      description
 * @param  {type} methods     description
 * @param  {type} queryString description
 * @return {type}             description
 */
function checkMethodPermission(method, methods, queryString) {
  let methodSelected = methods.find(item => item.http === method);
  if (methodSelected) {
    // if (methodSelected.http === 'GET' && (Object.keys(queryString).length)) {
    //   var arr = methodSelected.qs || [];
    //   return Object.keys(queryString).every(function(key) {
    //     return arr.includes(key);
    //   });
    // }
    return true;
  }
  return false;
}

module.exports = {
  checkMethodPermission: checkMethodPermission
};
