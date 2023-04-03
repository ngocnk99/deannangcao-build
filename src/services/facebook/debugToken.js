import axios from 'axios';
import CONFIG from '../../config';
import models from '../../entity/index';
import Model from '../../models/models';
import getAppAccessToken from './getAppAccessToken';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
const { socialChannels, socialGroupChannels } = models;

export default async params => {
  let output = {};
  let finalResult;
  console.log('data: ', params);
  const id = params.id;
  const version = CONFIG.FB_GRAPH_VERSION;
  const host = CONFIG.FB_GRAPH_HOST;
  const foundSocialChannel = await Model.findOne(socialChannels, {
    where: {
      id: id
    },
    attributes: ['id', 'socialChannelUrl', 'socialsId', 'socialChannelName', 'socialChannelToken']
    // include: [{ model: socialGroupChannels, as: 'socialGroupChannels', attributes: ['name'], required: true }]
  }).catch(err => {
    output = err;
  });
  const accessToken = foundSocialChannel ? foundSocialChannel.socialChannelToken : '';
  console.log('token', accessToken);
  // const appToken = await getAppAccessToken.connectFacebookApi();
  const url = `${host}/${version}/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
  console.log('url', url);
  if (!foundSocialChannel) {
    throw new ApiErrors.BaseError({
      statusCode: 202,
      type: 'crudNotExisted'
    });
  }
  await axios({
    method: 'get',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function(response) {
      output = response.data;
      console.log('output', output);
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
      const entity = { status: 1, socialChannelTokenExpired: new Date(), socialChannelName: output.data.application };

      await Model.update(socialChannels, entity, { where: { id: Number(foundSocialChannel.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      finalResult = { entity, output };
    } else {
      console.log('succes token');
      const entity = { status: 1, socialChannelTokenExpired: date, socialChannelName: output.data.application };

      await Model.update(socialChannels, entity, { where: { id: Number(foundSocialChannel.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      finalResult = { entity, output };
    }
  } else {
    const entity = { status: 1, socialChannelTokenExpired: new Date(), socialChannelName: foundSocialChannel.name };

    await Model.update(socialChannels, entity, { where: { id: Number(foundSocialChannel.id) } }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudError',
        error
      });
    });

    finalResult = { entity, output };
  }

  return finalResult;
};
