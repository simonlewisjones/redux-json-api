'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducer = exports.requireEntity = exports.deleteEntity = exports.updateEntity = exports.readEndpoint = exports.createEntity = exports.uploadFile = exports.setAccessToken = exports.setHeader = exports.setHeaders = exports.setEndpointPath = exports.setEndpointHost = exports.IS_UPDATING = exports.IS_DELETING = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _handleActions;

var _reduxActions = require('redux-actions');

require('isomorphic-fetch');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _stateMutation = require('./state-mutation');

var _utils = require('./utils');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Entity isInvalidating values
var IS_DELETING = exports.IS_DELETING = 'IS_DELETING';
var IS_UPDATING = exports.IS_UPDATING = 'IS_UPDATING';

// Action creators
var setEndpointHost = exports.setEndpointHost = (0, _reduxActions.createAction)(_constants.API_SET_ENDPOINT_HOST);
var setEndpointPath = exports.setEndpointPath = (0, _reduxActions.createAction)(_constants.API_SET_ENDPOINT_PATH);
var setHeaders = exports.setHeaders = (0, _reduxActions.createAction)(_constants.API_SET_HEADERS);
var setHeader = exports.setHeader = (0, _reduxActions.createAction)(_constants.API_SET_HEADER);

var apiWillCreate = (0, _reduxActions.createAction)(_constants.API_WILL_CREATE);
var apiCreated = (0, _reduxActions.createAction)(_constants.API_CREATED);
var apiCreateFailed = (0, _reduxActions.createAction)(_constants.API_CREATE_FAILED);

var apiWillRead = (0, _reduxActions.createAction)(_constants.API_WILL_READ);
var apiRead = (0, _reduxActions.createAction)(_constants.API_READ);
var apiReadFailed = (0, _reduxActions.createAction)(_constants.API_READ_FAILED);

var apiWillUpdate = (0, _reduxActions.createAction)(_constants.API_WILL_UPDATE);
var apiUpdated = (0, _reduxActions.createAction)(_constants.API_UPDATED);
var apiUpdateFailed = (0, _reduxActions.createAction)(_constants.API_UPDATE_FAILED);

var apiWillDelete = (0, _reduxActions.createAction)(_constants.API_WILL_DELETE);
var apiDeleted = (0, _reduxActions.createAction)(_constants.API_DELETED);
var apiDeleteFailed = (0, _reduxActions.createAction)(_constants.API_DELETE_FAILED);

// Actions
var setAccessToken = exports.setAccessToken = function setAccessToken(at) {
  return function (dispatch) {
    dispatch(setHeader({ Authorization: 'Bearer ' + at }));
  };
};

var uploadFile = exports.uploadFile = function uploadFile(file, _ref) {
  var companyId = _ref.companyId,
      _ref$fileableType = _ref.fileableType,
      fileableType = _ref$fileableType === undefined ? null : _ref$fileableType,
      _ref$fileableId = _ref.fileableId,
      fileableId = _ref$fileableId === undefined ? null : _ref$fileableId;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$onSuccess = _ref2.onSuccess,
      onSuccess = _ref2$onSuccess === undefined ? _utils.noop : _ref2$onSuccess,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === undefined ? _utils.noop : _ref2$onError;

  console.warn('uploadFile has been deprecated and will no longer be supported by redux-json-api https://github.com/dixieio/redux-json-api/issues/2');

  return function (dispatch, getState) {
    var accessToken = getState().api.endpoint.accessToken;
    var path = [companyId, fileableType, fileableId].filter(function (o) {
      return !!o;
    }).join('/');
    var url = __API_HOST__ + '/upload/' + path + '?access_token=' + accessToken;

    var data = new FormData();
    data.append('file', file);

    var options = {
      method: 'POST',
      body: data
    };

    return fetch(url, options).then(function (res) {
      if (res.status >= 200 && res.status < 300) {
        if (_utils.jsonContentTypes.some(function (contentType) {
          return res.headers.get('Content-Type').indexOf(contentType) > -1;
        })) {
          return res.json();
        }

        return res;
      }

      var e = new Error(res.statusText);
      e.response = res;
      throw e;
    }).then(function (json) {
      onSuccess(json);
    }).catch(function (error) {
      onError(error);
    });
  };
};

var createEntity = exports.createEntity = function createEntity(entity) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$onSuccess = _ref3.onSuccess,
      onSuccess = _ref3$onSuccess === undefined ? _utils.noop : _ref3$onSuccess,
      _ref3$onError = _ref3.onError,
      onError = _ref3$onError === undefined ? _utils.noop : _ref3$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    dispatch(apiWillCreate(entity));

    var _getState$api$endpoin = getState().api.endpoint,
        apiHost = _getState$api$endpoin.host,
        apiPath = _getState$api$endpoin.path,
        headers = _getState$api$endpoin.headers;

    var endpoint = '' + apiHost + apiPath + '/' + entity.type;

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, {
        headers: headers,
        method: 'POST',
        credentials: 'include',
        body: (0, _stringify2.default)({
          data: entity
        })
      }).then(function (json) {
        dispatch(apiCreated(json.data));
        onSuccess(json);
        resolve(json);
      }).catch(function (error) {
        var err = error;
        err.entity = entity;

        dispatch(apiCreateFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var readEndpoint = exports.readEndpoint = function readEndpoint(endpoint) {
  var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref4$onSuccess = _ref4.onSuccess,
      onSuccess = _ref4$onSuccess === undefined ? _utils.noop : _ref4$onSuccess,
      _ref4$onError = _ref4.onError,
      onError = _ref4$onError === undefined ? _utils.noop : _ref4$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    dispatch(apiWillRead(endpoint));

    var _getState$api$endpoin2 = getState().api.endpoint,
        apiHost = _getState$api$endpoin2.host,
        apiPath = _getState$api$endpoin2.path,
        headers = _getState$api$endpoin2.headers;

    var apiEndpoint = '' + apiHost + apiPath + '/' + endpoint;

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)('' + apiEndpoint, {
        headers: headers,
        credentials: 'include'
      }).then(function (json) {
        dispatch(apiRead((0, _extends3.default)({ endpoint: endpoint }, json)));
        onSuccess(json);
        resolve(json);
      }).catch(function (error) {
        var err = error;
        err.endpoint = endpoint;

        dispatch(apiReadFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var updateEntity = exports.updateEntity = function updateEntity(entity) {
  var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref5$onSuccess = _ref5.onSuccess,
      onSuccess = _ref5$onSuccess === undefined ? _utils.noop : _ref5$onSuccess,
      _ref5$onError = _ref5.onError,
      onError = _ref5$onError === undefined ? _utils.noop : _ref5$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    dispatch(apiWillUpdate(entity));

    var _getState$api$endpoin3 = getState().api.endpoint,
        apiHost = _getState$api$endpoin3.host,
        apiPath = _getState$api$endpoin3.path,
        headers = _getState$api$endpoin3.headers;

    var endpoint = '' + apiHost + apiPath + '/' + entity.type + '/' + entity.id;

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, {
        headers: headers,
        method: 'PATCH',
        credentials: 'include',
        body: (0, _stringify2.default)({
          data: entity
        })
      }).then(function (json) {
        dispatch(apiUpdated(json));
        onSuccess(json);
        resolve(json);
      }).catch(function (error) {
        var err = error;
        err.entity = entity;

        dispatch(apiUpdateFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var deleteEntity = exports.deleteEntity = function deleteEntity(entity) {
  var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref6$onSuccess = _ref6.onSuccess,
      onSuccess = _ref6$onSuccess === undefined ? _utils.noop : _ref6$onSuccess,
      _ref6$onError = _ref6.onError,
      onError = _ref6$onError === undefined ? _utils.noop : _ref6$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    dispatch(apiWillDelete(entity));

    var _getState$api$endpoin4 = getState().api.endpoint,
        apiHost = _getState$api$endpoin4.host,
        apiPath = _getState$api$endpoin4.path,
        headers = _getState$api$endpoin4.headers;

    var endpoint = '' + apiHost + apiPath + '/' + entity.type + '/' + entity.id;

    return new _promise2.default(function (resolve, reject) {
      (0, _utils.apiRequest)(endpoint, {
        headers: headers,
        method: 'DELETE',
        credentials: 'include'
      }).then(function () {
        dispatch(apiDeleted(entity));
        onSuccess();
        resolve();
      }).catch(function (error) {
        var err = error;
        err.entity = entity;

        dispatch(apiDeleteFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

var requireEntity = exports.requireEntity = function requireEntity(entityType) {
  var endpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : entityType;

  var _ref7 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref7$onSuccess = _ref7.onSuccess,
      onSuccess = _ref7$onSuccess === undefined ? _utils.noop : _ref7$onSuccess,
      _ref7$onError = _ref7.onError,
      onError = _ref7$onError === undefined ? _utils.noop : _ref7$onError;

  if (onSuccess !== _utils.noop || onError !== _utils.noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return function (dispatch, getState) {
    return new _promise2.default(function (resolve, reject) {
      var _getState = getState(),
          api = _getState.api;

      if (api.hasOwnProperty(entityType)) {
        resolve();
        return onSuccess();
      }

      dispatch(readEndpoint(endpoint, { onSuccess: onSuccess, onError: onError })).then(resolve).catch(reject);
    });
  };
};

// Reducers
var reducer = exports.reducer = (0, _reduxActions.handleActions)((_handleActions = {}, (0, _defineProperty3.default)(_handleActions, _constants.API_SET_HEADERS, function (state, _ref8) {
  var headers = _ref8.payload;

  return _immutable2.default.fromJS(state).setIn(['endpoint', 'headers'], headers).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_SET_HEADER, function (state, _ref9) {
  var header = _ref9.payload;

  return _immutable2.default.fromJS(state).mergeIn(['endpoint', 'headers'], header).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_SET_ENDPOINT_HOST, function (state, _ref10) {
  var host = _ref10.payload;

  return _immutable2.default.fromJS(state).setIn(['endpoint', 'host'], host).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_SET_ENDPOINT_PATH, function (state, _ref11) {
  var path = _ref11.payload;

  return _immutable2.default.fromJS(state).setIn(['endpoint', 'path'], path).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_CREATE, function (state) {
  return _immutable2.default.fromJS(state).update('isCreating', function (v) {
    return v + 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_CREATED, function (rawState, _ref12) {
  var rawEntities = _ref12.payload;

  var state = _immutable2.default.fromJS(rawState);
  var entities = _immutable2.default.fromJS(Array.isArray(rawEntities) ? rawEntities : [rawEntities]);

  return (0, _stateMutation.updateOrInsertEntitiesIntoState)(state, entities).update('isCreating', function (v) {
    return v - 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_CREATE_FAILED, function (state) {
  return _immutable2.default.fromJS(state).update('isCreating', function (v) {
    return v - 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_READ, function (state) {
  return _immutable2.default.fromJS(state).update('isReading', function (v) {
    return v + 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_READ, function (rawState, _ref13) {
  var payload = _ref13.payload;

  var state = _immutable2.default.fromJS(rawState);
  var entities = _immutable2.default.fromJS(Array.isArray(payload.data) ? payload.data : [payload.data]).concat(_immutable2.default.fromJS(payload.included || []));

  return (0, _stateMutation.updateOrInsertEntitiesIntoState)(state, entities).update('isReading', function (v) {
    return v - 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_READ_FAILED, function (state) {
  return _immutable2.default.fromJS(state).update('isReading', function (v) {
    return v - 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_UPDATE, function (rawState, _ref14) {
  var entity = _ref14.payload;
  var type = entity.type,
      id = entity.id;

  var state = _immutable2.default.fromJS(rawState);

  return (0, _stateMutation.setIsInvalidatingForExistingEntity)(state, { type: type, id: id }, IS_UPDATING).update('isUpdating', function (v) {
    return v + 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_UPDATED, function (rawState, _ref15) {
  var rawEntities = _ref15.payload;

  var state = _immutable2.default.fromJS(rawState);
  var entities = _immutable2.default.fromJS(Array.isArray(rawEntities.data) ? rawEntities.data : [rawEntities.data]).concat(_immutable2.default.fromJS(rawEntities.included || []));

  return (0, _stateMutation.updateOrInsertEntitiesIntoState)(state, entities).update('isUpdating', function (v) {
    return v - 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_UPDATE_FAILED, function (rawState, _ref16) {
  var entity = _ref16.payload.entity;
  var type = entity.type,
      id = entity.id;

  var state = _immutable2.default.fromJS(rawState);

  return (0, _stateMutation.setIsInvalidatingForExistingEntity)(state, { type: type, id: id }, IS_UPDATING).update('isUpdating', function (v) {
    return v - 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_WILL_DELETE, function (rawState, _ref17) {
  var entity = _ref17.payload;
  var type = entity.type,
      id = entity.id;

  var state = _immutable2.default.fromJS(rawState);

  return (0, _stateMutation.setIsInvalidatingForExistingEntity)(state, { type: type, id: id }, IS_DELETING).update('isDeleting', function (v) {
    return v + 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_DELETED, function (rawState, _ref18) {
  var rawEntity = _ref18.payload;

  var state = _immutable2.default.fromJS(rawState);
  var entity = _immutable2.default.fromJS(rawEntity);

  return (0, _stateMutation.removeEntityFromState)(state, entity).update('isDeleting', function (v) {
    return v - 1;
  }).toJS();
}), (0, _defineProperty3.default)(_handleActions, _constants.API_DELETE_FAILED, function (rawState, _ref19) {
  var entity = _ref19.payload.entity;
  var type = entity.type,
      id = entity.id;

  var state = _immutable2.default.fromJS(rawState);

  return (0, _stateMutation.setIsInvalidatingForExistingEntity)(state, { type: type, id: id }, IS_DELETING).update('isDeleting', function (v) {
    return v - 1;
  }).toJS();
}), _handleActions), {
  isCreating: 0,
  isReading: 0,
  isUpdating: 0,
  isDeleting: 0,
  endpoint: {
    host: null,
    path: null,
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json'
    }
  }
});