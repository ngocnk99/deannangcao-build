import axios from 'axios';
import CONFIG from '../../config';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.text
 * @param {string} params.accessToken*/
export default async (params) => {
  const data = {
    recipient: {
      user_id: params.userId,
    },
    message: {
      text: params.text
    }
  };
  const accessToken = params.accessToken;
  let result;

  await axios({
    method: 'POST',
    url: `${CONFIG.ZALO_API_URL}/message`,
    data,
    params: {
      access_token: accessToken
    },
    headers: {
      'content-type':'application/json'
    }
  }).then((response) => {
    result = response.data;
    console.log(response.data);
  }).catch((e) => {
    console.log(e);
    result = e.response.data
  });

  return result;
}
