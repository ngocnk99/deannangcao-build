// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import LogModel from '../entity/logs';
// import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import {
  simplifyName,
} from "../utils/helper";
const { /* sequelize, Op, */ users,provinces, /* tblGatewayEntity, Roles */ } = models;

export default {
  get_list: param => new Promise(async (resolve, reject) => {
     try {
      const { filter, range, sort, attributes } = param;
      console.log("sort",sort);

      let whereFilter = filter || {};

      const att = filterHelpers.atrributesHelper(attributes);

      // try {
      //   whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter,'createDate');
      // } catch (error) {
      //   reject(error);
      // }

      if (whereFilter.username) {
        const username = simplifyName(whereFilter.username);

        delete whereFilter.username;
        const re =
        username.length === 1 ? new RegExp(`^${username}`) : new RegExp(`${username}`);

        whereFilter["username"] = { $regex: re, $options: "g" };
      }
      
      if (whereFilter && whereFilter.FromDate && whereFilter.ToDate) {
        whereFilter.createDate = {
          $gte: new Date(whereFilter.FromDate),
          $lt: new Date(whereFilter.ToDate),
        };
        delete whereFilter.FromDate;
        delete whereFilter.ToDate;
      }

      console.log("whereFilter===",whereFilter)

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage)+1;
      console.log('perPage==', perPage);
      // whereFilter = await filterHelpers.makeStringFilterRelatively(['provinceName'], whereFilter, 'provinces');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);
      const total = await LogModel.countDocuments(whereFilter);
     
     
      LogModel
          .find(
             whereFilter,
             {},
            // {
            //   skip: page === 0 ? 0 : perPage * page, // Starting Row
            //   limit: perPage, // Ending Row
            //   sort: sort,

            // }
          )
          .sort(sort)
          // .skip(page === 0 ? 0 : perPage * page)
          // .limit(perPage)
          .skip(page)
          .limit(perPage)
          // .populate([
          //   { path: "specializations", model: specializationModel },
          //   {
          //     path: "placeGroup",
          //     model: placeGroupModel,
          //     select: ["_id", "name", "images", "makerImage"],
          //   },
          // ])
          .lean()
          .exec(function (err, place) {
            if (!err) {
              resolve({
                rows:place,
                page:page,
                perPage:perPage,
                count:total,
              });
            } else reject(ErrorHelpers.errorReject(err, "getlistError", "placeService"));
          });

      // MODELS.findAndCountAll(provinces,{
      //   where: whereFilter,
      //   order: sort,
      //   attributes: att,
      //   offset: range[0],
      //   limit: perPage, distinct: true,
      //   logging:console.log,
      //   include: [
      //     { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
      //   ]
      // }).then(result => {
      //   resolve({
      //     ...result,
      //     page: page + 1,
      //     perPage
      //   })
      // }).catch(err => {
      //   reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'))
      // });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(provinces,{
        where: { 'id': id },
        attributes: att,
        include: [
          { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
        ]
      }).then(result => {
        if (!result) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        }
        resolve(result)

      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
    }
  }),
 
}
