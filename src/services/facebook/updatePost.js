import axios from 'axios';
import CONFIG from '../../config';

export default async params => {
  let output = {};

  console.log('data: ', params);

  const postId = params.postId;
  const message = params.message;
  const accessToken = params.accessToken;

  const url = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${postId}`;
  let isDeleted = false;
  console.log(url);

  await axios({
    method: 'post',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      access_token: accessToken,
      message: message
    }
  })
    .then(function(response) {
      output = response.data ? response.data.success : false;
    })
    .catch(function(error) {
      if (error.response) {
        console.log('error: ', error.response.data.error);
      } else {
        console.log('erro2r: ', error);
      }

      if (error.response?.data?.error?.code == 10) {
        console.log('bài viết đã bị xóa trước đó');
        isDeleted = true;
      }
      output = false;
    });

  return {
    output: output,
    isDeleted: isDeleted
  };
};
