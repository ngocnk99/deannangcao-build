import axios from 'axios';
import MODELS from '../../models/models';
import CONFIG from '../../config';
import models from '../../entity/index';
import * as ApiErrors from '../../errors';
import getAppAccessToken from './getAppAccessToken';
const { /* sequelize, */ users, contents, socialChannels } = models;

const getSocialChannelTokenExpired = async accessToken => {
  const version = CONFIG.FB_GRAPH_VERSION;
  const host = CONFIG.FB_GRAPH_HOST;
  const appToken = await getAppAccessToken.connectFacebookApi();
  const url = `${host}/${version}/debug_token?input_token=${accessToken}&access_token=${appToken.access_token}`;

  let output = {};
  let finalResult;
  console.log('accesToken', accessToken);
  await axios({
    method: 'get',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function(response) {
      output = response.data;
    })
    .catch(function(error) {
      console.log('error: ', error.response.data.error);
      output = error.response.data.error;
    });
  if (output.data) {
    output.data.data_access_expires_at = new Date(output.data.data_access_expires_at * 1000);
    output.data.expires_at = new Date(output.data.expires_at * 1000);
    return output.data;
  } else {
    return null;
  }
};

export default {
  connectFacebookApi: async data => {
    try {
      // console.log('data: ', data);

      const { socialChannelToken } = data.entity;
      console.log('socialChannelTokenExpired', socialChannelToken);

      const socialChannelTokenExpired = await getSocialChannelTokenExpired(socialChannelToken);

      return {
        data: socialChannelTokenExpired,
        error: [],
        success: true,
        message: 'success'
      };
    } catch (e) {
      return new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        message: e.message
      });
    }
  }
};
