'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var jsonContentTypes = exports.jsonContentTypes = ['application/json', 'application/vnd.api+json'];

var noop = exports.noop = function noop() {};

var apiRequest = exports.apiRequest = function apiRequest(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return fetch(url, options).then(function (res) {
    if (res.status >= 200 && res.status < 300) {
      if (res.status === 204) {
        return res;
      } else if (jsonContentTypes.some(function (contentType) {
        return res.headers.get('Content-Type').indexOf(contentType) > -1;
      })) {
        return res.json();
      }
    }

    var e = new Error(res.statusText);
    e.response = res;
    throw e;
  });
};