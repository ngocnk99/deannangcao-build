import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import helperRename from '../helpers/lodashHelpers';
import axios from 'axios';
import CONFIG from '../config';
import youtubeService from './youtubeService';
import zaloServices from './zalo/index';
import { publishContentFacebook } from './facebook/publishContent';
import { publishContentZalo } from './zalo/publishContent';
import { Model } from 'mongoose';
import number from 'joi/lib/types/number';
import fbGetStatistics from './facebook/getStatistics';
import updateFbPost from './facebook/updatePost';
import FbdeletePost from './facebook/deletePost';
import contentSocialsStatisticServices from './contentSocialsStatisticServices';

const FormData = require('form-data');
const fs = require('fs');
const qs = require('qs');

const {
  /* sequelize, */ users,
  contents,
  contentSocials,
  socials,
  contentSocialsProvinces,
  provinces,
  socialChannels,
  contentSocialAreas,
  areas,
  contentSocialTargetAudiences,
  targetAudiences,
  contentSocialDisasterGroups,
  disasterGroups,
  contentSocialRelations,
  phasesOfDisasters,
  communicationProductsGroups,
  producers,
  contentSocialsStatistic,
  disasterSocialRelations
} = models;

const insertToDB = async (contentSocialId, param, socialsId, socialChannelToken = '') => {
  const { socialChannelsId, userCreatorsId, dateCreated, dateUpdated, contentsId, status, data, disastersId } = param;
  let entity = {
    contentSocialId,
    contentSocialLink: '',
    socialChannelsId,
    userCreatorsId,
    dateCreated,
    dateUpdated,
    status
  };

  console.log('pa', socialsId, param);

  entity.contentSocialTitle = data.title || data.message || '';
  entity.contentSocialDescriptions = data.description || null;
  if (+socialsId === 3) {
    console.log('datta', data);
    if (data.body) {
      entity.contentSocialBody = data.body;
    }
    if (data.cover) {
      if (data.cover.cover_type === 'video') {
        entity.contentSocialVideo = {
          src: data.cover.video_url,
          cover_type: 'video',
          status: 'show'
        };
      }

      if (data.cover.cover_type === 'photo') {
        entity.contentSocialImages = [
          {
            src: data.cover.photo_url
          }
        ];
      }
    }
    if (data.video) {
      entity.contentSocialVideo = data.video;
    }
    if (data.video_id) {
      //https://rd.zapps.vn/video?id=30a6adccf88911d74898&pageId=280555573236572442
      entity.contentSocialUpdateType = 2;
      entity.contentSocialLink = `https://rd.zapps.vn/video?id=${contentSocialId}&pageId=${socialChannelsId}`;
    } else {
      entity.contentSocialUpdateType = 1;
      //"https://rd.zapps.vn/detail/280555573236572442?id=c607d69283d76a8933c6&pageId=280555573236572442"
      entity.contentSocialLink = `https://rd.zapps.vn/detail/${socialChannelsId}?id=${contentSocialId}&pageId=${socialChannelsId}`;
    }
  }

  if (+socialsId === 2) {
    if (data.video) {
      entity.contentSocialVideo = data.video;
    }
    entity = {
      ...entity,
      contentSocialLink: `https://www.youtube.com/watch?v=${contentSocialId}`,
      contentSocialUpdateType: 0
    };
  }
  // lấy link bài viết facebook
  if (socialsId && +socialsId === 1) {
    if (contentSocialId.includes('_')) {
      entity.contentSocialUpdateType = 0;
    } else {
      entity.contentSocialUpdateType = -1;
    }
    if (param.data.file_url) {
      entity.contentSocialVideo = {
        src: param.data.file_url,
        type: 'video'
      };
    }
    if (param.data.url && param.data.url.length > 0) {
      entity.contentSocialImages = param.data.url.map(e => {
        return { src: e };
      });
    }
    entity.contentSocialLink = `https://www.facebook.com/${contentSocialId}`;
    console.log('fb entity', entity);
    // console.log('url', url.data);
  }
  const result = await MODELS.create(contentSocials, entity).catch(error => {
    throw new ApiErrors.BaseError({
      statusCode: 202,
      type: 'crudError',
      error
    });
  });
  if (!result) {
    throw new ApiErrors.BaseError({
      statusCode: 202,
      type: 'crudInfo',
      message: viMessage['api.message.infoAfterCreateError']
    });
  } else {
    _.forEach(contentsId, function(item) {
      MODELS.createOrUpdate(
        contentSocialRelations,
        {
          contentSocialsId: result.id,
          contentsId: item
        },
        {
          where: {
            contentSocialsId: result.id,
            contentsId: item
          }
        }
      );
    });

    console.log('disastersId====', disastersId);
    _.forEach(disastersId, function(item) {
      console.log('item====', item);
      console.log('contentSocialsId====', result.id);
      MODELS.createOrUpdate(
        disasterSocialRelations,
        {
          contentSocialsId: result.id,
          disastersId: item
        },
        {
          where: {
            contentSocialsId: result.id,
            disastersId: item
          }
        }
      );
    });

    //tạo static và lấy thông tin cần thiết
    contentSocialsStatisticServices.createOrUpdate({ id: result.id });
  }
  return result;
};

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['contentsId']);
        let whereFilterContentsId = _.pick(filter, ['contentsId']);
        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        const att = filterHelpers.atrributesHelper(attributes);
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        if (!whereFilter) {
          whereFilter = { ..._.omit(filter, ['contentsId']) };
        }

        console.log('where', whereFilter);
        console.log('whereFilterContentsId====', attributes);

        MODELS.findAndCountAll(contentSocials, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: contents,
              as: 'contents',
              where: whereFilterContentsId.contentsId ? { id: whereFilterContentsId.contentsId } : {},
              attributes: [],
              required: true
            },
            {
              model: socialChannels,
              as: 'socialChannels',
              attributes: [
                'id',
                'socialChannelName',
                'socialChannelToken',
                'socialChannelType',
                'socialChannelUrl',
                'socialChannelImages'
              ],
              include: [
                {
                  model: socials,
                  as: 'socials',
                  attributes: ['id', 'socialName'],
                  required: true
                }
              ],
              required: true
            },
            {
              model: contentSocialsStatistic,
              as: 'contentSocialsStatistic',
              attributes: ['comment', 'like', 'unlike', 'view', 'share', 'impressionsUnique']
            }
          ]
        })
          .then(async result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'contentSocialsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'contentSocialsService'));
      }
    }),
  get_one_v2: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('get one v2', param.id);
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);
        MODELS.findOne(contentSocials, {
          where: { id },
          attributes: att,
          include: [
            {
              model: contents,
              as: 'contents',
              attributes: [],
              required: true
            },
            {
              model: contentSocialsStatistic,
              as: 'contentSocialsStatistic'
              // required: true
            },
            {
              model: socialChannels,
              as: 'socialChannels',
              attributes: [
                'id',
                'socialChannelName',
                'socialChannelToken',
                'socialChannelType',
                'socialChannelUrl',
                'socialChannelImages'
              ],
              include: [
                {
                  model: socials,
                  as: 'socials',
                  attributes: ['id'],
                  required: true
                }
              ],
              required: true
            }
          ]
        })
          .then(result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentSocialsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentSocialsService'));
      }
    }),
  get_list_v2: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['contentsId']);
        let whereFilterContentsId = _.pick(filter, ['contentsId']);
        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        const att = filterHelpers.atrributesHelper(attributes);
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        if (!whereFilter) {
          whereFilter = { ..._.omit(filter, ['contentsId']) };
        }

        console.log('where', whereFilter);
        console.log('whereFilterContentsId====', attributes);

        const result = await MODELS.findAndCountAll(contentSocials, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: contents,
              as: 'contents',
              where: whereFilterContentsId.contentsId ? { id: whereFilterContentsId.contentsId } : {},
              attributes: [],
              required: true
            },
            {
              model: socialChannels,
              as: 'socialChannels',
              attributes: ['id', 'socialChannelToken', 'socialChannelType', 'socialChannelUrl'],
              include: [
                {
                  model: socials,
                  as: 'socials',
                  attributes: ['id'],
                  required: true
                }
              ],
              required: true
            }
          ]
        }).catch(err => {
          reject(ErrorHelpers.errorReject(err, 'getListError', 'contentSocialsService'));
        });

        let errors = [];

        result.rows = await Promise.all(
          result.rows.map(async resData => {
            let detailContentSocial = {};
            detailContentSocial = await contentSocialsStatisticServices.getStatic(resData);
            if (detailContentSocial && detailContentSocial.success) {
              // update static
              await MODELS.createOrUpdate(
                contentSocialsStatistic,
                { ...detailContentSocial.statistic, contentSocialsId: resData.id, status: 1 },
                {
                  where: { contentSocialsId: resData.id }
                }
              );
              // update image,video.tittle
              await MODELS.createOrUpdate(contentSocials, detailContentSocial.content, {
                where: { id: resData.id }
              });
            }

            // cập nhật lại status nếu bài viết bị xóa
            if (detailContentSocial && detailContentSocial.isDeleted === true) {
              await MODELS.update(
                contentSocials,
                { status: -1 },
                {
                  where: { id: resData.id }
                }
              );
              resData.dataValues.status = -1;
            }

            return true;
          })
        );
        console.log('xonng');
        errors = [...new Set(errors)];
        result.messages = errors;

        const final = await MODELS.findAndCountAll(contentSocials, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: contents,
              as: 'contents',
              where: whereFilterContentsId.contentsId ? { id: whereFilterContentsId.contentsId } : {},
              attributes: [],
              required: true
            },
            {
              model: socialChannels,
              as: 'socialChannels',
              attributes: [
                'id',
                'socialChannelName',
                'socialChannelToken',
                'socialChannelType',
                'socialChannelUrl',
                'socialChannelImages'
              ],
              include: [
                {
                  model: socials,
                  as: 'socials',
                  attributes: ['id', 'socialName'],
                  required: true
                }
              ],
              required: true
            },
            {
              model: contentSocialsStatistic,
              as: 'contentSocialsStatistic',
              attributes: ['comment', 'like', 'unlike', 'view', 'share', 'impressionsUnique']
            }
          ]
        }).catch(err => {
          reject(ErrorHelpers.errorReject(err, 'getListError', 'contentSocialsService'));
        });
        console.log('a');
        resolve({
          ...final,
          page: page + 1,
          perPage
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'contentSocialsService'));
      }
    }),
  get_list_multi: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, attributes } = param;
        let whereFilter = filter;
        whereFilter = helperRename.rename(whereFilter, [['id', 'contentSocialsId']]);
        const att = filterHelpers.atrributesHelper(attributes);
        console.log('where', whereFilter);
        MODELS.findAndCountAll(contentSocialsProvinces, {
          where: whereFilter,
          attributes: ['id'],
          logging: console.log,
          include: [{ model: provinces, as: 'provinces', required: true, attributes: ['points'] }]
        })
          .then(result => {
            //  console.log("result===",JSON.stringify(result) )
            if (result.count > 0) {
              let points;
              let typePolygon = 0;

              _.forEach(result.rows, function(item) {
                // console.log("item.dataValues.provinces==",item)
                // _.forEach(item.dataValues.provinces,function(itemProvinces) {

                // console.log("sfdsfsfs========================",item)
                let itemPoints;

                if (item.dataValues.provinces.dataValues.points.type === 'MultiPolygon') {
                  itemPoints = item.dataValues.provinces.dataValues.points.coordinates;
                  typePolygon = 1;
                } else {
                  itemPoints = [item.dataValues.provinces.dataValues.points.coordinates];
                }

                if (points) {
                  console.log('concat points....');
                  points = _.concat(points, itemPoints);
                } else {
                  points = itemPoints;
                }
                // });
              });

              // if( _.size(points) < 2 && typePolygon === 0)
              // {
              //   resolve(
              //     {
              //       "type": "Polygon",
              //       "coordinates":points
              //     }
              //   )
              // }
              // else{
              resolve({
                type: 'MultiPolygon',
                coordinates: points
              });
              // }
            } else {
              resolve({});
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(contentSocials, {
          where: { id },
          attributes: att,
          include: [
            {
              model: contentSocialAreas,
              as: 'contentSocialAreas',
              include: [
                {
                  model: areas,
                  as: 'areas',
                  required: true,
                  attributes: ['id', 'areaName']
                }
              ]
            },
            {
              model: contentSocialDisasterGroups,
              as: 'contentSocialDisasterGroups',
              include: [
                {
                  model: disasterGroups,
                  as: 'disasterGroups',
                  required: true,
                  attributes: ['id', 'disasterGroupName']
                }
              ]
            },
            {
              model: contentSocialTargetAudiences,
              as: 'contentSocialTargetAudiences',
              include: [
                {
                  model: targetAudiences,
                  as: 'targetAudiences',
                  required: true,
                  attributes: ['id', 'targetAudienceName']
                }
              ]
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            }
          ]
        })
          .then(result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentSocialsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentSocialsService'));
      }
    }),
  create: async param => {
    let finnalyResult;
    let contentSocialId;

    try {
      const listSocialChannels = await MODELS.findAll(socialChannels, {
        where: { socialChannelUrl: { $in: param.entity.socialChannelsId } },
        attributes: ['id', 'socialChannelToken', 'socialChannelName', 'socialsId', 'socialChannelUrl']
      });
      if (listSocialChannels && listSocialChannels.length > 0) {
        finnalyResult = [];
        await Promise.all(
          listSocialChannels.map(async l => {
            if (+l.socialsId === 1) {
              // facebook
              const response = await publishContentFacebook(param, l);
              contentSocialId = response?.data?.id;
              console.log('response', response.data);
              console.log('id bài viết ', contentSocialId);
              console.log('param', JSON.stringify(param));
              let temp = await insertToDB(
                contentSocialId,
                {
                  ...param.entity,
                  socialChannelsId: l.id
                },
                l.socialsId,
                l.socialChannelToken
              );
              finnalyResult.push(temp);
            } else if (+l.socialsId === 2) {
              // youtube
              const ytToken = await axios({
                method: 'POST',
                url: `${CONFIG.GOOGLE_API_URL}/token`,
                params: {
                  refresh_token: l.socialChannelToken,
                  grant_type: 'refresh_token',
                  client_id: `${CONFIG.YOUTUBE_CLIENT_ID}`,
                  client_secret: `${CONFIG.YOUTUBE_CLIENT_SECRET}`
                }
              });
              const yt = await youtubeService.create({ ...param.entity.data, accessToken: ytToken.data.access_token });
              contentSocialId = yt.response;
              const temp = await insertToDB(contentSocialId, { ...param.entity, socialChannelsId: l.id }, l.socialsId);
              finnalyResult.push(temp);
            } else {
              // zalo
              contentSocialId = await publishContentZalo(param, l);
              const temp = await insertToDB(
                contentSocialId,
                {
                  ...param.entity,
                  socialChannelsId: l.id
                },
                l.socialsId
              );
              finnalyResult.push(temp);
            }
          })
        );
      }

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: 'Không tìm thấy ID'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'contentSocialsService');
    }
    return { result: finnalyResult };
  },
  updatePost: async param => {
    let finnalyResult;
    let succes = false;
    let message = 'cập nhật thất bại';
    try {
      const entity = param.entity;
      let updatePost;

      console.log('DistrictService update: ', param);

      const foundGateway = await MODELS.findOne(contentSocials, {
        where: {
          id: param.id
        },
        include: [
          {
            model: socialChannels,
            as: 'socialChannels',
            attributes: ['id', 'socialChannelName', 'socialChannelToken', 'socialChannelType', 'socialChannelUrl'],
            include: [
              {
                model: socials,
                as: 'socials',
                attributes: ['id'],
                required: true
              }
            ],
            required: true
          }
        ]
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          {
            typeCheck: TYPE_CHECK.GET_INFO,
            modelStructure: { parent: 'contentSocials' }
          },
          error
        );
      });

      if (foundGateway) {
        switch (Number(foundGateway.socialChannels.socials.id)) {
          case 1: {
            console.log('fb');
            updatePost = await updateFbPost({
              postId: foundGateway.contentSocialId,
              accessToken: foundGateway.socialChannels.socialChannelToken,
              message: entity.contentSocialTitle
            });

            break;
          }
          case 2:
            console.log('yt', entity);
            updatePost = await youtubeService.update(
              foundGateway.contentSocialId,
              foundGateway.socialChannels.socialChannelToken,
              {
                ...entity,
                categoryId: foundGateway.categoryId
              }
            );
            // code yt
            break;
          case 3:
            console.log('zalo');
            updatePost = await zaloServices.updatePost(
              foundGateway.contentSocialId,
              foundGateway.socialChannels.socialChannelToken,
              foundGateway,
              { ...entity, video_id: foundGateway.contentSocialVideo?.video_id }
            );
            // code zalo
            console.log('zalo');
            break;
          default:
          // code block
        }
        console.log('updatePost', updatePost);

        if (updatePost.output === true) {
          await MODELS.update(contentSocials, entity, { where: { id: parseInt(param.id) } }).catch(error => {
            console.log('err2', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          succes = true;
          message = 'Cập nhật thành công';
        }
        if (updatePost.isDeleted === true) {
          await MODELS.update(contentSocials, { status: -1 }, { where: { id: parseInt(param.id) } }).catch(error => {
            console.log('err2', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          succes = false;
          message = 'bài viết bị xóa trước đó';
        }
        console.log('ok');
        finnalyResult = await MODELS.findOne(contentSocials, {
          where: { id: param.id }
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError']
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'contentSocialsService');
    }

    return { result: { succes: succes, message: message, result: finnalyResult } };
  },
  deletePost: async param => {
    let finnalyResult;
    let succes = false;
    let message = 'xóa thật bại';
    try {
      let deletePost = false;
      console.log('DistrictService update: ', param);

      const foundGateway = await MODELS.findOne(contentSocials, {
        where: {
          id: param.id
        },
        include: [
          {
            model: socialChannels,
            as: 'socialChannels',
            attributes: ['id', 'socialChannelName', 'socialChannelToken', 'socialChannelType', 'socialChannelUrl'],
            include: [
              {
                model: socials,
                as: 'socials',
                attributes: ['id'],
                required: true
              }
            ],
            required: true
          }
        ]
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          {
            typeCheck: TYPE_CHECK.GET_INFO,
            modelStructure: { parent: 'contentSocials' }
          },
          error
        );
      });

      if (foundGateway) {
        switch (Number(foundGateway.socialChannels.socials.id)) {
          case 1: {
            console.log('fb');
            deletePost = await FbdeletePost({
              postId: foundGateway.contentSocialId,
              accessToken: foundGateway.socialChannels.socialChannelToken
            });

            break;
          }
          case 2: {
            console.log('yt');
            deletePost = await youtubeService.delete(
              foundGateway.contentSocialId,
              foundGateway.socialChannels.socialChannelToken
            );
            // code yt
            break;
          }
          case 3:
            console.log('zalo');
            deletePost = await zaloServices.deletePost(
              foundGateway.contentSocialId,
              foundGateway.socialChannels.socialChannelToken
            );
            // code zalo
            break;
          default:
          // code block
        }
        console.log('deletePost', deletePost);
        if (deletePost.output === true) {
          await MODELS.update(contentSocials, { status: -1 }, { where: { id: parseInt(param.id) } }).catch(error => {
            console.log('err2', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          succes = true;
          message = 'Xóa thành công';
        }

        if (deletePost.isDeleted === true) {
          await MODELS.update(contentSocials, { status: -1 }, { where: { id: parseInt(param.id) } }).catch(error => {
            console.log('err2', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          succes = true;
          message = 'Xóa thành công';
        }

        console.log('ok');
        finnalyResult = await MODELS.findOne(contentSocials, {
          where: { id: param.id }
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError']
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'contentSocialsService');
    }

    return { result: { succes: succes, message: message, result: finnalyResult } };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);

      const foundGateway = await MODELS.findOne(contentSocials, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          {
            typeCheck: TYPE_CHECK.GET_INFO,
            modelStructure: { parent: 'contentSocials' }
          },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          contentSocialName: entity.contentSocialName || foundGateway.contentSocialName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['contentSocialName'],
          whereFilter,
          'contentSocials'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(contentSocials, {
                where: whereFilter
              }),
              entity.contentSocialName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.contentSocials.contentSocialName' }
            )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await MODELS.update(contentSocials, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        // thêm contentSocialDisasterGroups
        console.log('entity.contentSocialDisasterGroups=', entity.contentSocialDisasterGroups);
        if (entity.contentSocialDisasterGroups) {
          _.each(entity.contentSocialDisasterGroups, function(object) {
            if (object.flag === 1) {
              MODELS.createOrUpdate(
                contentSocialDisasterGroups,
                {
                  ..._.pick(object, ['disasterGroupsId', 'contentSocialsId']),
                  ...{ contentSocialsId: param.id }
                },
                {
                  where: { id: object.id }
                }
              );
            } else {
              MODELS.destroy(contentSocialDisasterGroups, {
                where: { id: object.id }
              });
            }
          });
        }
        console.log('entity.contentSocialAreas=', entity.contentSocialAreas);
        if (entity.contentSocialAreas) {
          _.each(entity.contentSocialAreas, function(object) {
            if (object.flag === 1) {
              MODELS.createOrUpdate(
                contentSocialAreas,
                {
                  ..._.pick(object, ['areasId', 'contentSocialsId']),
                  ...{ contentSocialsId: param.id }
                },
                {
                  where: { id: object.id }
                }
              );
            } else {
              MODELS.destroy(contentSocialAreas, {
                where: { id: object.id }
              });
            }
          });
        }
        console.log('entity.contentSocialTargetAudiences=', entity.contentSocialTargetAudiences);
        if (entity.contentSocialTargetAudiences) {
          _.each(entity.contentSocialTargetAudiences, function(object) {
            if (object.flag === 1) {
              MODELS.createOrUpdate(
                contentSocialTargetAudiences,
                {
                  ..._.pick(object, ['targetAudiencesId', 'contentSocialsId']),
                  ...{ contentSocialsId: param.id }
                },
                {
                  where: { id: object.id }
                }
              );
            } else {
              MODELS.destroy(contentSocialTargetAudiences, {
                where: { id: object.id }
              });
            }
          });
        }

        finnalyResult = await MODELS.findOne(contentSocials, {
          where: { id: param.id },
          include: [
            {
              model: contentSocialAreas,
              as: 'contentSocialAreas',
              include: [
                {
                  model: areas,
                  as: 'areas',
                  required: true,
                  attributes: ['id', 'areaName']
                }
              ]
            },
            {
              model: contentSocialDisasterGroups,
              as: 'contentSocialDisasterGroups',
              include: [
                {
                  model: disasterGroups,
                  as: 'disasterGroups',
                  required: true,
                  attributes: ['id', 'disasterGroupName']
                }
              ]
            },
            {
              model: contentSocialTargetAudiences,
              as: 'contentSocialTargetAudiences',
              include: [
                {
                  model: targetAudiences,
                  as: 'targetAudiences',
                  required: true,
                  attributes: ['id', 'targetAudienceName']
                }
              ]
            }
          ]
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError']
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'contentSocialsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(contentSocials, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(contentSocials, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contentSocials, { where: { id: param.id } })
                    .then(result => {
                      if (!result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1, result: result });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
      }
    }),
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        MODELS.findOne(contentSocials, {
          where: {
            id
          }
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.destroy(contentSocials, { where: { id: Number(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contentSocials, { where: { id: param.id } })
                    .then(result => {
                      if (result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1 });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsService'));
      }
    })
};
