import CONFIG from '../../config';
import axios from 'axios';
import * as ApiErrors from '../../errors';

const qs = require('qs');

export const publishContentFacebook = async (param, socialChannel) => {
  let response;
  console.log('data', param.entity.data);

  let data = {
    message: param.entity.data.message || param.entity.data.title,
    title: param.entity.data.message || param.entity.data.title,
    description: param.entity.data.description
  };
  let url;

  if (param.entity.data.file_url || param.entity.data.source || param.entity.data.video) {
    url = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${socialChannel.socialChannelUrl}/videos`;
    data.file_url = param.entity.data.file_url || param.entity.data.video.file;
  } else url = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${socialChannel.socialChannelUrl}/feed`;
  console.log('url', url);
  if (param.entity.data.url && param.entity.data.url.length > 0) {
    // facebook upload ảnh vào bài viết
    const idAnh = await Promise.all(
      param.entity.data.url.map(async u => {
        const idPicture = await axios({
          method: 'POST',
          url: `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${socialChannel.socialChannelUrl}/photos`,
          data: JSON.stringify({
            url: u,
            published: false
          }),
          params: {
            access_token: socialChannel.socialChannelToken
          },
          headers: {
            'content-type': 'application/json'
          }
        }).catch(error => {
          console.log('error: ', error.response.data.error);

          throw new ApiErrors.BaseError(error);
        });

        return idPicture.data;
      })
    );

    if (idAnh.length > 0) {
      const dataRequest = idAnh.reduce(
        (a, b, index) => {
          const objTemp = {};

          objTemp[`attached_media[${index}]`] = { media_fbid: +b.id };

          return { ...a, ...objTemp };
        },
        { message: param.entity.data.message, access_token: socialChannel.socialChannelToken }
      );

      response = await axios({
        method: 'POST',
        url,
        data: qs.stringify(dataRequest),
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  } else {
    // check message video
    if (param.entity.data.file_url || param.entity.data.source || param.entity.data.video)
      param.entity.data.description = param.entity.data.message;

    // tạo bài viết
    console.log('bài viết ', url, JSON.stringify(param.entity.data));

    console.log('token ', socialChannel.socialChannelToken);
    response = await axios({
      method: 'POST',
      url,
      data: JSON.stringify(data),
      params: {
        access_token: socialChannel.socialChannelToken
      },
      headers: {
        'content-type': 'application/json'
      }
    }).catch(error => {
      console.log('error: ', error.response.data.error);

      throw new ApiErrors.BaseError(error);
    });
  }

  return response;
};
