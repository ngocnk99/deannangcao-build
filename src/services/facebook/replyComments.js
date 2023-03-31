import axios from 'axios';
import CONFIG from '../../config'
import models from '../../entity/index';
import Model from '../../models/models';
const { socialChannels, socialGroupChannels } = models;

export default async params => {
    let output = {};

    console.log('data: ', params);
    const pageId = params.pageId;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const objectId = params.objectId;
    const message = params.message;
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
    const url = `${host}/${version}/${objectId}/comments?access_token=${accessToken}&message=${message}`;


    await axios({
        method: 'post',
        url: encodeURI(url),
        data: {},
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            output = response.data
        })
        .catch(function (error) {
            console.log('error: ', error);

            output = error.response.data.error
        });

    return output;
};
