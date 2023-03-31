import axios from 'axios';
import CONFIG from '../../config';
import models from '../../entity/index';
import Model from '../../models/models';
import getUserInfo from './getUserInfo';
import getInfo from '../zalo/getInfoUser';
import ErrorHelpers from '../../helpers/errorHelpers';
import r from 'rethinkdb';
const { socialChannels, socialGroupChannels, medCustomersSocialChannels, medCustomers } = models;

export default {
  connectFacebookApi: async ({ pageId }) => {
    let output = {};
    let finalResult;
    let finallyResult = [];
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;

    const foundSocialChannel = await Model.findOne(socialChannels, {
      where: {
        link: pageId
      },
      attributes: ['id', 'token', 'placesId', 'link'],
      include: [{ model: socialGroupChannels, as: 'socialGroupChannels', attributes: ['name'], required: true }]
    }).catch(err => {
      finallyResult = err;
    });
    const accessToken = foundSocialChannel ? foundSocialChannel.token : '';
    console.log(accessToken);
    const url = `${host}/${version}/${pageId}/conversations?fields=senders&access_token=${accessToken}&limit=500`;
    const connection = await r.connect({
      host: CONFIG.RETHINKDB_SERVER,
      port: CONFIG.RETHINKDB_PORT,
      db: CONFIG.RETHINKDB_DB
    });

    console.log(url);
    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        output = response.data;
      })
      .catch(function(error) {
        console.log('error: ', error);

        output = error.response.data.error;
      });
    if (output.data && output.data.length > 0) {
      finalResult = await output.data.map(item => {
        return item.senders.data[0];
      });
      await r
        .table('userInfo')
        .filter({ pageId: pageId })
        .delete()
        .run(connection, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      await Promise.all(
        finalResult.map(async item => {
          const data = await getUserInfo.getUserInfo({ userId: item.id, access_token: accessToken });

          data.phone = '';
          const customer = await Model.findOne(medCustomersSocialChannels, {
            where: {
              recipientId: item.id
            },
            attributes: ['id', 'customersId']
          }).catch(err => {
            ErrorHelpers.errorThrow(err, 'getError', 'getPageService');
          });

          if (customer) {
            const phone = await Model.findOne(medCustomers, {
              where: {
                id: customer.customersId
              },
              attributes: ['id', 'mobile']
            }).catch(err => {
              ErrorHelpers.errorThrow(err, 'getError', 'getPageService');
            });

            if (phone) data.phone = phone.mobile;
          }

          if (!data.code) {
            await r
              .table('userInfo')
              .insert({ ...data, pageId: pageId })
              .run(connection, function(err, result) {
                if (err) {
                  console.log(err);
                }
              });

            finallyResult.push({ ...data, pageId: pageId });
          }
        })
      );
    }
    return finallyResult;
  },
  connectZaloApi: async ({ pageId }) => {
    let output = [];
    let finalResult;
    let finallyResult = [];
    const host = CONFIG.ZALO_API_URL;
    const foundSocialChannel = await Model.findOne(socialChannels, {
      where: {
        link: pageId
      },
      attributes: ['id', 'token', 'placesId', 'link'],
      include: [{ model: socialGroupChannels, as: 'socialGroupChannels', attributes: ['name'], required: true }]
    });
    const accessToken = foundSocialChannel.token;
    let url = `${host}/getfollowers?access_token=${accessToken}&data={"offset":"0","count":"50"}`;
    const connection = await r.connect({
      host: CONFIG.RETHINKDB_SERVER,
      port: CONFIG.RETHINKDB_PORT,
      db: CONFIG.RETHINKDB_DB
    });

    // return new Promise((resolve, reject) => {
    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        output = [...output, ...response.data.data.followers];
      })
      .catch(function(error) {
        console.log('error: ', error);
        output = [...output, error.response.data.message];
      });
    url = `${host}/getfollowers?access_token=${accessToken}&data={"offset":"50","count":"50"}`;

    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        output = [...output, ...response.data.data.followers];
      })
      .catch(function(error) {
        console.log('error: ', error);
        output = [...output, error.response.data.message];
      });

    url = `${host}/getfollowers?access_token=${accessToken}&data={"offset":"100","count":"50"}`;
    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        output = [...output, ...response.data.data.followers];
      })
      .catch(function(error) {
        console.log('error: ', error);
        output = [...output, error.response.data.message];
      });
    url = `${host}/getfollowers?access_token=${accessToken}&data={"offset":"150","count":"50"}`;
    await axios({
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function(response) {
        output = [...output, ...response.data.data.followers];
      })
      .catch(function(error) {
        console.log('error: ', error);
        output = [...output, error.response.data.message];
      });
    console.log('out', JSON.stringify(output, null, 2));
    if (output && output.length > 0) {
      finalResult = await output.map(item => {
        return item.user_id;
      });
      console.log(finalResult);
      await r
        .table('userInfo')
        .filter({ pageId: pageId })
        .delete()
        .run(connection, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      await Promise.all(
        finalResult.map(async item => {
          const data = await getInfo({ userId: item, accessToken: accessToken });

          data.phone = '';
          if (item.id) {
            const customer = await Model.findOne(medCustomersSocialChannels, {
              where: {
                recipientId: item.id
              },
              attributes: ['id', 'customersId']
            }).catch(err => {
              ErrorHelpers.errorThrow(err, 'getError', 'getPageService');
            });

            if (customer) {
              const phone = await Model.findOne(medCustomers, {
                where: {
                  id: customer.customersId
                },
                attributes: ['id', 'mobile']
              }).catch(err => {
                ErrorHelpers.errorThrow(err, 'getError', 'getPageService');
              });

              if (phone) data.phone = phone.mobile;
            }
          }
          const newEntry = {
            name: data.data.display_name,
            profile_pic: data.data.avatar,
            id: data.data.user_id_by_app,
            phone: data.phone
          };

          if (data.data) {
            await r
              .table('userInfo')
              .insert({ ...newEntry, pageId: pageId })
              .run(connection, function(err, result) {
                if (err) {
                  console.log(err);
                }
              });

            finallyResult.push({ ...newEntry, pageId: pageId });
          }
        })
      );
    }

    return finallyResult;
  }
};
