import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  explorerName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.explorers.explorerName'],

  }),
  disastersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label:  viMessage['api.explorers.disastersId'],
  }),
  explorerImage: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.explorers.explorerImage'],
    allow:['',null]
  }),
  explorerSatelliteImages: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.explorers.explorerSatelliteImages'],
    allow:['',null]
  }),
  explorerFiles: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.explorers.explorerFiles'],
    allow:['',null]
  }),
  explorerVideos: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.explorers.explorerVideos'],
    allow:['',null]
  }),
  NWCornerLat: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.NWCornerLat'],
  }),
  NWCornerLong: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.NWCornerLong'],
  }),
  NECornerLat: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.NECornerLat'],
  }),
  NECornerLong: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.NECornerLong'],
  }),
  SECornerLat: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.SECornerLat'],
  }),
  SECornerLong: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.SECornerLong'],
  }),
  SWCornerLat: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.SWCornerLat'],
  }),
  SWCornerLong: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.explorers.SWCornerLong'],
  }),
  explorerDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.explorers.explorerDescriptions'],
    allow:['',null]
  }),
  explorerSources: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.explorers.explorerSources'],
    allow:['',null]
  }),
  // explorerGroupsId: ValidateJoi.createSchemaProp({
  //   number: noArguments,
  //   label: viMessage['api.explorers.explorerGroupsId'],
  // }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate,
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow:['',null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { explorerGroupsId,explorerName,disastersId,explorerImage,explorerSatelliteImages,explorerFiles,explorerVideos,NWCornerLat
        ,NWCornerLong,NECornerLat,NECornerLong,SECornerLat,SECornerLong,SWCornerLat,SWCornerLong,explorerDescriptions,explorerSources,dateUpdated, status } = req.body;
    const district = {  explorerGroupsId,explorerName,disastersId,explorerImage,explorerSatelliteImages,explorerFiles,explorerVideos,NWCornerLat
        ,NWCornerLong,NECornerLat,NECornerLong,SECornerLat,SECornerLong,SWCornerLat,SWCornerLong,explorerDescriptions,explorerSources,dateUpdated, status , userCreatorsId };

      const SCHEMA = ValidateJoi.assignSchema( {
          explorerGroupsId:ValidateJoi.createSchemaProp({
            number: noArguments,
            label: viMessage['api.explorers.explorerGroupsId'],
          }),
          ...DEFAULT_SCHEMA
        },
        {
          explorerName: {
            max: 500,
            required: noArguments
          },

          status: {
            required: true
          },
        }
        );
    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { explorerGroupsId,explorerName,disastersId,explorerImage,explorerSatelliteImages,explorerFiles,explorerVideos,NWCornerLat
        ,NWCornerLong,NECornerLat,NECornerLong,SECornerLat,SECornerLong,SWCornerLat,SWCornerLong,explorerDescriptions,explorerSources,dateUpdated, status } = req.body;
    const district = { explorerGroupsId,explorerName,disastersId,explorerImage,explorerSatelliteImages,explorerFiles,explorerVideos,NWCornerLat
        ,NWCornerLong,NECornerLat,NECornerLong,SECornerLat,SECornerLong,SWCornerLat,SWCornerLong,explorerDescriptions,explorerSources,dateUpdated, status};

    const SCHEMA = ValidateJoi.assignSchema( {
      explorerGroupsId:ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.explorers.explorerGroupsId'],
      }),
      ...DEFAULT_SCHEMA
    },
    {
      explorerName: {
        max: 500,
        // required: noArguments
      },

      status: {
        // required: true
      },
    }
    );

    ValidateJoi.validate(district, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {status,dateUpdated } = req.body;
    const userGroup = {status,dateUpdated, userCreatorsId };

    const SCHEMA =  ValidateJoi.assignSchema(DEFAULT_SCHEMA,{
      status: {
        required: noArguments
      },
      dateUpdated:
      {
        required: noArguments
      }
    });


    ValidateJoi.validate(userGroup, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id,explorerGroupsId,explorerName,disastersId,NWCornerLat,NWCornerLong,NECornerLat,NECornerLong,SECornerLat,SECornerLong,SWCornerLat,SWCornerLong,explorerSources, status, FromDate, ToDate } = JSON.parse(filter);
      const district = { id,explorerGroupsId, explorerName,disastersId,NWCornerLat,NWCornerLong,NECornerLat,NECornerLong,SECornerLat,SECornerLong,SWCornerLat,SWCornerLong,explorerSources, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.explorers.id'],
          regex: regexPattern.listIds
        }),
        explorerGroupsId:ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.explorers.explorerGroupsId'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        disastersId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.explorers.disastersId'],
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (disastersId) {
            ValidateJoi.transStringToArray(data, 'disastersId');
          }
          if (explorerGroupsId) {
            ValidateJoi.transStringToArray(data, 'explorerGroupsId');
          }

          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
    } else {
      res.locals.filter = {};
      next()
    }
  },
  authenfindPointsInMultiPolygons: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,listDisasterGroupId,arrayPolygon,keyword, FromDate, ToDate } = req.body;

      const district = { page ,perPage,listDisasterGroupId,arrayPolygon,keyword, FromDate, ToDate };

      console.log("authenfindPointsInMultiPolygons",district )
      const SCHEMA = {
        keyword: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
          allow:['',null]
        }),
        listDisasterGroupId: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
          allow:['',null]
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
        arrayPolygon: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        page: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        perPage: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          res.locals.body = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
  },
  authenfindPointsInMultiPolygons_ver2: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,listDisasterGroupId,arrayPolygon,keyword, FromDate, ToDate } = req.body;

      const district = { page ,perPage,listDisasterGroupId,arrayPolygon,keyword, FromDate, ToDate };

      console.log("authenfindPointsInMultiPolygons",district )
      const SCHEMA = {
        keyword: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
          allow:['',null]
        }),
        listDisasterGroupId: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
          allow:['',null]
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
        arrayPolygon: ValidateJoi.createSchemaProp({
          object: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        page: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        perPage: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          res.locals.body = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
  },
  authenfindfindPointsInCircle: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,listDisasterGroupId,radius,centerLatitude,centerLongitude,keyword, FromDate, ToDate } = req.body;

      const district = { page ,perPage,listDisasterGroupId,radius,centerLatitude,centerLongitude,keyword, FromDate, ToDate };

      console.log("authenfindPointsInMultiPolygons",district )
      const SCHEMA = {
        keyword: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
          allow:['',null]
        }),
        listDisasterGroupId: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
          allow:['',null]
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
        radius: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        centerLatitude: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        centerLongitude: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        page: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        perPage: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          res.locals.body = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
  },
  dashboard_All_Provinces: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,type, FromDate, ToDate } = req.body;

      const district = { page ,perPage,type, FromDate, ToDate };

      console.log("authenfindPointsInMultiPolygons",district )
      const SCHEMA = {
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
        page: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        perPage: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        type: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          res.locals.body = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
  },
}
