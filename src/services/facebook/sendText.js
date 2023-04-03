import axios from 'axios';
// import _ from 'lodash';
// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text) => {
  const body = {
    recipient: {
      id: `${userId}`
    },
    message: {
      text: `${text}`
    },
    "messaging_type": "MESSAGE_TAG",
    "tag": "ACCOUNT_UPDATE"
  };

  return {
    body: JSON.stringify(body)
  };
};

export default {
  connectFacebookApi: async data => {
    let output =  {};

    console.log("data: ", data);

    const accessToken = data.entity.accessToken;
    const userId = data.entity.userId;
    const text = data.entity.text || '';

    console.log("Data: ", accessToken, userId, text);

    if (text !== '') {
      console.log('accessToken=%s || userId=%s || text=%s', accessToken, userId, text);
      const options = setOptions(userId, text);
      

      console.log('options   ', options);
      console.log('options body   ', options.body);
      // return new Promise((resolve, reject) => {
      await axios({
        method: 'post',
        url: 'https://graph.facebook.com/v5.0/me/messages?access_token=' + accessToken,
        data: options.body,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function(response) {
          console.log('kết thúc response', response.data);

          output= {
            data: response.data 
          };

        })
        .catch(function(error) {
          console.log(error.response.data.error);

          output = {
            data: error.response.data.error
          };
        });
    }

    return output;
  }
};
