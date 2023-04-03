import axios from 'axios';
import CONFIG from '../../config';
import { regUrl } from '../../utils/helper';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {Array} params.templates
 * @param {string} params.accessToken
 * */
export default async (params) => {
  const userId = params.userId;
  const accessToken = params.accessToken;
  const templates = params.templates;

  let result;
  for await (const template of templates) {
    const data = {
      recipient: {
        user_id: userId
      },
      message: {
        text: `${template.url}\n\n${template.heading}\n\n${template.description}`,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [{
              media_type: 'image',
              url: (template.image && template.image.match(regUrl) && template.image.match(regUrl).length > 0 ) ? template.image : CONFIG['CONNECTCARE_IMAGES_URL'] + template.image
            }]
          }
        }
      }
    };
    await axios({
      method: 'POST',
      url: `${CONFIG['ZALO_API_URL']}/message`,
      data: JSON.stringify(data),
      params: {
        access_token: accessToken
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8'
      }
    }).then((response) => {
      result = response.data;
    }).catch((e) => {
      result = e.response.data;
    });
  }
  return result;
}
