/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  newsTitle: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.news.newsTitle'],
    allow: ['', null]
  }),
  newsShortDescription: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.news.newsShortDescription'],
    allow: ['', null]
  }),
  newsDescription: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.news.newsDescription'],
    allow: ['', null]
  }),
  newsAuthor: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.news.newsAuthor'],
    allow: ['', null]
  }),
  newsSource: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.news.newsSource'],
    allow: ['', null]
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
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id']
  }),
  newGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.newGroups.id']
  }),
  userApprovedId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id'],
    allow: ['', null]
  }),
  newspapersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.newspapers.id'],
    allow: ['', null]
  }),
  image: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.news.image'],
    allow: [[], null]
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.UrlSlugs
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.news.type']
  }),
  typeOfNewsListId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: 'Mảng Id loại báo',
    allow: [[], null]
  }),
  manualUpdate: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.news.manualUpdate']
  }),
  invalid: ValidateJoi.createSchemaProp({
    boolean: noArguments,
    label: 'nếu true thì nghĩa là bài báo này không hợp lệ khi quét báo => đánh dấu lại để tăng độ thông minh của AI'
  })
};

const DEFAULT_SCHEMA_disastersNews = ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage.id
    }),
    disastersId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.disasters.id']
    }),
    newsId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.news.id']
    }),
    flag: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: 'cờ phân biệt Thêm-sửa/Xoá'
    })
  })
);

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;
    const {
      newsTitle,
      newsShortDescription,
      image,
      disastersNews,
      url,
      newsDescription,
      newsAuthor,
      newsSource,
      dateCreated,
      dateUpdated,
      newspapersId,
      status,
      type,
      typeOfNewsListId,
      newGroupsId
    } = req.body;
    const news = {
      newsTitle,
      newsShortDescription,
      url,
      disastersNews,
      image,
      newsDescription,
      newsAuthor,
      newsSource,
      dateCreated,
      dateUpdated,
      userCreatorsId,
      newspapersId,
      status,
      type,
      typeOfNewsListId,
      newGroupsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        newsTitle: {
          max: 500,
          required: noArguments
        },
        newGroupsId: {
          required: noArguments
        },
        newsDescription: {
          required: noArguments
        },
        newsShortDescription: {
          max: 500
          // required: noArguments
        }
      }),
      {
        disastersNews: DEFAULT_SCHEMA_disastersNews
      }
    );

    // console.log('input: ', input);
    ValidateJoi.validate(news, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      newsTitle,
      newsShortDescription,
      image,
      disastersNews,
      url,
      newsDescription,
      newsAuthor,
      newsSource,
      dateCreated,
      dateUpdated,
      newspapersId,
      manualUpdate,
      typeOfNewsListId,
      status,
      type,
      newGroupsId
    } = req.body;
    const news = {
      newsTitle,
      newsShortDescription,
      image,
      url,
      newsDescription,
      newsAuthor,
      newsSource,
      manualUpdate,
      dateCreated,
      dateUpdated,
      newspapersId,
      disastersNews,
      typeOfNewsListId,
      status,
      type,
      newGroupsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        newsTitle: {
          max: 300
          // required: noArguments
        },
        newsShortDescription: {
          max: 300
          // required: noArguments
        }
      }),
      {
        disastersNews: DEFAULT_SCHEMA_disastersNews
      }
    );

    ValidateJoi.validate(news, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status } = req.body;

    const userGroup = { status };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
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
      } else res.locals.sort = parseSortVer2(sort, 'news');
    } else res.locals.sort = parseSortVer2(sort, 'news');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        newGroupsId,
        newsTitle,
        newsShortDescription,
        newsAuthor,
        url,
        manualUpdate,
        status,
        newspapersId,
        userCreatorsId,
        userApprovedId,
        typeOfNewsId,
        FromDate,
        ToDate,
        FromDateApproved,
        ToDateApproved,
        disasterVndmsId,
        type,
        isReports
      } = JSON.parse(filter);

      const news = {
        id,
        newsTitle,
        newGroupsId,
        newsShortDescription,
        newsAuthor,
        url,
        manualUpdate,
        typeOfNewsId,
        status,
        newspapersId,
        userCreatorsId,
        userApprovedId,
        FromDate,
        ToDate,
        FromDateApproved,
        ToDateApproved,
        disasterVndmsId,
        type,
        isReports
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.news.id'],
          regex: regexPattern.listIds
        }),
        isReports: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'Đã lập điểm tin'
        }),
        ...DEFAULT_SCHEMA,
        manualUpdate: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.news.manualUpdate']
        }),
        disasterVndmsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasters.disasterVndmsId'],
          regex: regexPattern.listIds
        }),
        typeOfNewsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.typeOfNews.id'],
          regex: regexPattern.listIds
        }),
        newsTitle: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.news.newsTitle'],
          regex: regexPattern.name
        }),
        disastersId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasters.id'],
          regex: regexPattern.listIds
        }),
        newsShortDescription: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.news.newsShortDescription'],
          regex: regexPattern.name
        }),
        newsAuthor: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.news.newsAuthor'],
          regex: regexPattern.name
        }),
        url: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.news.urlSlugs'],
          regex: regexPattern.name
        }),
        newspapersId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.newspapers.id'],
          regex: regexPattern.listIds
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id'],
          regex: regexPattern.listIds
        }),
        userApprovedId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id'],
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        }),

        FromDateApproved: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDateApproved: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(news, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          if (newspapersId) {
            ValidateJoi.transStringToArray(data, 'newspapersId');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
          }
          if (userApprovedId) {
            ValidateJoi.transStringToArray(data, 'userApprovedId');
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
