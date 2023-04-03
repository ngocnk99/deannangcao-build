import axios from 'axios';
// import CONFIG from '../../../config';

// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text) => {
  const body = {
    recipient: {
      id: `${userId}`
    },
    message: {
      text: `${text}`
    }
  };

  return {
    body: JSON.stringify(body)
  };
};

export default async params => {
  const output = [];


  const accessToken = params.accessToken;
  const socialChannelsId = params.socialChannelsId;
  const text = params.text || '';

  await Promise.all(params.userIdList.map(userId =>{
    if (text) {
      // console.log('accessToken=%s || userId=%s || text=%s', accessToken, userId, text);
      const options = setOptions(userId, text);

      axios({
        method: 'post',
        url: 'https://graph.facebook.com/v5.0/me/messages?access_token=' + accessToken,
        data: options.body,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function(response) {
          // console.log('kết thúc response', response.data);
          output.push({
            data: response.data
          });

          return output;

        })
        .catch(function(error) {
          console.log(error);
          output.push(error);
          //throw new Error(error);
        });
    }

    return output;
  }));


};
