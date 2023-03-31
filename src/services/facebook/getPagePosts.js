import axios from 'axios';
import CONFIG from '../../config'
import models from '../../entity/index';
import Model from '../../models/models';
const { socialChannels, socialGroupChannels } = models;

export default async params => {
    let output = {};
    console.log('data: ', params);

    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const pageId = params.pageId;
    const fields = params.fields;
    const limit = params.limit ? params.limit : 20;
    const order = params.order ? params.order : 'chronological'

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
    let url = `${host}/${version}/${pageId}/feed?access_token=${accessToken}&fields=${fields}&limit=${limit}&order=${order}&summary=1`;

    if (params.before) url = url + `&before=${params.before}`;
    else if (params.after) url = url + `&after=${params.after}`;

    console.log(url);
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
