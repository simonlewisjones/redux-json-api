import { createAction, handleActions } from 'redux-actions';
import 'isomorphic-fetch';
import Imm from 'immutable';

import {
  removeEntityFromState,
  updateOrInsertEntitiesIntoState,
  setIsInvalidatingForExistingEntity
} from './state-mutation';
import { apiRequest, noop, jsonContentTypes } from './utils';
import {
  API_SET_ENDPOINT_HOST, API_SET_ENDPOINT_PATH, API_SET_HEADERS, API_SET_HEADER, API_WILL_CREATE, API_CREATED, API_CREATE_FAILED, API_WILL_READ, API_READ, API_READ_FAILED, API_WILL_UPDATE, API_UPDATED, API_UPDATE_FAILED, API_WILL_DELETE, API_DELETED, API_DELETE_FAILED
} from './constants';

// Entity isInvalidating values
export const IS_DELETING = 'IS_DELETING';
export const IS_UPDATING = 'IS_UPDATING';

// Action creators
export const setEndpointHost = createAction(API_SET_ENDPOINT_HOST);
export const setEndpointPath = createAction(API_SET_ENDPOINT_PATH);
export const setHeaders = createAction(API_SET_HEADERS);
export const setHeader = createAction(API_SET_HEADER);

const apiWillCreate = createAction(API_WILL_CREATE);
const apiCreated = createAction(API_CREATED);
const apiCreateFailed = createAction(API_CREATE_FAILED);

const apiWillRead = createAction(API_WILL_READ);
const apiRead = createAction(API_READ);
const apiReadFailed = createAction(API_READ_FAILED);

const apiWillUpdate = createAction(API_WILL_UPDATE);
const apiUpdated = createAction(API_UPDATED);
const apiUpdateFailed = createAction(API_UPDATE_FAILED);

const apiWillDelete = createAction(API_WILL_DELETE);
const apiDeleted = createAction(API_DELETED);
const apiDeleteFailed = createAction(API_DELETE_FAILED);

// Actions
export const setAccessToken = (at) => {
  return (dispatch) => {
    dispatch(setHeader({ Authorization: `Bearer ${at}` }));
  };
};

export const uploadFile = (file, {
  companyId,
  fileableType: fileableType = null,
  fileableId: fileableId = null
}, {
  onSuccess: onSuccess = noop,
  onError: onError = noop
} = {}) => {
  console.warn('uploadFile has been deprecated and will no longer be supported by redux-json-api https://github.com/dixieio/redux-json-api/issues/2');

  return (dispatch, getState) => {
    const accessToken = getState().api.endpoint.accessToken;
    const path = [companyId, fileableType, fileableId].filter(o => !!o).join('/');
    const url = `${__API_HOST__}/upload/${path}?access_token=${accessToken}`;

    const data = new FormData;
    data.append('file', file);

    const options = {
      method: 'POST',
      body: data
    };

    return fetch(url, options)
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          if (jsonContentTypes.some(contentType => res.headers.get('Content-Type').indexOf(contentType) > -1)) {
            return res.json();
          }

          return res;
        }

        const e = new Error(res.statusText);
        e.response = res;
        throw e;
      })
      .then(json => {
        onSuccess(json);
      })
      .catch(error => {
        onError(error);
      });
  };
};

export const createEntity = (entity, {
  onSuccess: onSuccess = noop,
  onError: onError = noop
} = {}) => {
  if (onSuccess !== noop || onError !== noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return (dispatch, getState) => {
    dispatch(apiWillCreate(entity));

    const { host: apiHost, path: apiPath, headers } = getState().api.endpoint;
    const endpoint = `${apiHost}${apiPath}/${entity.type}`;

    return new Promise((resolve, reject) => {
      apiRequest(endpoint, {
        headers,
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          data: entity
        })
      }).then(json => {
        dispatch(apiCreated(json.data));
        onSuccess(json);
        resolve(json);
      }).catch(error => {
        const err = error;
        err.entity = entity;

        dispatch(apiCreateFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

export const readEndpoint = (endpoint, {
  onSuccess: onSuccess = noop,
  onError: onError = noop
} = {}) => {
  if (onSuccess !== noop || onError !== noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return (dispatch, getState) => {
    dispatch(apiWillRead(endpoint));

    const { host: apiHost, path: apiPath, headers } = getState().api.endpoint;
    const apiEndpoint = `${apiHost}${apiPath}/${endpoint}`;

    return new Promise((resolve, reject) => {
      apiRequest(`${apiEndpoint}`, {
        headers,
        credentials: 'include'
      })
        .then(json => {
          dispatch(apiRead({ endpoint, ...json }));
          onSuccess(json);
          resolve(json);
        })
        .catch(error => {
          const err = error;
          err.endpoint = endpoint;

          dispatch(apiReadFailed(err));
          onError(err);
          reject(err);
        });
    });
  };
};

export const updateEntity = (entity, {
  onSuccess: onSuccess = noop,
  onError: onError = noop
} = {}) => {
  if (onSuccess !== noop || onError !== noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return (dispatch, getState) => {
    dispatch(apiWillUpdate(entity));

    const { host: apiHost, path: apiPath, headers } = getState().api.endpoint;
    const endpoint = `${apiHost}${apiPath}/${entity.type}/${entity.id}`;

    return new Promise((resolve, reject) => {
      apiRequest(endpoint, {
        headers,
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({
          data: entity
        })
      }).then(json => {
        dispatch(apiUpdated(json));
        onSuccess(json);
        resolve(json);
      }).catch(error => {
        const err = error;
        err.entity = entity;

        dispatch(apiUpdateFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

export const deleteEntity = (entity, {
  onSuccess: onSuccess = noop,
  onError: onError = noop
} = {}) => {
  if (onSuccess !== noop || onError !== noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return (dispatch, getState) => {
    dispatch(apiWillDelete(entity));

    const { host: apiHost, path: apiPath, headers } = getState().api.endpoint;
    const endpoint = `${apiHost}${apiPath}/${entity.type}/${entity.id}`;

    return new Promise((resolve, reject) => {
      apiRequest(endpoint, {
        headers,
        method: 'DELETE',
        credentials: 'include'
      }).then(() => {
        dispatch(apiDeleted(entity));
        onSuccess();
        resolve();
      }).catch(error => {
        const err = error;
        err.entity = entity;

        dispatch(apiDeleteFailed(err));
        onError(err);
        reject(err);
      });
    });
  };
};

export const requireEntity = (entityType, endpoint = entityType, {
  onSuccess: onSuccess = noop,
  onError: onError = noop
} = {}) => {
  if (onSuccess !== noop || onError !== noop) {
    console.warn('onSuccess/onError callbacks are deprecated. Please use returned promise: https://github.com/dixieio/redux-json-api/issues/17');
  }

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const { api } = getState();
      if (api.hasOwnProperty(entityType)) {
        resolve();
        return onSuccess();
      }

      dispatch(readEndpoint(endpoint, { onSuccess, onError }))
        .then(resolve)
        .catch(reject);
    });
  };
};

// Reducers
export const reducer = handleActions({

  [API_SET_HEADERS]: (state, { payload: headers }) => {
    return Imm.fromJS(state).setIn(['endpoint', 'headers'], headers).toJS();
  },

  [API_SET_HEADER]: (state, { payload: header }) => {
    return Imm.fromJS(state).mergeIn(['endpoint', 'headers'], header).toJS();
  },

  [API_SET_ENDPOINT_HOST]: (state, { payload: host }) => {
    return Imm.fromJS(state).setIn(['endpoint', 'host'], host).toJS();
  },

  [API_SET_ENDPOINT_PATH]: (state, { payload: path }) => {
    return Imm.fromJS(state).setIn(['endpoint', 'path'], path).toJS();
  },

  [API_WILL_CREATE]: (state) => {
    return Imm.fromJS(state).update('isCreating', v => v + 1).toJS();
  },

  [API_CREATED]: (rawState, { payload: rawEntities }) => {
    const state = Imm.fromJS(rawState);
    const entities = Imm.fromJS(
      Array.isArray(rawEntities) ? rawEntities : [rawEntities]
    );

    return updateOrInsertEntitiesIntoState(state, entities)
      .update('isCreating', v => v - 1)
      .toJS();
  },

  [API_CREATE_FAILED]: (state) => {
    return Imm.fromJS(state).update('isCreating', v => v - 1).toJS();
  },

  [API_WILL_READ]: (state) => {
    return Imm.fromJS(state).update('isReading', v => v + 1).toJS();
  },

  [API_READ]: (rawState, { payload }) => {
    const state = Imm.fromJS(rawState);
    const entities = Imm.fromJS(
      Array.isArray(payload.data) ? payload.data : [payload.data]
    ).concat(Imm.fromJS(payload.included || []));

    return updateOrInsertEntitiesIntoState(state, entities)
      .update('isReading', v => v - 1)
      .toJS();
  },

  [API_READ_FAILED]: (state) => {
    return Imm.fromJS(state).update('isReading', v => v - 1).toJS();
  },

  [API_WILL_UPDATE]: (rawState, { payload: entity }) => {
    const { type, id } = entity;
    const state = Imm.fromJS(rawState);

    return setIsInvalidatingForExistingEntity(state, { type, id }, IS_UPDATING)
      .update('isUpdating', v => v + 1)
      .toJS();
  },

  [API_UPDATED]: (rawState, { payload: rawEntities }) => {
    const state = Imm.fromJS(rawState);
    const entities = Imm.fromJS(
      Array.isArray(rawEntities.data) ? rawEntities.data : [rawEntities.data]
    ).concat(Imm.fromJS(rawEntities.included || []));

    return updateOrInsertEntitiesIntoState(state, entities)
      .update('isUpdating', v => v - 1)
      .toJS();
  },

  [API_UPDATE_FAILED]: (rawState, { payload: { entity } }) => {
    const { type, id } = entity;
    const state = Imm.fromJS(rawState);

    return setIsInvalidatingForExistingEntity(state, { type, id }, IS_UPDATING)
      .update('isUpdating', v => v - 1)
      .toJS();
  },

  [API_WILL_DELETE]: (rawState, { payload: entity }) => {
    const { type, id } = entity;
    const state = Imm.fromJS(rawState);

    return setIsInvalidatingForExistingEntity(state, { type, id }, IS_DELETING)
      .update('isDeleting', v => v + 1)
      .toJS();
  },

  [API_DELETED]: (rawState, { payload: rawEntity }) => {
    const state = Imm.fromJS(rawState);
    const entity = Imm.fromJS(rawEntity);

    return removeEntityFromState(state, entity)
      .update('isDeleting', v => v - 1)
      .toJS();
  },

  [API_DELETE_FAILED]: (rawState, { payload: { entity } }) => {
    const { type, id } = entity;
    const state = Imm.fromJS(rawState);

    return setIsInvalidatingForExistingEntity(state, { type, id }, IS_DELETING)
      .update('isDeleting', v => v - 1)
      .toJS();
  }

}, {
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
