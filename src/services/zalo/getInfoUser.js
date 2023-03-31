import axios from 'axios';
import CONFIG from '../../config';

/**
 * @param {{accessToken: *, userId: *}} params
 * @param {*} params.userId
 * @param {*} params.accessToken
 * */
export default async params => {
  const accessToken = params.accessToken;
  const userId = params.userId;
  let result;

  await axios({
    method: 'GET',
    url: `${CONFIG.ZALO_API_URL}/getprofile`,
    params: {
      access_token: accessToken,
      data: { user_id: userId }
    },
    headers: {
      'content-type': 'application/json'
    }
  })
    .then(response => {
      result = response.data;
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
      result = e.response.data;
    });

  return result;
};
