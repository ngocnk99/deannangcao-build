import axios from 'axios';
import CONFIG from '../../config'
import models from '../../entity/index';
import Model from '../../models/models';
const { socialChannels, socialGroupChannels } = models;

export default async params => {
  let output = {};
  console.log('data: ', params);
  const pageId = params.pageId;
  const version = CONFIG['FB_GRAPH_VERSION'];
  const host = CONFIG['FB_GRAPH_HOST'];
  const commentId = params['commentId'];
  const foundSocialChannel = await Model.findOne(socialChannels, {
    where: {
      link: pageId
    },
    attributes: ['id', 'token', 'placesId', 'link'],
    include: [{ model: socialGroupChannels, as: 'socialGroupChannels', attributes: ['name'], required: true }]
  }).catch(err => {
    output = err;
  });

  const accessToken = foundSocialChannel ? foundSocialChannel.token : '';
  let url = `${host}/${version}/${commentId}?access_token=${accessToken}&fields=is_hidden,can_hide,from,created_time,message,id,can_reply_privately`;

  await axios({
    method: 'get',
    url: url,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      output = response.data
    })
    .catch(function (error) {
      console.log('error: ', error.response.data.error);

      output = error.response.data.error
    });

  return output;
};
