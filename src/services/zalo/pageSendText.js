import axios from 'axios';
import CONFIG from '../../config';
import Model from '../../models/models';
import models from '../../entity/index';
import getInfoOa from './getInfoOa';
const { socialChannels, socialGroupChannels } = models;
/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.text
 * @param {string} params.accessToken*/

export default async params => {
  const data = {
    recipient: {
      user_id: params.userId
    },
    message: {
      text: params.text
    }
  };
  const userId = params.userId;
  const accessToken = params.accessToken;
  const text = params.text ? params.text : '';
  const foundSocialChannel = await Model.findOne(socialChannels, {
    where: {
      link: accessToken
    },
    required: true,
    include: [{ model: socialGroupChannels, as: 'socialGroupChannels' }],
    attributes: ['placesId', 'pageId']
  });
  const newEntry = {
    pageId: foundSocialChannel.pageId,
    sender: { id: foundSocialChannel.pageId },
    recipient: { id: userId },
    message: {
      text: text,
      attachments: params.message.attachments ? params.message.attachments : []
    },
    time: new Date().getTime(),
    status: false,
    socialGroupChannels: 'zalo',
    placesId: foundSocialChannel.placesId
  };
  let result;
  const userInfo = await getInfoOa({
    accessToken: accessToken
  });
  
  newEntry.sender = { ...newEntry.sender, profile_pic: userInfo.data.picture, name: userInfo.data.name };

  await axios({
    method: 'POST',
    url: `${CONFIG.ZALO_API_URL}/message`,
    data: JSON.stringify(data),
    params: {
      access_token: accessToken
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
