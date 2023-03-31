import axios from 'axios';
import MODELS from '../../models/models';
import CONFIG from '../../config';
import models from '../../entity/index';
import * as ApiErrors from '../../errors';
const { /* sequelize, */ users, contents, socialChannels } = models;
const getSocialChannelTokenExpired = async accessToken => {
  const version = CONFIG.FB_GRAPH_VERSION;
  const host = CONFIG.FB_GRAPH_HOST;
  const url = `${host}/${version}/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
  let output = {};
  let finalResult;
  await axios({
    method: 'get',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function(response) {
      console.log('a', response);
      output = response.data;
    })
    .catch(function(error) {
      console.log('error: ', error.response.data.error);
      output = error.response.data.error;
    });
  if (output.data) {
    const valid = output.data.is_valid ? true : false;

    const timestamp = output.data.data_access_expires_at ? output.data.data_access_expires_at : 0;
    const date = new Date(timestamp * 1000);

    if (!valid) {
      console.log('not succes token');
      finalResult = new Date();
    } else {
      console.log('succes token');
      finalResult = date;
    }
  } else {
    console.log('not succes token');
    finalResult = new Date();
  }
  return finalResult;
};

export default {
  connectFacebookApi: async data => {
    try {
      // console.log('data: ', data);

      const {
        socialChannelUrl,
        socialChannelName,
        socialChannelImages,
        socialsId,
        access_token,
        socialChannelType
      } = data.entity;

      // return new Promise((resolve, reject) => {
      const found = await MODELS.findOne(socialChannels, {
        where: {
          socialChannelUrl,
          socialsId
        }
      });
      // const socialChannelTokenExpired = await getSocialChannelTokenExpired(access_token);
      // console.log('socialChannelTokenExpired', socialChannelTokenExpired);
      if (found) {
        console.log('tìm thấy');
        await MODELS.update(
          socialChannels,
          {
            socialChannelName,
            socialChannelImages,
            socialChannelType: socialChannelType ? socialChannelType : 0,
            socialChannelToken: access_token,
            dateUpdated: new Date()
            // socialChannelTokenExpired: socialChannelTokenExpired ? socialChannelTokenExpired : new Date()
          },
          { where: { socialChannelUrl, socialsId } }
        );
      } else {
        console.log('k tìm thấy');
        await MODELS.create(socialChannels, {
          // socialChannelTokenExpired: socialChannelTokenExpired ? socialChannelTokenExpired : new Date(),
          socialChannelUrl,
          socialsId,
          socialChannelType: socialChannelType ? socialChannelType : 0,
          socialChannelName,
          socialChannelImages,
          socialChannelToken: access_token,
          userCreatorsId: data.userCreatorsId,
          status: 1
        });
      }

      return {
        error: [],
        success: true,
        message: 'success'
      };
    } catch (e) {
      console.log('error', e);
      return new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        message: e.message
      });
    }
  }
};
