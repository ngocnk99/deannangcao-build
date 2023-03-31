import MODELS from '../models/models';
import r from 'rethinkdb';
import CONFIG from '../config';
import models from '../entity/index';
import _ from 'lodash';
import moment from 'moment';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
// import errorCode from '../utils/errorCode';
// import viMessage from '../locales/vi';
import * as ApiErrors from '../errors';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
// import logger from '../utils/logger';

const { sequelize, Op, users, mails, receivers, userGroupRoles, sites, mailPositions } = models;

export default {
  get_conversationsId: param =>
    new Promise(async (resolve, reject) => {
      try {
        const filter = param.filter;
        const range = param.range;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        const { senderId, recipientId } = filter;

        console.log('get_conversationsId filter: ', filter);
        let whereFilter;

        if (!whereFilter) {
          whereFilter = _.omit(filter, ['fullname', 'userReceiversId']);
        }

        const connection = await r.connect({
          host: CONFIG['RETHINKDB_SERVER'],
          port: CONFIG['RETHINKDB_PORT'],
          db: CONFIG['RETHINKDB_DB']
        });

        await r
          .table('conversations')
          .filter(function(conversation) {
            return conversation('sender')('id')
              .eq(senderId.toString())
              .and(
                conversation('recipient').contains(function(recipient) {
                  return recipient('id').eq(recipientId.toString());
                })
              )
              .or(
                conversation('sender')('id')
                  .eq(recipientId.toString())
                  .and(
                    conversation('recipient').contains(function(recipient) {
                      return recipient('id').eq(senderId.toString());
                    })
                  )
              );
            // .and(conversation.hasFields(conversation("conversations")("name")))
            // .and(conversation("conversations")("name").default('').eq(''))
          })
          .eqJoin('conversationId', r.table('conversationGroups'), { index: 'id' })
          .orderBy(r.desc('time'))
          .skip(page)
          .limit(perPage)
          .without({ right: { id: true, time: true } })
          .zip()
          .filter({ name: '' })
          .run(connection, function(err, result) {
            console.log('get_conversationsId result: ', result);

            resolve({
              rows: result,
              page: page + 1,
              perPage
            });
          });
        // MODELS
        //   .findAndCountAll(mails,{
        //     where: whereFilter,
        //     order: sort,
        //     offset: range[0],
        //     attributes: att,
        //     limit: perPage,
        //     include: [
        //       {
        //         model: users,
        //         as: 'senders',
        //         attributes: ['id','fullname']
        //       },
        //       {
        //         model: receivers,
        //         as: 'listReceivers',
        //         attributes: ['receiversId','status'],
        //         include: [
        //           {
        //             model: users,
        //             as: 'receivers',
        //             required: true,
        //             where: filter.userReceiversId ? {id: filter.userReceiversId} : {},
        //             attributes:['fullname']
        //           }
        //         ],
        //       }
        //     ]
        //   })
        //   .then(result => {
        //     resolve({
        //       ...result,
        //       page: page + 1,
        //       perPage
        //     });
        //   })
        //   .catch(error => {
        //     reject(error);
        //   });
      } catch (error) {
        reject(error);
      }
    }),

  get_roomsChatId: param =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('param', param);
        const checkExistsRoomChats = await sequelize.query('call sp_roomChats_get_by_list_usersId(:in_listUsers)', {
          replacements: {
            in_listUsers: JSON.stringify(param)
          },
          type: sequelize.QueryTypes.SELECT
        });

        const resultRoomChats = checkExistsRoomChats[0];

        resolve(Object.values(resultRoomChats));
      } catch (error) {
        reject(error);
      }
    })
};
