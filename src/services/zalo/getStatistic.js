import axios from 'axios';
import CONFIG from '../../config';
import MODELS from '../../models/models';
import models from '../../entity';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
/**
 * @param {{accessToken: *, userId: *}} params
 * @param {*} params.userId
 * @param {*} params.accessToken
 * */

const { socialChannels, contentSocials } = models;

export default {
  getStatistics: params =>
    new Promise(async (resolve, reject) => {
      try {
        const id = params;
        let result;
        console.log('id', id);
        const found = await MODELS.findOne(contentSocials, {
          where: {
            id: id
          },
          attributes: ['id', 'contentSocialId'],
          include: [
            {
              model: socialChannels,
              as: 'socialChannels',
              attributes: ['socialChannelToken', 'socialChannelImages']
            }
          ]
        });

        if (found) {
          const [detail, arr1, arr2] = await Promise.all([
            axios({
              method: 'GET',
              url: `${CONFIG.ZALO_API_URL}/article/getdetail`,
              params: {
                access_token: found.socialChannels.socialChannelToken,
                id: found.contentSocialId
              },
              headers: {
                'content-type': 'application/json'
              }
            }),
            axios({
              method: 'GET',
              url: `${CONFIG.ZALO_API_URL}/article/getslice`,
              params: {
                access_token: found.socialChannels.socialChannelToken,
                type: 'normal'
              },
              headers: {
                'content-type': 'application/json'
              }
            }),
            axios({
              method: 'GET',
              url: `${CONFIG.ZALO_API_URL}/article/getslice`,
              params: {
                access_token: found.socialChannels.socialChannelToken,
                type: 'video'
              },
              headers: {
                'content-type': 'application/json'
              }
            })
          ]);
          console.log('detail', detail.data);
          if (arr1?.data?.data?.medias && arr2?.data?.data?.medias) {
            result = [...arr1.data.data.medias, ...arr2.data.data.medias].find(r => r.id === found.contentSocialId);
          } else if (arr1?.data?.data?.medias) {
            result = [...arr1.data.data.medias].find(r => r.id === found.contentSocialId);
          } else if (arr2?.data?.data?.medias) {
            result = [...arr2.data.data.medias].find(r => r.id === found.contentSocialId);
          }
          if (result) {
            result = {
              ...detail.data.data,
              image: found.socialChannels.socialChannelImages,
              link_view: result.link_view,
              total_view: result.total_view,
              total_share: result.total_share,
              success: true,
              messages: []
            };
            resolve(result);
          }
          resolve(null);
        }
      } catch (err) {
        console.log('err', err);
        reject(null);
        // reject(ErrorHelpers.errorReject(err, 'getListError', 'contentsService'));
      }
    })
};
