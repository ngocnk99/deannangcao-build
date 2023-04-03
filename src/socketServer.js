import moment from 'moment';

import models from './entity/index';
import Model from './models/models';
import _ from 'lodash';
import CONFIG from './config';

const {
  sequelize,
  // ecommerceOrderProcessTransport,
  users,
  chatMessages,
  roomChatsUsers,
  roomChats,
  mails,
  mailsUsers,
  roomMails
} = models;

const server = require('http').createServer();
const io = require('socket.io')(server, {
  // path: '/test',
  serveClient: true,
  // below are engine.IO options
  pingInterval: 25000,
  pingTimeout: 5000,
  cookie: false,
  connectTimeout: 60 * 60 * 1000 * 24,
  httpCompression: true,
  cors: {
    origin: '*'
  }
});

const listSocketId = {};
const listUsersId = {};

io.on('connection', socket => {
  // join Chat
  // socket.emit('joinChat',{'usersId':1,'chatRange':[0,5],'range':[0,5]})
  socket.on('joinChat', async function(data) {
    try {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      let { usersId } = data;

      usersId = Number(usersId);
      let range = data.range;
      let chatRange = data.chatRange;

      if (!range) {
        range = [0, 19];
      }
      if (!chatRange) {
        chatRange = [0, 19];
      }
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;

      const perPageChat = chatRange[1] - chatRange[0] + 1;
      const pageChat = Math.floor(chatRange[0] / perPageChat) + 1;

      socket.join(usersId);
      listUsersId[usersId] = listUsersId[usersId] || [];
      if (!listSocketId[socket.id]) {
        listUsersId[usersId].push(socket.id);
      }

      // lấy thông báo tin nhắn
      const callresultRoomChats = await sequelize.query(
        'call sp_getList_roomChats(:in_usersId,:in_pageIndex,:in_pageSize,@out_rowCount,@out_unReadRoomCount);select @out_rowCount, @out_unReadRoomCount;',
        {
          replacements: {
            in_usersId: usersId,
            in_pageIndex: pageChat,
            in_pageSize: perPageChat
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const rows = Object.values(callresultRoomChats[0]);
      const count = callresultRoomChats[2][0]['@out_rowCount'];
      const totalUnread = callresultRoomChats[2][0]['@out_unReadRoomCount'];

      io.to(socket.id).emit('messageDetail', {
        list: rows,
        pagination: {
          current: page,
          pageSize: perPage,
          total: Number(count)
        },
        totalUnread: totalUnread
      });

      // lấy thông báo email
      const callresultRoomMails = await sequelize.query('call sp_getalll_mail_not_read(:in_usersId)', {
        replacements: {
          in_usersId: usersId
        },
        type: sequelize.QueryTypes.SELECT
      });

      console.log('callresultRoomMails', callresultRoomMails);
      const rowsMail = Object.values(callresultRoomMails[0]);

      console.log('row', rowsMail);
      io.to(socket.id).emit('mailDetail', {
        mailsId: rowsMail[0].mailsId,
        roomMailsId: Array.from(new Set(rowsMail[0].roomMailsId))
      });
      // gửi thông báo online
      listSocketId[socket.id] = usersId;
      const a = await Model.update(
        users,
        { onlineStatus: 1 },
        {
          where: {
            id: usersId
          }
        }
      ).catch(err => {
        console.log('update err', err);
      });

      console.log('a', a, Number(a[0]) === 1);
      if (a && Number(a[0]) === 1) {
        // chuyển từ trạng thái offline sang online
        // lấy danh sách người dùng có cuộc trò chuyện với người dùng này
        console.log('lấy danh sách người chat cùng');
        const callListUsers = await sequelize
          .query('call sp_getAll_users_relatedWithUser(:in_usersId);', {
            replacements: {
              in_usersId: usersId
            },
            type: sequelize.QueryTypes.SELECT
          })
          .catch(err => {
            console.log('callListUsers err', err);
          });

        const listUsers = Object.values(callListUsers[0]);

        if (listUsers) {
          // thông báo cho mọi người là người này đã online
          console.log('listUsers', JSON.stringify(listUsers));
          listUsers.forEach(elementUser => {
            if (listUsersId[elementUser.usersId] && listUsersId[elementUser.usersId].length > 0)
              socket.to(Number(elementUser.usersId)).emit('onlineNotify', {
                usersId: usersId,
                onlineStatus: 1,
                roomChatsUsers: elementUser.roomChatsUsers
              });
          });
        }
      }
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });

  // socket.emit("sendMessages",{ "tranId":0 ,"roomChatsType":0,"roomChatsId":7, "senderId":1, "toUsersId":[51], "message":" hello 1", "attachedFiles":{}, "status":1, "type":0,"replyId":0,"roomChatsName":"test","addUsersId":[  ],"removeUsersId":[],"newRoomChatsName":"new name"})
  socket.on('sendMessages', async function(data) {
    const {
      tranId,
      roomChatsId,
      senderId,
      toUsersId,
      message,
      attachedFiles,
      status,
      roomChatsType,
      type,
      replyId,

      addUsersId,
      removeUsersId,
      newRoomChatsName
    } = data;

    try {
      //  người dùng gửi tin nhắn
      //  data :
      console.log('sendMessages', data);
      let rsroomChatsId;

      // console.log('roomChatsId', roomChatsId);
      const chatMessagesReply = {};
      let messageResult, sender;

      if (roomChatsId && Number(roomChatsId) !== 0) {
        // Tin nhắn hệ thống ( xóa , thêm người)
        if (Number(type) === 1) {
          [messageResult, sender] = await Promise.all([
            Model.create(chatMessages, {
              dateCreated: new Date(),
              roomChatsId: roomChatsId,
              senderId: senderId,
              message: message,
              attachedFiles: attachedFiles,
              status: status || 1, //  1: trạng thái bình thường
              type: type || 0, // 0 tin nhắn thông thường
              replyId: replyId
            }),
            Model.findOne(users, {
              where: {
                id: senderId
              },
              attributes: ['id', 'image', 'username', 'fullname', 'mobile', 'workUnit', 'email']
            })
          ]);
          console.log('thêm / xóa');
          if (addUsersId && addUsersId.length > 0) {
            console.log('thêm');
            await Promise.all(
              addUsersId.map(async usersId => {
                await Model.createOrUpdate(
                  roomChatsUsers,
                  {
                    roomChatsId: roomChatsId,
                    usersId: usersId,
                    lastReadedMessageId: 0,
                    startReadMessageId: messageResult.id,
                    levelUsers: 0, // người tạo phòng , nhắn tin đầu là chủ phòmg
                    joinStatus: 1
                  },
                  {
                    where: {
                      roomChatsId: roomChatsId,
                      usersId: usersId
                    }
                  }
                );

                return true;
              })
            );
          }
          if (removeUsersId && removeUsersId.length > 0) {
            console.log('xóa');
            await Promise.all(
              removeUsersId.map(async usersId => {
                console.log('usersId', usersId);
                await Model.update(
                  roomChatsUsers,
                  {
                    joinStatus: 0,
                    canReadMessageId: messageResult.id
                  },
                  {
                    where: {
                      roomChatsId: roomChatsId,
                      usersId: usersId
                    }
                  }
                );

                return true;
              })
            );
          }
          if (newRoomChatsName) {
            await Model.update(
              roomChats,
              { roomChatsName: newRoomChatsName },
              {
                where: {
                  id: roomChatsId
                }
              }
            );
          }
        }
        rsroomChatsId = roomChatsId;

        // console.log('resultRoomChats', JSON.stringify(resultRoomChats));
      } else {
        const createdRoomChats = await Model.create(roomChats, {
          roomChatsType: roomChatsType || 0,
          roomChatsName: newRoomChatsName || ''
        });

        rsroomChatsId = createdRoomChats.id;

        await Promise.all(
          [senderId, ...toUsersId].map(async usersId => {
            console.log('usersId', usersId);
            await Model.create(roomChatsUsers, {
              roomChatsId: createdRoomChats.id,
              usersId: usersId,
              lastReadedMessageId: 0,
              startReadMessageId: 0,
              levelUsers: Number(usersId) === Number(senderId) ? 1 : 0, // người tạo phòng , nhắn tin đầu là chủ phòmg
              joinStatus: 1
            });

            return true;
          })
        );
      }
      if (Number(type) !== 1 || !roomChatsId || Number(roomChatsId) === 0) {
        [messageResult, sender] = await Promise.all([
          Model.create(chatMessages, {
            dateCreated: new Date(),
            roomChatsId: rsroomChatsId,
            senderId: senderId,
            message: message,
            attachedFiles: attachedFiles,
            status: status || 1, //  1: trạng thái bình thường
            type: type || 0, // 0 tin nhắn thông thường
            replyId: replyId
          }),
          Model.findOne(users, {
            where: {
              id: senderId
            },
            attributes: ['id', 'image', 'username', 'fullname', 'mobile', 'workUnit', 'email']
          })
        ]);
      }
      await sequelize.query(
        'call sp_roomChatsUsers_lastReadedMessageId_update(:in_usersId,:in_roomChatsId,:in_lastReadedMessageId,:in_timeRead);',
        {
          replacements: {
            in_usersId: senderId,
            in_roomChatsId: rsroomChatsId,
            in_lastReadedMessageId: messageResult.id,
            in_timeRead: new Date(moment().add(7, 'h'))
          }
        }
      );

      const resultRoomChats = await Model.findOne(roomChats, {
        where: {
          id: rsroomChatsId
        },
        include: [
          {
            model: roomChatsUsers,
            as: 'roomChatsUsers',
            where: {
              joinStatus: 1
            },
            attributes: ['usersId', 'roomChatsId', 'joinStatus', 'lastReadedMessageId', 'timeRead'],
            include: [
              {
                model: users,
                as: 'users',
                attributes: ['id', 'image', 'username', 'fullname']
              }
            ]
          }
        ]
      });

      if (replyId && Number(replyId) !== 0) {
        const chatMessagesReplyResult = await Model.findOne(chatMessages, {
          where: { id: replyId }
        });

        if (chatMessagesReply) {
          chatMessagesReply.id = replyId;
          chatMessagesReply.dateCreated = chatMessagesReplyResult.dateCreated;
          chatMessagesReply.message = chatMessagesReplyResult.message;
          chatMessagesReply.attachedFiles = chatMessagesReplyResult.attachedFiles;
          chatMessagesReply.type = chatMessagesReplyResult.type;
          chatMessagesReply.replyId = chatMessagesReplyResult.replyId;
          chatMessagesReply.status = chatMessagesReplyResult.status;
          chatMessagesReply.roomChatsId = resultRoomChats.id;
        }
      }

      const messageDetail = {
        senderId: messageResult.senderId,
        toUsersId: toUsersId,
        roomChats: resultRoomChats,
        chatMessages: {
          id: messageResult.id, // nếu senderId là người nhận của socket.id này => gửi tin nhắn thành công
          dateCreated: messageResult.dateCreated,
          message: messageResult.message,
          attachedFiles: messageResult.attachedFiles,
          type: messageResult.type,
          replyId: replyId,
          status: messageResult.status,
          roomChatsId: resultRoomChats.id,
          users: sender,
          chatMessagesReply: chatMessagesReply
        }
      };

      // gửi tin nhắn dên những người nhận trong nhóm , trừ socket gửi
      if (Number(type) === 1) {
        if (removeUsersId && removeUsersId.length > 0) {
          removeUsersId.forEach(addUsersIdelement => {
            if (listUsersId[addUsersIdelement] && listUsersId[addUsersIdelement].length > 0)
              socket.to(Number(addUsersIdelement)).emit('receiveMessage', messageDetail);
          });
        }
      }

      resultRoomChats.roomChatsUsers.forEach(resultRoomChatsElement => {
        if (listUsersId[resultRoomChatsElement.usersId] && listUsersId[resultRoomChatsElement.usersId].length > 0) {
          console.log('gửi đến', resultRoomChatsElement.usersId);
          socket.to(Number(resultRoomChatsElement.usersId)).emit('receiveMessage', messageDetail);
        }
      });
      // Gửi thông báo gửi tin nhắn thành công đến socket id gửi tin nhắn
      // console.log(
      //   'send sendMessageSuccesFully',
      //   JSON.stringify({
      //     succes: true,
      //     chatMessagesId: messageResult.id,
      //     tranId: tranId || 0, // tranId dùng để đánh dấu box chat khi chưa tạo room (chưa nhắn tin lần nào)
      //     roomChatsId: resultRoomChats.id,
      //     senderId: senderId
      //   })
      // );
      io.to(socket.id).emit('sendMessageSuccesFully', {
        succes: true,
        chatMessagesId: messageResult.id,
        tranId: tranId || 0, // tranId dùng để đánh dấu box chat khi chưa tạo room (chưa nhắn tin lần nào)
        roomChatsId: resultRoomChats.id,
        toUsersId: toUsersId,
        roomChats: resultRoomChats,
        senderId: senderId,
        chatMessages: {
          id: messageResult.id, // nếu senderId là người nhận của socket.id này => gửi tin nhắn thành công
          dateCreated: messageResult.dateCreated,
          message: messageResult.message,
          attachedFiles: messageResult.attachedFiles,
          type: messageResult.type,
          status: messageResult.status,
          roomChatsId: resultRoomChats.id,
          users: sender
        }
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('sendMessageSuccesFully', {
        succes: false,
        tranId: tranId || 0, // tranId dùng để đánh dấu box chat khi chưa tạo room (chưa nhắn tin lần nào)
        toUsersId: toUsersId,
        senderId: senderId
      });
    }
  });

  //  socket.emit("getMessagesOfRooms",{"roomChatsId":0, "senderId":204, "toUsersId":[205],'range':[0,5],filter:{},readedMessageId:1}})
  socket.on('getMessagesOfRooms', async data => {
    try {
      //  người dùng gửi tin nhắn
      //  socket.emit("getMessagesOfRooms",{ "senderId":204, toUsersId:[205],})
      console.log('getMessagesOfRooms');
      const { senderId, toUsersId, roomChatsId, readedMessageId } = data;

      const filter = data.filter ? data.filter : {};
      let range = data.range;
      let whereFilter = {};
      let resultRoomChats, messageDetail;

      if (readedMessageId && Number(readedMessageId) !== 0) {
        await Model.update(
          roomChatsUsers,
          {
            lastReadedMessageId: readedMessageId,
            timeRead: new Date()
          },
          {
            where: {
              roomChatsId: roomChatsId,
              usersId: senderId
            }
          }
        );
      }
      if (roomChatsId && Number(roomChatsId) !== 0) {
        resultRoomChats = await Model.findOne(roomChats, {
          where: {
            id: roomChatsId
          },
          include: [
            {
              model: roomChatsUsers,
              as: 'roomChatsUsers',
              attributes: [
                'usersId',
                'roomChatsId',
                'joinStatus',
                'lastReadedMessageId',
                'canReadMessageId',
                'timeRead'
              ],
              include: [
                {
                  model: users,
                  as: 'users',
                  attributes: [
                    'image',
                    'username',
                    'fullname',
                    'mobile',
                    'workUnit',
                    'email',
                    'onlineStatus',
                    'lastTimeOnline'
                  ]
                }
              ]
            }
          ]
        });
      } else {
        const checkExistsRoomChats = await sequelize.query('call sp_roomChats_CheckExists(:in_listUsers)', {
          replacements: {
            in_listUsers: JSON.stringify([senderId, ...toUsersId])
          },
          type: sequelize.QueryTypes.SELECT
        });

        resultRoomChats = checkExistsRoomChats[0] ? checkExistsRoomChats[0][0] : null;
      }

      if (!range) {
        range = [0, 19];
      }
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      if (!resultRoomChats) {
        console.log('room chua ton tai');
        messageDetail = {
          senderId: senderId,
          toUsersId: toUsersId,
          roomChats: {
            id: null,
            roomChatsName: null,
            roomChatsType: null
          },
          message: []
        };
      } else {
        // đã tồn tại room chat

        const resultRoomChatUser = resultRoomChats.roomChatsUsers.find(
          element => Number(element.usersId) === Number(senderId)
        );

        if (resultRoomChatUser.joinStatus === 0) {
          whereFilter = {
            ...filter,
            roomChatsId: resultRoomChats.id,
            // status: 1,
            id: {
              $lte: resultRoomChatUser.canReadMessageId
            }
          };
        } else {
          whereFilter = {
            ...filter,
            roomChatsId: resultRoomChats.id
            // status: 1
          };
        }

        const lstChatMessages = await Model.findAndCountAll(chatMessages, {
          where: whereFilter,
          order: [['id', 'desc']],
          offset: range[0],
          limit: perPage,
          attributes: ['id', 'senderId', 'message', 'attachedFiles', 'dateCreated', 'status', 'type', 'replyId'],
          distinct: true,
          logging: true,

          include: [
            {
              model: chatMessages,
              as: 'chatMessagesReply',
              attributes: ['id', 'senderId', 'message', 'attachedFiles', 'dateCreated', 'status', 'type']
            }
          ]
        });

        messageDetail = {
          roomChats: resultRoomChats,
          message: {
            list: lstChatMessages.rows,
            pagination: {
              current: page + 1,
              pageSize: perPage,
              total: lstChatMessages.count
            }
          }
        };
      }

      io.to(socket.id).emit('receiveListMessage', messageDetail);
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  // socket.emit("getRoomsOfUsers",{"usersId":187})
  socket.on('getRoomsOfUsers', async data => {
    try {
      //  người dùng gửi tin nhắn
      //  data :
      // socket.emit("getRoomsOfUsers",{"usersId":187})
      console.log('sendMessageCheckUser');
      const { usersId } = data;
      let range = data.range;

      if (!range) {
        range = [0, 19];
      }
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;

      const callresultRoomChats = await sequelize.query(
        'call sp_getList_roomChats(:in_usersId,:in_pageIndex,:in_pageSize,@out_rowCount,@out_unReadRoomCount);select @out_rowCount, @out_unReadRoomCount;',
        {
          replacements: {
            in_usersId: usersId,
            in_pageIndex: page,
            in_pageSize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const rows = Object.values(callresultRoomChats[0]);
      const count = callresultRoomChats[2][0]['@out_rowCount'];
      const totalUnread = callresultRoomChats[2][0]['@out_unReadRoomCount'];

      io.to(socket.id).emit('receiveGetRoomsOfUsers', {
        list: rows,
        totalUnread: totalUnread,
        pagination: {
          current: page,
          pageSize: perPage,
          total: Number(count)
        }
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  //  socket.emit("seenMessage",{"roomChatsId":1,"usersId":2,"lastReadedMessageId":3})
  socket.on('seenMessage', async data => {
    try {
      //  người dùng gửi tin nhắn
      //  data :
      //  socket.emit("seenMessage",{"roomChatsId":1,"usersId":2,"lastReadedMessageId":3})
      console.log('seenMessage');
      const { roomChatsId, usersId, lastReadedMessageId } = data;

      await sequelize.query(
        'call sp_roomChatsUsers_lastReadedMessageId_update(:in_usersId,:in_roomChatsId,:in_lastReadedMessageId,:in_timeRead);',
        {
          replacements: {
            in_usersId: usersId,
            in_roomChatsId: roomChatsId,
            in_lastReadedMessageId: lastReadedMessageId,
            in_timeRead: new Date(moment().add(7, 'h'))
          }
        }
      );

      const resultRoomChats = await Model.findOne(roomChats, {
        where: {
          id: roomChatsId
        },
        include: [
          {
            model: roomChatsUsers,
            as: 'roomChatsUsers',
            where: {
              joinStatus: 1
            },
            attributes: ['usersId', 'roomChatsId', 'joinStatus', 'lastReadedMessageId', 'timeRead'],
            include: [
              {
                model: users,
                as: 'users',
                attributes: [
                  'id',
                  'image',
                  'username',
                  'fullname',
                  'mobile',
                  'workUnit',
                  'email',
                  'onlineStatus',
                  'lastTimeOnline'
                ]
              }
            ]
          }
        ]
      });

      resultRoomChats.roomChatsUsers.forEach(resultRoomChatsElement => {
        if (listUsersId[resultRoomChatsElement.usersId] && listUsersId[resultRoomChatsElement.usersId].length > 0)
          socket.to(Number(resultRoomChatsElement.usersId)).emit('viewedNotifications', {
            roomChatsId: roomChatsId,
            usersId: usersId,
            lastReadedMessageId: lastReadedMessageId,
            timeRead: resultRoomChatsElement.timeRead,
            roomChats: resultRoomChats
          });
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  // socket.emit("sendMessages",{ "tranId":0, "roomChatsId":0, "senderId":206, "toUsersId":[205], "message":"206 hello 205", "attachedFiles":{}, "status":1, "type":0,"replyId":0})
  socket.on('createRoomsChat', async function(data) {
    try {
      //  người dùng gửi tin nhắn
      //  data :
      console.log('sendMessages', data);
      const { listUsers, roomChatsName } = data;

      // console.log('roomChatsId', roomChatsId);

      const createdRoomChats = await Model.create(roomChats, {
        roomChatsType: listUsers.length > 2 ? 1 : 0,
        roomChatsName: roomChatsName
      });

      await Promise.all(
        listUsers.map(async elementUser => {
          await Model.create(roomChatsUsers, {
            roomChatsId: createdRoomChats.id,
            usersId: elementUser.usersId,
            lastReadedMessageId: 0,
            startReadMessageId: elementUser.startReadMessageId,
            levelUsers: elementUser.levelUsers,
            joinStatus: 1
          });

          return true;
        })
      );
      const resultRoomChats = await Model.findOne(roomChats, {
        where: {
          id: createdRoomChats.id
        },
        include: [
          {
            model: roomChatsUsers,
            as: 'roomChatsUsers',
            where: {
              joinStatus: 1
            },
            attributes: ['usersId', 'roomChatsId', 'joinStatus', 'lastReadedMessageId', 'timeRead'],
            include: [
              {
                model: users,
                as: 'users',
                attributes: [
                  'id',
                  'image',
                  'username',
                  'fullname',
                  'mobile',
                  'workUnit',
                  'email',
                  'onlineStatus',
                  'lastTimeOnline'
                ]
              }
            ]
          }
        ]
      });

      // console.log('resultRoomChats new', JSON.stringify(resultRoomChats));

      // const messageDetail = {
      //   senderId: messageResult.senderId,
      //   toUsersId: toUsersId,
      //   roomChats: resultRoomChats,
      // };
      // // gửi tin nhắn dên những người nhận trong nhóm , trừ socket gửi

      // resultRoomChats.roomChatsUsers.forEach(resultRoomChatsElement => {
      //   console.log('resultRoomChatsElement', resultRoomChatsElement.usersId);
      //   if (listUsersId[resultRoomChatsElement.usersId] && listUsersId[resultRoomChatsElement.usersId].length > 0)
      //     socket.to(resultRoomChatsElement.usersId).emit('receiveMessage', messageDetail);
      // });

      // Gửi thông báo gửi tin nhắn thành công đến socket id gửi tin nhắn
      // );
      io.to(socket.id).emit('createRoomsChatSuccesFully', {
        succes: true,
        resultRoomChats: resultRoomChats
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  //  socket.emit("removeMessage",{"chatMessagesId":3,"status":-1,"roomChatsId":2})
  socket.on('removeMessage', async function(data) {
    const { chatMessagesId, status, roomChatsId } = data;

    try {
      //  người dùng gửi tin nhắn
      //  data :
      console.log('removeMessage', data);

      // console.log('roomChatsId', roomChatsId);

      const resultChatMessagesId = await Model.findOne(chatMessages, {
        where: {
          id: chatMessagesId,
          roomChatsId: roomChatsId
        },
        include: [
          {
            model: roomChats,
            as: 'roomChats',
            require: true,
            include: [
              {
                model: roomChatsUsers,
                as: 'roomChatsUsers',
                where: {
                  joinStatus: 1
                },
                attributes: ['usersId'],
                require: true,
                include: [
                  {
                    model: users,
                    as: 'users',
                    attributes: ['id'],
                    require: true
                  }
                ]
              }
            ]
          }
        ],
        logging: console.log
      });

      if (!resultChatMessagesId) {
        io.to(socket.id).emit('errors', {
          type: 'removeMessage',
          messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
          dateCreated: moment()
        });
      }
      await Model.update(
        chatMessages,
        { status: status || 0 },
        {
          where: { id: resultChatMessagesId.id }
        }
      ).catch(err => {
        console.log('err', err);
        io.to(socket.id).emit('removeMessageNotify', {
          succes: false,
          id: resultChatMessagesId.id,
          roomChatsId: roomChatsId
        });
      });
      const messageDetail = {
        succes: true,
        id: resultChatMessagesId.id, // nếu senderId là người nhận của socket.id này => gửi tin nhắn thành công,
        roomChatsId: roomChatsId,
        status: status || 0
      };
      // gửi tin nhắn dên những người nhận trong nhóm , trừ socket gửi

      resultChatMessagesId.roomChats.roomChatsUsers.forEach(resultRoomChatsElement => {
        console.log('resultRoomChatsElement', resultRoomChatsElement.usersId);
        if (listUsersId[resultRoomChatsElement.usersId] && listUsersId[resultRoomChatsElement.usersId].length > 0)
          socket.to(Number(resultRoomChatsElement.usersId)).emit('removeMessageNotify', messageDetail);
      });

      io.to(socket.id).emit('removeMessageNotify', messageDetail);
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('removeMessageNotify', {
        succes: false,
        id: chatMessagesId, // nếu senderId là người nhận của socket.id này => gửi tin nhắn thành công,
        roomChatsId: roomChatsId
      });
    }
  });
  // socket.emit("getRoomMailSendToMe",{"usersId":187,range:[0.5],"filter":{"FromDate":..,"ToDate":...,"senderId":number,"roomMailsContent":"tiêu đề thư"}})
  socket.on('getRoomMailSendToMe', async function(data) {
    try {
      //  người dùng gửi tin nhắn
      //  data :
      // socket.emit("getRoomsOfUsers",{"usersId":187})
      console.log('getRoomMailSendToMe data', data);
      const { usersId } = data;
      let range = data.range;
      const filter = data.filter || {};
      let inMailCreateDate = '[]';

      if (filter.FromDate && filter.ToDate) {
        inMailCreateDate = JSON.stringify([
          moment(filter.FromDate).format('YYYY-MM-DD'),
          moment(filter.ToDate).format('YYYY-MM-DD')
        ]);
      }
      console.log('inMailCreateDate', inMailCreateDate);
      if (!range) {
        range = [0, 19];
      }
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;
      const callresultRoomMails = await sequelize.query(
        'call sp_getList_roomMails_nhan(:in_usersId,:in_senderId,:in_roomMailsContent,:in_mailCreateDate,:in_pageIndex,:in_pageSize,@out_rowCount);select @out_rowCount;',
        {
          replacements: {
            in_usersId: usersId,
            in_senderId: filter.senderId || 0,
            in_roomMailsContent: filter.roomMailsContent || '',
            in_mailCreateDate: inMailCreateDate,
            in_pageIndex: page,
            in_pageSize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const rowsMail = Object.values(callresultRoomMails[0]);
      const countMail = callresultRoomMails[2][0]['@out_rowCount'];

      io.to(socket.id).emit('inboxMail', {
        list: rowsMail,
        pagination: {
          current: page,
          pageSize: perPage,
          total: Number(countMail)
        }
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  // socket.emit("getRoomMailByMe",{"usersId":187,range:[0.5],"filter":{"FromDate":..,"ToDate":...,"toUserId":number,"roomMailsContent":"tiêu đề thư"}})
  socket.on('getRoomMailByMe', async function(data) {
    try {
      //  người dùng gửi tin nhắn
      //  data :
      // socket.emit("getRoomsOfUsers",{"usersId":187})
      console.log('getRoomMailByMe data', data);
      const { usersId } = data;
      let range = data.range;
      const filter = data.filter || {};
      let inMailCreateDate = '[]';

      if (filter.FromDate && filter.ToDate) {
        inMailCreateDate = JSON.stringify([
          moment(filter.FromDate).format('YYYY-MM-DD'),
          moment(filter.ToDate).format('YYYY-MM-DD')
        ]);
      }
      console.log('inMailCreateDate', inMailCreateDate);
      if (!range) {
        range = [0, 19];
      }
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;
      const callresultRoomMails = await sequelize.query(
        'call sp_getList_roomMails_gui(:in_usersId,:in_toUsersId,:in_roomMailsContent,:in_mailCreateDate,:in_pageIndex,:in_pageSize,@out_rowCount);select @out_rowCount;',
        {
          replacements: {
            in_usersId: usersId,
            in_toUsersId: filter.toUserId || 0,
            in_roomMailsContent: filter.roomMailsContent || '',
            in_mailCreateDate: inMailCreateDate,
            in_pageIndex: page,
            in_pageSize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const rowsMail = Object.values(callresultRoomMails[0]);
      const countMail = callresultRoomMails[2][0]['@out_rowCount'];

      io.to(socket.id).emit('outboxMail', {
        list: rowsMail,
        pagination: {
          current: page,
          pageSize: perPage,
          total: Number(countMail)
        }
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  //  socket.emit("getMailsOfRoom",{"roomMailsId":0,'range':[0,5],"usersId":1,"filter":{}}})
  socket.on('getMailsOfRoom', async data => {
    try {
      //  người dùng gửi tin nhắn
      //  data :
      // socket.emit("getMailsOfRoom",{"usersId":187})
      console.log('getMailsOfRoom');
      const { roomMailsId, usersId } = data;
      const filter = data.filter ? data.filter : {};
      let range = data.range;

      if (!range) {
        range = [0, 19];
      }
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;

      const [callresultRoomMails, roomResult] = await Promise.all([
        sequelize.query(
          'call sp_mails_of_room(:in_roomMailsId,:in_type,:in_usersId,:in_pageIndex,:in_pageSize,@out_rowCount);select @out_rowCount;',
          {
            replacements: {
              in_roomMailsId: roomMailsId,
              in_type: filter.type || -1,
              in_usersId: usersId,
              in_pageIndex: page,
              in_pageSize: perPage
            },
            type: sequelize.QueryTypes.SELECT
          }
        ),
        Model.findOne(roomMails, { where: { id: roomMailsId } })
      ]);

      console.log('callresultRoomMails', callresultRoomMails);
      const rowsMail = Object.values(callresultRoomMails[0]);
      const countMail = callresultRoomMails[2][0]['@out_rowCount'];

      io.to(socket.id).emit('mailsOfRoom', {
        roomMails: roomResult,
        list: rowsMail,
        pagination: {
          current: page,
          pageSize: perPage,
          total: Number(countMail)
        }
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });

  //  socket.emit("removeMail",{"mailsId":3,"status":-1,"usersId":1,"roomMailsId":0})
  socket.on('removeMail', async function(data) {
    const { mailsId, status, usersId, roomMailsId } = data;

    try {
      //  người dùng gửi tin nhắn
      //  data :
      console.log('removeMail', data);
      let deleteAll;
      // console.log('roomMailsId', roomMailsId);
      let roomIdRemoveOne = null;

      if (!roomMailsId || Number(roomMailsId) === 0) {
        // xóa 1 mail
        deleteAll = false;
        const getMail = await sequelize.query('call sp_mail_one(:in_mailsId)', {
          replacements: {
            in_mailsId: mailsId
          },
          type: sequelize.QueryTypes.SELECT
        });
        const resulutMail = Object.values(getMail[0])[0];

        if (!resulutMail) {
          io.to(socket.id).emit('errors', {
            type: 'removeMail',
            messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
            dateCreated: moment()
          });
        }
        roomIdRemoveOne = resulutMail.roomMailsId;
        if (Number(resulutMail.userSendersId) === Number(usersId)) {
          await Model.update(
            mails,
            { status: status || -1 },
            {
              where: { id: resulutMail.id }
            }
          );
        } else {
          await Model.update(
            mailsUsers,
            { status: status || -1 },
            {
              where: {
                mailsId: resulutMail.id,
                usersId: usersId
              }
            }
          );
        }
        const allMailNhan = await sequelize.query('call sp_mails_of_room_get_all(:in_roomMailsId,:in_usersId)', {
          replacements: {
            in_roomMailsId: resulutMail.roomMailsId,
            in_usersId: usersId
          },
          type: sequelize.QueryTypes.SELECT
        });
        const row = allMailNhan[0];
        const mailall = Object.values(row);

        console.log('mailall', mailall);
        if (mailall.length === 0) deleteAll = true;
      } else {
        deleteAll = true;
        const allMailNhan = await sequelize.query('call sp_mails_of_room_get_all(:in_roomMailsId,:in_usersId)', {
          replacements: {
            in_roomMailsId: roomMailsId,
            in_usersId: usersId
          },
          type: sequelize.QueryTypes.SELECT
        });
        const row = allMailNhan[0];
        const mailall = Object.values(row);

        await Promise.all(
          mailall.map(mailElement => {
            if (Number(mailElement.userSendersId) === Number(usersId)) {
              return Model.update(
                mails,
                { status: -1 },
                {
                  where: { id: mailElement.id }
                }
              );
            } else {
              console.log('mailElement', mailElement);

              return Model.update(
                mailsUsers,
                { status: -1 },
                {
                  where: {
                    mailsId: mailElement.id,
                    usersId: usersId
                  }
                }
              );
            }
          })
        );
      }
      const messageDetail = {
        succes: true,
        mailsId: mailsId || 0,
        deleteAll: deleteAll,
        roomMailsId: roomIdRemoveOne || roomMailsId || 0,
        usersId: usersId,
        userSendersId: usersId,
        status: status || -1
      };

      io.to(socket.id).emit('removeMailNotify', messageDetail);
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('removeMailNotify', {
        succes: false,
        id: mailsId // nếu senderId là người nhận của socket.id này => gửi tin nhắn thành công,
      });
    }
  });
  //  socket.emit("sendMail", { "tranId":0, "roomMailsId":0, "userSendersId":206, "toUsersId":[205], "mailTitle":"mailTitle", "mailContent":"206 hello 205", "Attachment":[], "mailReplyId":0 } )
  socket.on('sendMail', async function(data) {
    const { tranId, roomMailsId, userSendersId, toUsersId, mailTitle, mailContent, attachment, mailReplyId } = data;

    try {
      //  người dùng gửi tin nhắn
      //  data :
      console.log('sendmailContents', data);

      let resultRoomMail;
      // console.log('roomMailsId', roomMailsId);

      if (roomMailsId && Number(roomMailsId) !== 0) {
        resultRoomMail = await Model.findOne(roomMails, {
          where: {
            id: roomMailsId
          }
        });
        // console.log('resultRoomMail', JSON.stringify(resultRoomMail));
      }

      if (!resultRoomMail) {
        resultRoomMail = await Model.create(roomMails, {
          roomMailsContent: mailTitle
        });
      }
      const createMail = await Model.create(mails, {
        roomMailsContent: mailTitle,
        roomMailsId: resultRoomMail.id,
        userSendersId: userSendersId,
        mailTitle: mailTitle,
        mailContent: mailContent,
        attachment: attachment,
        mailReplyId: mailReplyId || 0,
        status: 1
      });

      await Promise.all(
        toUsersId.map(usersId => {
          return Model.create(mailsUsers, {
            roomMailsContent: mailTitle,
            mailsId: createMail.id,
            usersId: usersId,
            readStatus: 0
          });
        })
      );
      console.log('createMail', createMail.id);
      const getMail = await sequelize.query('call sp_mail_one(:in_mailsId)', {
        replacements: {
          in_mailsId: createMail.id
        },
        type: sequelize.QueryTypes.SELECT
      });

      const resulutMail = Object.values(getMail[0])[0];
      const mailContentDetail = {
        roomMailsId: resultRoomMail.id,
        roomMailsContent: resultRoomMail.roomMailsContent,
        mails: resulutMail
      };

      resulutMail.reviceUsers.forEach(resultRoomMailElement => {
        console.log('usersId', resultRoomMailElement.usersId);

        socket.to(Number(resultRoomMailElement.usersId)).emit('nhanThu', mailContentDetail);
      });

      socket.to(Number(userSendersId)).emit('nhanThu', mailContentDetail);

      io.to(socket.id).emit('sendMailSuccesFully', {
        succes: true,
        tranId: tranId || 0, // tranId dùng để đánh dấu box chat khi chưa tạo room (chưa nhắn tin lần nào)
        roomMailsId: resultRoomMail.id,
        roomMailsContent: resultRoomMail.roomMailsContent,
        mails: resulutMail
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('sendMailSuccesFully', {
        succes: false,
        tranId: tranId || 0, // tranId dùng để đánh dấu box chat khi chưa tạo room (chưa nhắn tin lần nào)
        toUsersId: toUsersId,
        userSendersId: userSendersId
      });
    }
  });
  //  socket.emit("seenMail",{"mailsId":3,"usersId":1,"roomMailsId":1 })
  socket.on('seenMail', async function(data) {
    const { mailsId, roomMailsId, usersId } = data;

    try {
      //  người dùng gửi tin nhắn
      //  data :
      console.log('seenMail', data);
      let seenAll;
      let roomMailsIdOne = null;
      // console.log('roomMailsId', roomMailsId);

      if ((!roomMailsId || Number(roomMailsId) === 0) && mailsId) {
        seenAll = false;
        await Model.update(
          mailsUsers,
          {
            readStatus: 1,
            timeRead: new Date()
          },
          {
            where: {
              mailsId: mailsId,
              usersId: usersId
            }
          }
        );
        const resulitMail = await Model.findOne(mails, {
          where: {
            id: mailsId
          }
        });

        roomMailsIdOne = resulitMail.roomMailsId;
      } else if (roomMailsId && Number(roomMailsId) !== 0) {
        seenAll = true;
        const allMailNhan = await sequelize.query(
          'call sp_mails_of_room_not_read_get_all(:in_roomMailsId,:in_usersId)',
          {
            replacements: {
              in_roomMailsId: roomMailsId,
              in_usersId: usersId
            },
            type: sequelize.QueryTypes.SELECT
          }
        );
        const row = allMailNhan[0];
        const mailsNhan = Object.values(row);

        console.log('mailsNhan', mailsNhan);

        Promise.all(
          mailsNhan.map(mailsUser => {
            return Model.update(
              mailsUsers,
              {
                readStatus: 1,
                timeRead: new Date()
              },
              {
                where: {
                  id: mailsUser.id
                }
              }
            );
          })
        );
      } else {
        io.to(socket.id).emit('errors', {
          messages: 'mailsId và roomMailsId không hợp lệ',
          dateCreated: moment()
        });
      }
      io.to(socket.id).emit('seenMailSuccesFully', {
        mailsId: mailsId,
        roomMailsId: roomMailsIdOne || roomMailsId || 0,
        usersId: usersId,
        seenAll: seenAll
      });
    } catch (e) {
      console.log('e', e);
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  //   socket.emit("downloadMail",{"roomMailsId":1,"usersId":2,"mailsId":3})
  socket.on('downloadMail', async function(data) {
    const { mailsId, usersId } = data;

    try {
      //  người dùng gửi tin nhắn
      //  data :
      console.log('downloadMail', data);

      // console.log('roomMailsId', roomMailsId);
      if (mailsId && Number(mailsId) !== 0) {
        await Model.update(
          mailsUsers,
          {
            downloadFileStatus: 1,
            timeDownloadFile: new Date()
          },
          {
            where: {
              mailsId: mailsId,
              usersId: usersId
            }
          }
        );
      } else {
        io.to(socket.id).emit('errors', {
          messages: 'mailsId và roomMailsId không hợp lệ',
          dateCreated: moment()
        });
      }
    } catch (e) {
      io.to(socket.id).emit('errors', {
        type: 'orders',
        messages: 'Hệ thống lỗi, xin vui lòng thử lại sau!',
        dateCreated: moment(),
        e: e
      });
    }
  });
  socket.on('disconnect', async function() {
    try {
      console.log('data disconnect');

      _.remove(listUsersId[listSocketId[socket.id]], currentElement => {
        return currentElement === socket.id;
      });
      if (
        (listUsersId[listSocketId[socket.id]] && listUsersId[listSocketId[socket.id]].length < 1) ||
        (listSocketId[socket.id] && !listUsersId[listSocketId[socket.id]])
      ) {
        console.log(`socket id ${socket.id}  của usersId ${listSocketId[socket.id]} ngắt kết nối`);
        await Model.update(
          users,
          { onlineStatus: 0, lastTimeOnline: new Date() },
          {
            where: {
              id: listSocketId[socket.id]
            }
          }
        );

        // lấy danh sách những người cần biết người này offline
        const callListUsers = await sequelize.query('call sp_getAll_users_relatedWithUser(:in_usersId);', {
          replacements: {
            in_usersId: listSocketId[socket.id]
          },
          type: sequelize.QueryTypes.SELECT
        });

        const listUsers = Object.values(callListUsers[0]);

        if (listUsers) {
          // thông báo cho mọi người là người này đã ofline
          console.log('listUsers', JSON.stringify(listUsers));
          listUsers.forEach(elementUser => {
            if (listUsersId[elementUser.usersId] && listUsersId[elementUser.usersId].length > 0)
              socket.to(Number(elementUser.usersId)).emit('offlineNotify', {
                usersId: listSocketId[socket.id],
                onlineStatus: 0,
                roomChatsUsers: elementUser.roomChatsUsers,
                lastTimeOnline: elementUser.lastTimeOnline
              });
          });
        }

        delete listUsersId[listSocketId[socket.id]];
      }

      delete listSocketId[socket.id];
      socket.leave(socket.id);
      console.log('sau khi ngắt kết nối listUsersId', listUsersId);
      console.log('sau khi ngắt kết nối listSocketId', listSocketId);
      console.log('room trong socket rooms', io.sockets.adapter.rooms);
    } catch (e) {
      console.log(e);
    }
  });
});

server.listen(CONFIG['SOCKET_PORT'], CONFIG['SOCKET_HOST'], () => {
  console.log(`Server SOCKET started at http://${CONFIG['SOCKET_HOST']}:${CONFIG['SOCKET_PORT']}`);
});
// server.listen('5551',CONFIG['SOCKET_PORT'], () => {
//      console.log(`Server SOCKET started at http://${CONFIG['SOCKET_HOST']}:5551`);
//    });
export default io;
