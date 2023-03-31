import axios from 'axios';
import CONFIG from '../../config';
import MODELS from '../../models/models';
import models from '../../entity/index';
import filterHelpers from '../../helpers/filterHelpers';
import * as ApiErrors from '../../errors';

const { /* sequelize, */ users, contents, socialChannels } = models;

/**
 * @param {Object} params
 * @param {string} params.accessToken*/
export default async (params, userCreatorsId) => {
  const accessToken = params.accessToken;
  const socialsId = params.socialsId;
  const socialChannelType = params.socialChannelType;
  let result;
  try {
    result = await axios({
      method: 'GET',
      url: `${CONFIG.ZALO_API_URL}/oa/getoa`,
      params: {
        access_token: accessToken
      },
      headers: {
        'content-type': 'application/json'
      }
    });

    console.log('kết quả', result.data);

    if (result.data?.data?.oa_id) {
      const found = await MODELS.findOne(socialChannels, {
        where: { socialChannelUrl: result.data.data.oa_id, socialsId }
      });
     // console.log('kết quả', found.data);
     // console.log('kết quả2', socialChannelType);

      if (found)
        await MODELS.update(
          socialChannels,
          {
            socialChannelName: result.data.data.name,
            socialChannelImages: [
              {
                file: `${result.data.data.avatar}`,
                extension: `${filterHelpers.getExtension(result.data.data.avatar)}`
              }
            ],
            socialChannelToken: accessToken,
            socialChannelType: socialChannelType ? socialChannelType : 0
          },
          { where: { socialChannelUrl: result.data.data.oa_id, socialsId } }
        );
      else
        await MODELS.create(socialChannels, {
          socialChannelUrl: result.data.data.oa_id,
          socialsId,
          socialChannelImages: [
            { file: `${result.data.data.avatar}`, extension: `${filterHelpers.getExtension(result.data.data.avatar)}` }
          ],
          socialChannelName: result.data.data.name,
          socialChannelToken: accessToken,
          userCreatorsId,
          socialChannelType: socialChannelType ? socialChannelType : 0,
          status: 1
        });

      return {
        error: [],
        success: true,
        message: 'success'
      };
    } else {
      return {
        ...result.data,
        success: false
      };
    }
  } catch (e) {
    console.log(e);
    return new ApiErrors.BaseError({
      statusCode: 202,
      type: 'getInfoError',
      message: e.message
    });
  }
};
