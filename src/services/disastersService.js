import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';
import axios from 'axios';
import CONFIG from '../config';
import tokenSerivce from './tokenSerivce';
import youtubeService from './youtubeService';
import { publishContentFacebook } from './facebook/publishContent';
import { publishContentZalo } from './zalo/publishContent';
import fbGetStatistics from './facebook/getStatistics';

const {
  sequelize, disastersContents,
  contents,
  users,
  disasters,
  disasterGroups,
  producers,
  news,
  disastersNews
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['disasterName'], whereFilter, 'disasters');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(disasters, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          subQuery: false,
          attributes: att,
          logging:console.log,
          include: [
            {
              model: disasterGroups,
              as: 'disasterGroups',
              attributes: ['id', 'disasterGroupName'],
              required: true
            },
            {
              model: disastersContents,
              as: 'disastersContents',
              include: [
                {
                  model: contents,
                  as: 'contents',
                  attributes: ['id', 'contentName', 'contentImages', 'contentFiles']
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
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
      }
    }),

  dashboard: param => new Promise(async (resolve, reject) => {

      try {
        let finnalyResult={};
  
        const { filter, range } = param;
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage) + 1;
        console.log("filter=",filter)
        let verifyToken;
        let disasterVndmsId;
        if(filter.token)
        {
          verifyToken= await tokenSerivce.verifyToken(filter.token);
          console.log("verifyToken=",verifyToken)
          if(verifyToken)
          {
            disasterVndmsId = verifyToken.dataToken.id || 0
          }
          else
          {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'disasterService'))
          }
        }
        else
        {
          disasterVndmsId = filter.disasterVndmsId || 0;
        }
        console.log("disasterVndmsId=",disasterVndmsId)
        console.log( "perPage= ",perPage)
        console.log( "page= ",page)
        let result = await sequelize.query(
          'call sp_dashboard_byDisasters(:in_disasterVndmsId, :in_type, :in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;',
          {
            replacements: {
              in_disasterVndmsId: disasterVndmsId,
              in_type: filter.type || 1,
              in_PageIndex:page,
              in_PageSize:perPage,
            },
            type: sequelize.QueryTypes.SELECT
          }
        );
       //  console.log("result===",result)
        const overview = Object.values(result[0])[0];
        let rows = Object.values(result[1]);
        let outOutput = result[3]['@out_TotalCount'];
        // console.log("rows===",rows)
        result = result.map(e => e['0']);
  
        // console.log("rows===",rows)
        // 
        // console.log("outOutput===",outOutput)
        let totalLikeFacebook=0
        let totalViewFacebook=0
        let totalCommentFacebook=0;
        let totalShareFacebook =0;

        let totalLikeYoutube=0
        let totalViewYoutube=0
        let totalCommentYoutube=0;
        let totalShareYoutube=0;

        let totalLikeZalo=0
        let totalViewZalo=0
        let totalCommentZalo=0;
        let totalShareZalo=0;

        console.log("vào đây",filter.type)
        if(Number(filter.type)===4 || Number(filter.type)===5 || Number(filter.type)===6)
        {
          console.log("vào đây")
          rows = await Promise.all(
            rows.map(async res => {
              let url;
              console.log('socialChannelToken', res.socialChannels);

              // facebook

              if (+res.socialChannels.socials.id === 1) {
                let fbDetail = await fbGetStatistics.getDetailFacebook({
                  contentSocialId: res.contentSocialId,
                  socialChannelToken: res.socialChannels.socialChannelToken,
                  socialChannelType: res.socialChannels.socialChannelType,
                  detailSocialChannel: {
                    socialChannelName: res.socialChannels.socialChannelName,
                    id: res.socialChannels.id,
                    socialChannelUrl: res.socialChannels.socialChannelUrl
                  }
                });
                // if (fbDetail.success === true) {
                console.log('fbDetail', fbDetail);
                res.socialChannels.statistic = fbDetail.statistic;
                res.warring = fbDetail.warring;
             
                _.forEach(fbDetail.statistic,function(item){
                    if(item.name ==='Lượt thích')
                      {
                        totalLikeFacebook += Number(item.values);
              
                      }
                    else  if(item.name ==='Lượt xem')
                      {
                        totalViewFacebook += Number(item.values);
    
                      }
                    else if(item.name ==='Số lượt bình luận')
                    {
                      totalCommentFacebook += Number(item.values);
         
                    }
                 }) 
                   
                delete res.socialChannels.socialChannelToken;
                return res;
                // }
              } else if (+res.socialChannels.socials.id === 2) {
                // youtube
                url = `https://content-youtube.googleapis.com/youtube/v3/videos?id=${res.contentSocialId}&part=statistics`;
                const ytToken = await axios({
                  method: 'POST',
                  url: `${CONFIG.GOOGLE_API_URL}/token`,
                  params: {
                    refresh_token: res.socialChannels.socialChannelToken,
                    grant_type: 'refresh_token',
                    client_id: `${CONFIG.YOUTUBE_CLIENT_ID}`,
                    client_secret: `${CONFIG.YOUTUBE_CLIENT_SECRET}`
                  }
                }).catch(error => {
                  // console.log('error ===', error.message);
                  errors.push(error);
                  res.socialChannels.statistic = null;
                  delete res.socialChannels.socialChannelToken;
                  return res;
                });


                

                if (ytToken?.data) {
                  const youtube = await axios({
                    method: 'GET',
                    url,
                    headers: {
                      'content-type': 'application/json',
                      Authorization: `Bearer ${ytToken?.data?.access_token}`
                    }
                  });
             

                  if (youtube.data.items.length > 0) {
                    console.log('youtube===', JSON.stringify(youtube.data.items[0].statistics));
                    res.socialChannels.statistic = youtube.data.items[0].statistics;

                    _.forEach(youtube.data.items[0].statistics,function(item){

                        totalLikeYoutube += Number(item.likeCount);

                        totalViewYoutube += Number(item.viewCount);

                        totalCommentYoutube += Number(item.commentCount);
                   }) 

                  } else res.socialChannels.statistic = null;
                  delete res.socialChannels.socialChannelToken;
                  return res;
                }
              } else if (+res.socialChannels.socials.id === 3) {
                const [arr1, arr2] = await Promise.all([
                  axios({
                    method: 'GET',
                    url: `${CONFIG.ZALO_API_URL}/article/getslice`,
                    params: {
                      access_token: `${res.socialChannels.socialChannelToken}`,
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
                      access_token: `${res.socialChannels.socialChannelToken}`,
                      type: 'video'
                    },
                    headers: {
                      'content-type': 'application/json'
                    }
                  })
                ]).catch(error => {
                  errors.push(error);
                  res.socialChannels.statistic = null;
                  delete res.socialChannels.socialChannelToken;
                  return res;
                });

                const found = [...arr1.data.data.medias, ...arr2.data.data.medias].find(
                  r => r.id === res.contentSocialId
                );
                if (found) {
                  res.socialChannels.statistic = _.pick(found, ['total_view', 'total_share']);

                  _.forEach(res.socialChannels.statistic ,function(item){

                    totalShareZalo += Number(item.total_share);

                    totalViewZalo += Number(item.total_view);

               }) 

                } else res.socialChannels.statistic = null;
                delete res.socialChannels.socialChannelToken;
                return res;
              }
              
            })
          );
        }
        console.log("overview==",overview)
        let token =await tokenSerivce.createToken(
          {id: filter.disasterVndmsId}
        )

        console.log("token=", JSON.stringify(token))
        let overviewFinal = {
          disasterName: overview.disasterName,
          disasterGroups: overview.disasterGroups,
          linkDetail: CONFIG.URLVNDMS+"?token="+token.token,
          totalNews: overview.totalNews,
          totalContents: overview.totalContents,
          totalNewsPoint: overview.totalNewsPoint,
          facebooks:{
            totalContentSocialsOfFacebook: overview.totalContentSocialsOfFacebook,
            totalLike:totalLikeFacebook,
            totalView:totalViewFacebook,
            totalComment:totalCommentFacebook,
            totalShare:totalShareFacebook
          },
          youtube:{
            totalContentSocialsOfYoutube: overview.totalContentSocialsOfYoutube,
            totalLike:totalLikeYoutube,
            totalView:totalViewYoutube,
            totalComment:totalCommentYoutube,
            totalShare:totalShareYoutube
          },
          zalo:{
            totalContentSocialsOfZalo: overview.totalContentSocialsOfZalo,
            totalLike:totalLikeZalo,
            totalView:totalViewZalo,
            totalComment:totalCommentZalo,
            totalShare:totalShareZalo
          }
        }



        finnalyResult = { overview:overviewFinal, rows: rows, outOutput };
  
        // console.log("finnalyResult===",finnalyResult)
        resolve({
          ...finnalyResult,
          page,
          perPage
        })
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('disasters get_one param: %o | id: ', param, param.id);
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(disasters, {
          where: { id },
          attributes: att,
          logging: console.log,
          include: [
            {
              model: disasterGroups,
              as: 'disasterGroups',
              attributes: ['id', 'disasterGroupName'],
              required: true
            },
            {
              model: disastersContents,
              as: 'disastersContents',
              include: [
                {
                  model: contents,
                  as: 'contents',
                  attributes: ['id', 'contentName', 'contentImages', 'contentFiles'],
                  include: [
                    {
                      model: producers,
                      as: 'producers',
                      attributes: ['id', 'producerName']
                    }
                  ]
                }
              ]
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: news,
              as: 'news',
              attributes: { exclude: ['newsDescription', 'userCreatorsId'] }
              // required: true
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
      }
    }),
  get_one_vndms: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('disasters get_one params: %o | id: ', param, param.disasterVndmsId);
        const disasterVndmsId = param.disasterVndmsId;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(disasters, {
          where: { disasterVndmsId },
          attributes: att,
          logging: console.log,
          include: [
            {
              model: disasterGroups,
              as: 'disasterGroups',
              attributes: ['id', 'disasterGroupName'],
              required: true
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
      }
    }),
    createOrUpdate: async param => {
      let finnalyResult;
  
      try {
        const entity = param.entity;

        let whereFilter = {
         // disasterName: entity.disasterName,
          disasterVndmsId: entity.disasterVndmsId
        };
  
       //  whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterName'], whereFilter, 'disasters');

        console.log("whereFilter===",whereFilter)
  
        finnalyResult = await MODELS.createOrUpdate(disasters, param.entity,{
          where: whereFilter
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
       
        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterCreateError']
          });
        }
      } catch (error) {
        ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
      }
  
      return { result: finnalyResult };
    },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService create: ', entity);
      let whereFilter = {
        disasterName: entity.disasterName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterName'], whereFilter, 'disasters');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(disasters, {
              where: whereFilter
            }),
            entity.disasterName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.disasters.disasterName' }
          )
          // preCheckHelpers.createPromiseCheckNew(
          //   MODELS.findOne(disasters, {
          //     where: {
          //       disasterVndmsId: entity.disasterVndmsId
          //     }
          //   }),
          //   entity.disasterVndmsId ? true : false,
          //   TYPE_CHECK.CHECK_DUPLICATE,
          //   { parent: 'api.disasters.disasterVndmsId' }
          // )
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await MODELS.create(disasters, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });
      // thêm provinces
      console.log('entity.disastersContentss=', entity.disastersContents);
      if (entity.disastersContents) {
        _.each(entity.disastersContents, function(object) {
          if (Number(object.flag) === 1) {
            MODELS.createOrUpdate(
              disastersContents,
              {
                ..._.pick(object, ['disastersId', 'contentsId']),
                ...{ disastersId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(disastersContents, {
              where: { id: object.id }
            });
          }
        });
      }
      console.log('entity.disastersNews=', entity.disastersNews);
      if (entity.disastersNews) {
        _.each(entity.disastersNews, function(object) {
          if (Number(object.flag) === 1) {
            MODELS.createOrUpdate(
              disastersNews,
              {
                ..._.pick(object, ['disastersId', 'newsId']),
                ...{ disastersId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(disastersNews, {
              where: { id: object.id }
            });
          }
        });
      }

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);

      const foundGateway = await MODELS.findOne(disasters, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'disasters' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          disasterName: entity.disasterName || foundGateway.disasterName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterName'], whereFilter, 'disasters');
        console.log('b');
        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(disasters, {
                where: whereFilter
              }),
              entity.disasterName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.disasters.disasterName' }
            )
            // preCheckHelpers.createPromiseCheckNew(
            //   MODELS.findOne(disasters, {
            //     where: {
            //       id: { $ne: param.id },
            //       disasterVndmsId: entity.disasterVndmsId
            //     }
            //   }),
            //   entity.disasterVndmsId ? true : false,
            //   TYPE_CHECK.CHECK_DUPLICATE,
            //   { parent: 'api.disasters.disasterVndmsId' }
            // )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }
        console.log('a');
        await MODELS.update(disasters, { ...entity, isLoad: 1 }, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
        console.log('entity.disastersContents==', entity.disastersContents);
        if (entity.disastersContents) {
          _.each(entity.disastersContents, function(object) {
            let entityUpdate = {
              ..._.pick(object, ['disastersId', 'contentsId']),
              ...{ disastersId: param.id }
            };

            if (Number(object.flag) === 1) {
              MODELS.createOrUpdate(disastersContents, entityUpdate, {
                where: { id: object.id }
              });
            } else {
              MODELS.destroy(disastersContents, {
                where: { id: object.id }
              });
            }
          });
        }
        if (entity.disastersNews) {
          _.each(entity.disastersNews, function(object) {
            let entityUpdate = {
              ..._.pick(object, ['disastersId', 'newsId']),
              ...{ disastersId: param.id }
            };

            if (Number(object.flag) === 1) {
              MODELS.createOrUpdate(disastersNews, entityUpdate, {
                where: { id: object.id }
              });
            } else {
              MODELS.destroy(disastersNews, {
                where: { id: object.id }
              });
            }
          });
        }

        finnalyResult = await MODELS.findOne(disasters, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error
          });
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
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(disasters, {
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
              MODELS.update(disasters, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(disasters, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    }),
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        MODELS.findOne(disasters, {
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
              MODELS.destroy(disasters, { where: { id: Number(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(disasters, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
      }
    })
};
