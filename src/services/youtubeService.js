import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';

import fs from 'fs';

import { google } from 'googleapis';

const { /* sequelize, Op, */ users, districts, provinces, wards } = models;
const youtube = google.youtube('v3');
import CONFIG from '../config';
import axios from 'axios';
import { content } from 'googleapis/build/src/apis/content';

const OAuth2 = google.auth.OAuth2;
const clientSecret = `${CONFIG.YOUTUBE_CLIENT_SECRET}`;
const clientId = `${CONFIG.YOUTUBE_CLIENT_ID}`;
const redirectUrl = `${CONFIG.URL_CALLBACK_YOUTUBE}`;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtubepartner'
];

const { /* sequelize, */ socialChannels, contentSocials } = models;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

export default {
  get_login_authen: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { access_type, state, include_granted_scopes, prompt } = param;
        console.log('oauth2Client ==== ', oauth2Client);
        let authUrl = oauth2Client.generateAuthUrl({
          access_type: access_type,
          state: state,
          include_granted_scopes: include_granted_scopes,
          prompt: prompt,
          scope: SCOPES
        });

        console.log('Authorize this app by visiting this url: ', authUrl);
        resolve({
          authUrl
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'WardService'));
      }
    }),
  get_code_authe_google: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { code, socialsId, userCreatorsId, socialChannelType } = param;
        console.log('socialChannelType', socialChannelType);
        const { tokens } = await oauth2Client.getToken(code);

        oauth2Client.setCredentials(tokens);
        console.log('tokens===', tokens);
        const channel = await axios({
          method: 'GET',
          url: `https://content-youtube.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${tokens.access_token}`
          }
        });

        const { items } = channel.data;

        console.log('kết quả', socialChannelType, items[0]);

        const found = await MODELS.findOne(socialChannels, {
          where: { socialChannelUrl: items[0].id, socialsId }
        });
        if (found)
          await MODELS.update(
            socialChannels,
            {
              socialChannelName: items[0].snippet.title,
              socialChannelImages: [
                {
                  file: `${items[0].snippet.thumbnails.high.url}`,
                  extension: `${filterHelpers.getExtension(items[0].snippet.thumbnails.high.url)}`
                }
              ],

              socialChannelToken: tokens.refresh_token,
              socialChannelType: socialChannelType ? socialChannelType : 0
            },
            { where: { socialChannelUrl: items[0].id, socialsId } }
          );
        else
          await MODELS.create(socialChannels, {
            // id: items[0].id,
            socialsId,
            socialChannelName: items[0].snippet.title,
            socialChannelImages: [
              {
                file: `${items[0].snippet.thumbnails.high.url}`,
                extension: `${filterHelpers.getExtension(items[0].snippet.thumbnails.high.url)}`
              }
            ],
            // socialChannelUrl: `/channel/${items[0].id}`,
            socialChannelUrl: items[0].id,
            socialChannelType: socialChannelType ? socialChannelType : 0,
            socialChannelToken: tokens.refresh_token,
            socialChannelTokenExpired: new Date(tokens.expiry_date),
            userCreatorsId,
            status: 1
          });
        resolve('success');
      } catch (e) {
        console.log('error', e);
        reject('failure');
      }
    }),
  create: param =>
    new Promise(async (resolve, reject) => {
      const { title, description, video, accessToken } = param;
      const file = video;
      if (file && file['extension'] === 'mp4') {
        // const fileUrl = 'video.mp4';
        const fileUrl = `${CONFIG.LOCAL_FILE_PATH}/${file['file']}`;
        if (fs.existsSync(fileUrl)) {
          {
            console.log('param=', param);

            oauth2Client.setCredentials({
              access_token: accessToken,
              expires_in: 3599,
              scope:
                'https://www.googleapis.com/auth/youtube.channel-memberships.creator https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl',
              token_type: 'Bearer'
            });

            const youtube = google.youtube({
              version: 'v3',
              auth: oauth2Client
            });

            youtube.videos.insert(
              {
                resource: {
                  snippet: {
                    title: title,
                    description: description,
                    tags: ['tag1', 'tag2'],
                    categoryId: 22
                  },
                  status: {
                    privacyStatus: 'public',
                    uploadStatus: 'uploaded',
                    madeForKids: false
                  }
                },
                part: 'snippet,status',
                media: {
                  body: fs.createReadStream(fileUrl)
                }
              },
              (err, res) => {
                console.log('hêlo', err);
                if (err) throw new ApiErrors.BaseError(error);
                console.log('dữ liệu trả về', res.data);
                resolve({
                  response: res.data.id
                });
                console.log('Done.');
              }
            );
            // youtube.videos.delete();
          }
        } else {
          console.log('không tìm thấy video', fileUrl);
          reject(
            new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              message: `Không tìm thấy  video`
            })
          );
        }
      }
    }),
  //contentSocialId: Id youtuve video ,
  //socialChannelToken:token chanel youtube
  getStatistical: (contentSocialId, socialChannelToken) =>
    new Promise(async (resolve, reject) => {
      try {
        // youtube
        let url = `https://content-youtube.googleapis.com/youtube/v3/videos?id=${contentSocialId}&part=statistics,snippet`;
        console.log('url', url);
        const ytToken = await axios({
          method: 'POST',
          url: `${CONFIG.GOOGLE_API_URL}/token`,
          params: {
            refresh_token: socialChannelToken,
            grant_type: 'refresh_token',
            client_id: `${CONFIG.YOUTUBE_CLIENT_ID}`,
            client_secret: `${CONFIG.YOUTUBE_CLIENT_SECRET}`
          }
        }).catch(error => {
          console.log('err', error);
          reject(new ApiErrors.BaseError(error));
        });
        console.log('ytToken.data', ytToken.data);
        if (ytToken && ytToken.data) {
          const youtube = await axios({
            method: 'GET',
            url,
            headers: {
              'content-type': 'application/json',
              Authorization: `Bearer ${ytToken.data.access_token}`
            }
          });
          console.log('token===', ytToken.data.access_token);
          if (youtube.data.items.length > 0) {
            console.log('youtube===', youtube.data.items[0].statistics);
            resolve({
              statistic: {
                view: youtube.data.items[0].statistics.viewCount,
                like: youtube.data.items[0].statistics.likeCount,
                unlike: youtube.data.items[0].statistics.dislikeCount,
                comment: youtube.data.items[0].statistics.commentCount
              },
              content: {
                contentSocialTitle: youtube.data.items[0].snippet.title,
                contentSocialDescriptions: youtube.data.items[0].snippet.description,
                categoryId: youtube.data.items[0].snippet.categoryId,
                contentSocialVideo: { src: `https://www.youtube.com/watch?v=${contentSocialId}`, type: 'iframeyoutube' }
              },
              success: true
            });
          } else {
            resolve({
              isDeleted: true
            });
          }
        }
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'socialsService'));
      }
    }),
  update: async (
    contentSocialId,
    socialChannelToken,
    { contentSocialTitle, contentSocialDescriptions, categoryId }
  ) => {
    // youtube
    let output = {};
    console.log('contentSocialTitle', contentSocialTitle);
    let isDeleted = false;
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet`;
    console.log('url', url);
    const ytToken = await axios({
      method: 'POST',
      url: `${CONFIG.GOOGLE_API_URL}/token`,
      params: {
        refresh_token: socialChannelToken,
        grant_type: 'refresh_token',
        client_id: `${CONFIG.YOUTUBE_CLIENT_ID}`,
        client_secret: `${CONFIG.YOUTUBE_CLIENT_SECRET}`
      }
    }).catch(error => {
      console.log('err', error);
    });
    if (ytToken && ytToken.data) {
      const body = {
        id: contentSocialId,
        snippet: {
          categoryId: categoryId,
          title: contentSocialTitle,
          description: contentSocialDescriptions
        }
      };
      console.log('boaccess_tokendy', ytToken.data.access_token);
      console.log('body', body);
      await axios({
        method: 'put',
        url,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ytToken.data.access_token}`
        },
        data: body
      })
        .then(function(response) {
          console.log('reponse');
          output = response.data ? true : false;
        })
        .catch(function(error) {
          console.log('error: ', error.response.data.error);
          console.log('error: ', error.response.config);
          if (error.response.data.error?.code == 403) {
            console.log('bài viết đã bị xóa trước đó');
            isDeleted = true;
          }
          output = false;
        });

      return {
        output: output,
        isDeleted: isDeleted
      };
    }
  },
  delete: async (contentSocialId, socialChannelToken) => {
    // youtube
    let output = {};
    let isDeleted = false;
    let url = `https://youtube.googleapis.com/youtube/v3/videos?id=${contentSocialId}`;
    console.log('url', url);
    const ytToken = await axios({
      method: 'POST',
      url: `${CONFIG.GOOGLE_API_URL}/token`,
      params: {
        refresh_token: socialChannelToken,
        grant_type: 'refresh_token',
        client_id: `${CONFIG.YOUTUBE_CLIENT_ID}`,
        client_secret: `${CONFIG.YOUTUBE_CLIENT_SECRET}`
      }
    }).catch(error => {
      console.log('err', error);
    });
    if (ytToken && ytToken.data) {
      const body = {
        id: contentSocialId
      };
      console.log('boaccess_tokendy', ytToken.data.access_token);
      console.log('body', body);
      await axios({
        method: 'delete',
        url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${ytToken.data.access_token}`
        }
      })
        .then(function(response) {
          output = true;
        })
        .catch(function(error) {
          console.log('error: ', error.response.data.error);

          if (error.response.data.error?.code == 403 || error.response.data.error?.code == 404) {
            console.log('bài viết đã bị xóa trước đó');
            isDeleted = true;
          }
          output = false;
        });

      return {
        output: output,
        isDeleted: isDeleted
      };
    }
  }
};
