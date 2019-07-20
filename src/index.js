const crypto = require('crypto');
const request = require('request-promise-native');
const parser = require('fast-xml-parser');

const API_VERSION_KEY = 'api_ver';
const API_APP_ID_KEY = 'api_id';
const API_TIMESTAMP = 'api_ts';
const API_MAC = 'api_mac';

module.exports = function init(clientUrl = null, appId = null, appSecret = null, apiVersion = '2') {
  if (! clientUrl || ! appId || ! appSecret) {
    console.error('WARNING: Missing configuration details for bsd-node');
  }

  const apiTimestamp = Math.floor(Date.now() / 1000);

  const defaultParameters = {
    [API_APP_ID_KEY]: appId,
    [API_TIMESTAMP]: apiTimestamp,
    [API_VERSION_KEY]: apiVersion,
  };

  function joinParameters(parameters, encode = true) {
    const parts = Object.keys(parameters).reduce((acc, key) => {
      const value = parameters[key];

      if (encode) {
        return [
          ...acc,
          [encodeURIComponent(key), encodeURIComponent(value)],
        ];
      }

      return [
        ...acc,
        [key, value],
      ];
    }, []);

    const stringified = parts.map(([key, value]) => `${key}=${value}`);

    return stringified.join('&');
  }

  async function makeApiMac(path, parameters) {
    const finalParameters = joinParameters({
      ...defaultParameters,
      ...parameters,
    }, false);

    const signingString = `${appId}\n${apiTimestamp}\n${path}\n${finalParameters}`;

    const hmac = crypto.createHmac('sha1', appSecret);
    hmac.setEncoding('hex');

    return new Promise((resolve) => {
      hmac.end(signingString, () => resolve(hmac.read()));
    });
  }

  async function makeRequest(path, options = {}) {
    try {
      const response = await request(path, {
        resolveWithFullResponse: true,
        ...options,
      });

      const data = parser.parse(response.body || '');

      return {
        ...response,
        data,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function get(path, parameters) {
    try {
      const apiMac = await makeApiMac(path, parameters);

      const finalParameters = joinParameters({
        ...defaultParameters,
        [API_MAC]: apiMac,
        ...parameters,
      });

      const finalPath = `${clientUrl}${path}?${finalParameters}`;

      return await makeRequest(finalPath);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return {
    get,
  };
}
