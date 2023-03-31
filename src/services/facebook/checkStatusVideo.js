import axios from 'axios';
import CONFIG from '../../config';
export default {
  connectFacebookApi: async data => {
    let output = {};

    console.log('data: ', data);

    const accessToken = data.entity.accessToken;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;

    const url = `${host}/${version}/me/accounts?access_token=${accessToken}`;

    const urlVideoInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}/video_insights?metric=total_video_views`;

    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: urlVideoInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `Token kênh(page) ${detailSocialChannel.socialChannelName} hết hạn hoặc không đủ quyền `,
        name: detailSocialChannel.socialChannelName,
        id: detailSocialChannel.id,
        socialChannelUrl: detailSocialChannel.socialChannelUrl,
        err: err
      });
      // throw new ApiErrors.BaseError(err);
    });

    return output;
  }
};
