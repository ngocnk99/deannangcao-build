import sendText from './sendText';
import sendImage from './sendImage';
import setButton from './setButton';
import upload from './upload';
import getInfoOa from './getInfoOa';
import sendQuickReplies from './sendQuickReplies';
import getInfoUser from './getInfoUser';
import sendAlbum from './sendAlbum';
import getStatisTic from './getStatistic';

import axios from 'axios';
import CONFIG from '../../config';
import ErrorHelpers from '../../helpers/errorHelpers';

const getOneStatistical = (contentSocialId, socialChannelToken, contentSocialLink) =>
  new Promise(async (resolve, reject) => {
    try {
      // zalo

      // console.log('socialChannelToken', socialChannelToken);
      let result;
      const [detail, arr1, arr2] = await Promise.all([
        axios({
          method: 'GET',
          url: `${CONFIG.ZALO_API_URL}/article/getdetail`,
          params: {
            access_token: socialChannelToken,
            id: contentSocialId
          },
          headers: {
            'content-type': 'application/json'
          }
        }),
        axios({
          method: 'GET',
          url: `${CONFIG.ZALO_API_URL}/article/getslice`,
          params: {
            access_token: socialChannelToken,
            type: 'normal'
          },
          headers: {
            'content-type': 'application/json'
          }
        }),
        axios({
          method: 'GET',
          url: `${CONFIG.ZALO_API_URL}/article/getslice`,
          params: {
            access_token: socialChannelToken,
            type: 'video'
          },
          headers: {
            'content-type': 'application/json'
          }
        })
      ]);

      // console.log('detail2', detail.data.data);
      // console.log('detail', arr1.data);
      // console.log('1');
      if (arr1?.data?.data?.medias && arr2?.data?.data?.medias) {
        result = [...arr1.data.data.medias, ...arr2.data.data.medias].find(r => r.id === contentSocialId);
      } else if (arr1?.data?.data?.medias) {
        result = [...arr1.data.data.medias].find(r => r.id === contentSocialId);
      } else if (arr2?.data?.data?.medias) {
        result = [...arr2.data.data.medias].find(r => r.id === contentSocialId);
      }

      if (result) {
        console.log('3');
        let video = null;
        let image = null;

        if (detail.data.data.type === 'video') {
          video = { src: contentSocialLink, type: 'iframezalo', video_id: detail.data.data.video_id, status: 'show' };
          image = [{ src: detail.data.data.avatar }];
        } else if (detail.data.data.type === 'normal') {
          if (detail.data.data.cover && detail.data.data.cover.cover_type === 'video') {
            video = {
              src: contentSocialLink,
              type: 'iframezalo',
              video_id: detail.data.data.cover.video_id,
              cover_type: 'video',
              status: 'show',
              cover_view: detail.data.data.cover.cover_view
            };
          } else if (detail.data.data.cover && detail.data.data.cover.cover_type === 'photo') {
            image = [{ src: detail.data.data.cover.photo_url, cover_type: 'photo', status: 'show' }];
          }
        }

        result = {
          statistic: {
            view: result.total_view,
            share: result.total_share
          },
          content: {
            contentSocialTitle: detail.data.data.title,
            contentSocialDescriptions: detail.data.data.description,
            contentSocialAuthor: detail.data.data.author,
            contentSocialImages: image,
            contentSocialVideo: video,
            contentSocialBody: detail.data.data.body ? detail.data.data.body : null
          },
          success: true
        };
        resolve(result);
      } else {
        // console.log('4');
        resolve({
          isDeleted: true
        });
      }
    } catch (err) {
      // console.log('5', err);
      resolve(null);
    }
  });

const updatePost = (contentSocialId, socialChannelToken, oldContentSocial, contentSocialContent) =>
  new Promise(async (resolve, reject) => {
    try {
      // zalo
      let output = {};
      let isDeleted = false;
      let body;

      if (oldContentSocial.contentSocialLink.includes('video')) {
        body = {
          id: contentSocialId,
          type: 'video',
          status: 'show',
          comment: 'show',
          title: contentSocialContent.contentSocialTitle,
          description: contentSocialContent.contentSocialDescriptions,
          video_id: contentSocialContent.video_id
        };
      } else {
        let cover;

        if (oldContentSocial.contentSocialVideo && oldContentSocial.contentSocialVideo.video_id) {
          cover = {
            cover_type: 'video',
            cover_view: oldContentSocial.contentSocialVideo.cover_view,
            video_id: oldContentSocial.contentSocialVideo.video_id,
            status: 'show'
          };
        } else {
          cover = {
            cover_type: 'photo',
            photo_url: contentSocialContent.contentSocialImages[0].src,
            status: 'show'
          };
        }
        body = {
          id: contentSocialId,
          status: 'show',
          comment: 'show',
          type: 'normal',
          title: contentSocialContent.contentSocialTitle,
          author: contentSocialContent.contentSocialAuthor,
          cover: cover,
          description: contentSocialContent.contentSocialDescriptions,
          body: contentSocialContent.contentSocialBody
        };
      }
      console.log('body', body);
      console.log('socialChannelToken', socialChannelToken);
      await axios({
        method: 'POST',
        url: `${CONFIG.ZALO_API_URL}/article/update`,
        params: {
          access_token: socialChannelToken
        },
        headers: {
          'content-type': 'application/json'
        },
        data: body
      })
        .then(function(response) {
          console.log('reponse2', response.data);
          output = response.data.error === 0 ? true : false;
          isDeleted = response.data.error === 201 ? true : false;
        })
        .catch(function(error) {
          console.log('error: ', error.response.data.error);
          console.log('error: ', error.response.config);

          output = false;
        });

      console.log('aa', output, isDeleted);

      resolve({
        output: output,
        isDeleted: isDeleted
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'socialsService'));
    }
  });

const deletePost = (contentSocialId, socialChannelToken) =>
  new Promise(async (resolve, reject) => {
    try {
      // zalo
      let output = {};
      let isDeleted = false;
      const body = {
        id: contentSocialId
      };

      console.log('socialChannelToken', socialChannelToken);
      await axios({
        method: 'POST',
        url: `${CONFIG.ZALO_API_URL}/article/remove`,
        params: {
          access_token: socialChannelToken
        },
        headers: {
          'content-type': 'application/json'
        },
        data: body
      })
        .then(function(response) {
          console.log('reponse');
          output = response.data.error === 0 ? true : false;
          isDeleted = response.data.error === 200 ? true : false;
        })
        .catch(function(error) {
          console.log('error: ', error.response.data.error);
          console.log('error: ', error.response.config);

          output = false;
        });

      console.log('aa', output, isDeleted);

      resolve({
        output: output,
        isDeleted: isDeleted
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'socialsService'));
    }
  });

export default {
  sendQuickReplies,
  sendImage,
  sendFile: sendImage,
  sendText,
  setButton,
  upload,
  getInfoOa,
  getInfoUser,
  sendAlbum,
  getStatisTic,
  updatePost,
  getOneStatistical,
  deletePost
};
