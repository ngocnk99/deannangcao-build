import axios from 'axios';
import CONFIG from '../../config';
import * as ApiErrors from '../../errors';

const fs = require('fs');
const FormData = require('form-data');

const uploadVideoGetId = async (socialChannelToken, file) => {
  const formData = new FormData();
  const videoUrl = `${CONFIG.LOCAL_FILE_PATH}/${file}`;
  console.log('zalo video url', videoUrl);
  if (fs.existsSync(videoUrl)) {
    formData.append('file', fs.createReadStream(videoUrl));
    // formData.append('file', fs.createReadStream(`C:\\Users\\Admin\\Videos\\Captures\\videotest.mp4`));
    console.log('upload video');
    const videoUpload = await axios({
      method: 'POST',
      url: `${CONFIG.ZALO_API_URL}/article/upload_video/preparevideo`,
      data: formData,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: formData.getHeaders(),
      params: {
        access_token: socialChannelToken
      }
    });
    console.log('upload video succes', videoUpload.data);
    const token = videoUpload.data.data.token;
    // kiểm tra token video
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const video = await axios({
          method: 'GET',
          url: `${CONFIG.ZALO_API_URL}/article/upload_video/verify`,
          params: {
            access_token: socialChannelToken,
            token
          }
        }).catch(error => {
          reject(new ApiErrors.BaseError(error));
        });
        if (+video.data.data.convert_percent === 100) {
          clearInterval(interval);
          console.log('video', video.data);
          resolve(video.data.data.video_id);
        }
        if (video.data.error) {
          clearInterval(interval);
          reject(
            new ApiErrors.BaseError({
              statusCode: 422,
              type: 'crudInfo',
              message: `Định dạng không đúng`
            })
          );
        }
      }, 1000);
    });
  } else {
    console.log('không tìm thấy video', videoUrl);
    return null;
  }
};

export const publishContentZalo = async (param, socialChannel) => {
  // check cover đại diện là video
  if (param.entity.data?.cover?.cover_type === 'video') {
    const videoId = await uploadVideoGetId(socialChannel.socialChannelToken, param.entity.data.cover?.video_url);
    if (!videoId) {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudNotExisted',
        message: `Không tìm thấy  video`
      });
    }
    delete param.entity.data.cover.video_url;
    param.entity.data.cover.cover_view = 'horizontal';
    param.entity.data.cover.video_id = videoId;
    console.log(' video Id', videoId);
  }

  // bài viết video
  if (param.entity.data?.file) {
    // zalo video
    const videoId = await uploadVideoGetId(socialChannel.socialChannelToken, param.entity.data?.file);
    if (!videoId) {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudNotExisted',
        message: `Không tìm thấy  video`
      });
    }
    delete param.entity.data.file;
    param.entity.data.video_id = videoId;
    console.log('bài viết video Id', videoId);
    // const videoResult = await axios({
    //   method: 'GET',
    //   url: `https://openapi.zalo.me/v2.0/article/getdetail`,
    //   params: {
    //     access_token: socialChannel.socialChannelToken,
    //     id: videoId
    //   }
    // });
    // console.log('videoResult', videoResult);
  }

  const response = await axios({
    method: 'POST',
    url: `${CONFIG.ZALO_API_URL}/article/create`,
    data: JSON.stringify(param.entity.data),
    params: {
      access_token: socialChannel.socialChannelToken
    },
    headers: {
      'content-type': 'application/json'
    }
  }).catch(error => {
    throw new ApiErrors.BaseError(error);
  });
  if (response.data?.error) {
    throw new ApiErrors.BaseError({
      statusCode: 422,
      type: 'crudInfo',
      message: `Định dạng không đúng`
    });
  }

  // kiểm tra token bài viết
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const token = await axios({
        method: 'POST',
        url: `${CONFIG.ZALO_API_URL}/article/verify`,
        data: { token: `${response.data.data.token}` },
        params: {
          access_token: socialChannel.socialChannelToken
        },
        headers: {
          'content-type': 'application/json'
        }
      }).catch(error => {
        reject(new ApiErrors.BaseError(error));
      });
      if (token.data?.data?.id) {
        clearInterval(interval);
        console.log('id bài viết  ', token.data.data.id);
        resolve(token.data.data.id);
      }
    }, 1000);
  });
};
