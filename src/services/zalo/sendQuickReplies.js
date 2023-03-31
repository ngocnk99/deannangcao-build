/* eslint-disable require-jsdoc */
import axios from 'axios';
import _ from 'lodash';
import CONFIG from '../../config';
import options from '../../utils/joi/lib/schemas';

const setOptions = (userId, text, buttons) => {
  let body = {};

  if (!_.isEmpty(buttons)) {
    // buttons = buttons.map(button =>({
    //   title: button,
    //   type: "oa.query.show",
    //   payload: button
    // }));

    

    buttons = buttons.map(item =>{
      const _item = {
        type: "oa.query.hide",
        title: item.buttonName,
      }

      _item.payload = item.payload ? { title: item.buttonName, type:'quickReplies', ...item.payload } : { title: item.buttonName, type:'quickReplies'}
      _item.payload = JSON.stringify(_item.payload);
      
      return _item;
    });
  }
  if (!_.isEmpty(buttons)) {
    body = {
      recipient: {
        user_id: userId
      },
      message: {
        text,
        attachment: {
          type:"template",
          payload: {
            buttons,
          }
        }
      }
    }
  } else {
    body = {
      recipient: {
        user_id: userId
      },
      message: {
        text,
      }
    }
  }

  return {
    body: JSON.stringify(body)
  }
};

// eslint-disable-next-line jsdoc/check-param-names
/**
 * @param {string} params.accessToken
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.text
 * @param {Array} params.quickReplies
 * */
export default async (params) => {
  // console.log(Math.floor(params.buttons.length/5 +1));
  for (let i = 0; i < Math.floor((params.quickReplies.length/5) +1 );i++ ) {
    const _buttons = params.quickReplies.slice(i*5,i*5+5);
    if (_buttons.length > 0 && !params.text ) {
      params.text = 'Xem thêm:'
    } else if (_buttons.length === 0) {
      return;
    }

    await axios({
      method: 'POST',
      url: `${CONFIG.ZALO_API_URL}/message`,
      data: setOptions(params.userId,params.text,_buttons).body,
      params: {
        access_token: params.accessToken
      },
      headers: {
        'content-type':'application/json'
      }
    }).then((response) => {

      console.log(response.data);
    }).catch((e) => {
      console.log(e);
      // result = e.response.data
    });
  }
}
