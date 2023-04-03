import axios from 'axios';
import CONFIG from '../../config';
export default {
  getGroup: async data => {
    let output = {};

    console.log('data: ', data);
    const after = data.entity.after;
    const limit = data.entity.limit;
    const accessToken = data.entity.accessToken;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const admin_only = data.entity.admin_only ? data.entity.admin_only : false;
    let url = `${host}/${version}/me/groups?access_token=${accessToken}&pretty=0&limit=${limit}&admin_only=${admin_only}&fields=cover,id,name,privacy`;
    if (after && after != '') {
      url = `${url}&after=${after}`;
    }

    // return new Promise((resolve, reject) => {
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

    return output;
  }
};
