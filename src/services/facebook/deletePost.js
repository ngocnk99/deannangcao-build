import axios from 'axios';
import CONFIG from '../../config';

export default async params => {
  let output = {};

  console.log('data: ', params);

  const postId = params.postId;
  const accessToken = params.accessToken;

  const url = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${postId}?access_token=${accessToken}`;
  let isDeleted = false;
  console.log(url);

  await axios({
    method: 'delete',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function(response) {
      output = response.data ? response.data.success : false;
    })
    .catch(function(error) {
      console.log('error: ', error.response.data.error);

      if (error.response?.data?.error?.code == 190) {
        console.log('token hết hạn hoặc sai');
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
