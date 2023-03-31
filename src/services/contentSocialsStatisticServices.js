import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import fbGetStatistics from './facebook/getStatistics';
import youtubeService from './youtubeService';
import zaloServices from './zalo/index';
const { /* sequelize, */ contentSocialsStatistic, contentSocials, socialChannels, socials } = models;

const getStatic = async contentSocialsDetail => {
  let detailContentSocial = {};

  switch (Number(contentSocialsDetail.socialChannels.socials.id)) {
    case 1: {
      // console.log('fb');
      detailContentSocial = await fbGetStatistics.getOneInfoFacebook({
        contentSocialId: contentSocialsDetail.contentSocialId,
        socialChannelToken: contentSocialsDetail.socialChannels.socialChannelToken,
        socialChannelType: contentSocialsDetail.socialChannels.socialChannelType,
        socialChannelUrl: contentSocialsDetail.socialChannels.socialChannelUrl
      });

      break;
    }
    case 2:
      {
        detailContentSocial = await youtubeService.getStatistical(
          contentSocialsDetail.contentSocialId,
          contentSocialsDetail.socialChannels.socialChannelToken
        );
      }
      // code block
      break;
    case 3:
      {
        detailContentSocial = await zaloServices.getOneStatistical(
          contentSocialsDetail.contentSocialId,
          contentSocialsDetail.socialChannels.socialChannelToken,
          contentSocialsDetail.contentSocialLink
        );
        console.log('6');
      }
      // code block
      break;
    default:
    // code block
  }

  return detailContentSocial;
};

export default {
  get_list: param =>
    new Promise((resolve, reject) => {
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

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(contentSocialsStatistic, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'contentSocialsStatisticServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'contentSocialsStatisticServices'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(contentSocialsStatistic, {
          where: { id },
          attributes: att
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentSocialsStatisticServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentSocialsStatisticServices'));
      }
    }),
  createOrUpdate: async param => {
    let finnalyResult;

    try {
      const id = param.id;

      console.log('id', id);
      let detailContentSocial = {};
      const contentSocialsDetail = await MODELS.findOne(contentSocials, {
        where: { id: id },
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
      });

      if (!contentSocialsDetail) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
      detailContentSocial = await getStatic(contentSocialsDetail);

      console.log('updateStatus', JSON.stringify(detailContentSocial));

      // finnalyResult = detailContentSocial;
      // cập nhật lại thông tin view,comment
      if (detailContentSocial && detailContentSocial.success) {
        // update static
        await MODELS.createOrUpdate(
          contentSocialsStatistic,
          { ...detailContentSocial.statistic, contentSocialsId: id, status: 1 },
          {
            where: { contentSocialsId: id }
          }
        );
        // update image,video.tittle
        await MODELS.createOrUpdate(contentSocials, detailContentSocial.content, {
          where: { id: id }
        });
      }

      // cập nhật lại status nếu bài viết bị xóa
      if (detailContentSocial && detailContentSocial.isDeleted === true) {
        await MODELS.update(
          contentSocials,
          { status: -1 },
          {
            where: { id: id }
          }
        );
      }
      finnalyResult = await MODELS.findOne(contentSocials, {
        where: { id: id },
        include: [
          {
            model: contentSocialsStatistic,
            as: 'contentSocialsStatistic'
          }
        ]
      });
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'contentSocialsStatisticServices');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(contentSocialsStatistic, {
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
              MODELS.update(contentSocialsStatistic, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contentSocialsStatistic, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsStatisticService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsStatisticService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsStatisticService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentSocialsStatisticService'));
      }
    }),
  getStatic
};
