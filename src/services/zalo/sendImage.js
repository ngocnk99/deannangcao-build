import axios from 'axios';
import CONFIG from '../../config';
import { regUrl } from '../../utils/helper';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.url
 * @param {string} params.accessToken
 * */
export default async (params) => {
  const url = params.url;
  const data = {
    recipient: {
      user_id: params.userId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'media',
          elements: [{
            media_type: 'image',
            url: (url && url.match(regUrl) && url.match(regUrl).length > 0 ) ? url : CONFIG['CONNECTCARE_IMAGES_URL'] + url
          }]
        }
      }
    }
  };
  let result;

  await axios({
    method: 'POST',
    url: `${CONFIG['ZALO_API_URL']}/message`,
    data: JSON.stringify(data),
    params: {
      access_token: params.accessToken
    },
    headers: {
      'content-type': 'text/plain;charset=UTF-8'
    }
  }).then((response) => {
    result = response.data;
  }).catch((e) => {
    result = e.response.data;
  });

  return result;
}
