import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  postsId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botPosts.postsId'],
    allow: ['', null]
  }),
  postContent: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botPosts.postContent'],
    allow: ['', null]
  }),
  poster: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botPosts.poster'],
    allow: ['', null]
  }),
  placeofPost: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botPosts.placeofPost'],
    allow: ['', null]
  }),
  botTypeOfPostListId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: 'Mảng Id loại bài viết',
    allow: [[], null]
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow: ['', null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
    allow: ['', null]
  }),
  image: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botPosts.image'],
    allow: ['', null]
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const {
      postsId,
      postContent,
      image,
      poster,
      placeofPost,
      dateCreated,
      dateUpdated,
      status,
      botTypeOfPostListId
    } = req.body;
    const botPosts = {
      postsId,
      postContent,
      image,
      poster,
      placeofPost,
      dateCreated,
      dateUpdated,
      status,
      botTypeOfPostListId
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {});

    // console.log('input: ', input);
    ValidateJoi.validate(botPosts, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      postsId,
      postContent,
      image,
      poster,
      placeofPost,
      dateCreated,
      dateUpdated,
      status,
      botTypeOfPostListId
    } = req.body;
    const botPosts = {
      postsId,
      postContent,
      image,
      poster,
      placeofPost,
      dateCreated,
      dateUpdated,
      status,
      botTypeOfPostListId
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {});

    ValidateJoi.validate(botPosts, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      },
      dateUpdated: {
        required: noArguments
      }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    const { filter, sort, range, attributes } = req.query;

    if (sort && JSON.parse(sort.toString())) {
      if (JSON.parse(sort)[0].includes('.')) {
        res.locals.sort = [[...JSON.parse(sort)[0].split('.'), JSON.parse(sort)[1]]];
      } else res.locals.sort = parseSortVer2(sort, 'botPosts');
    } else res.locals.sort = parseSortVer2(sort, 'botPosts');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, postsId, typeOfPostsId, postContent, poster, placeofPost, status, FromDate, ToDate } = JSON.parse(
        filter
      );

      const botPosts = {
        id,
        postsId,
        postContent,
        poster,
        placeofPost,
        status,
        FromDate,
        ToDate,
        typeOfPostsId
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.botPosts.id'],
          regex: regexPattern.listIds
        }),

        ...DEFAULT_SCHEMA,

        typeOfPostsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.botTypeOfPosts.id'],
          regex: regexPattern.listIds
        }),

        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(botPosts, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (typeOfPostsId) {
            ValidateJoi.transStringToArray(data, 'typeOfPostsId');
          }
          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  }
};
