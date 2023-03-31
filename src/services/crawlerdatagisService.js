import MODELS from '../models/models'
// import provinceModel from '../models/provinces'
import models from '../entity/index'
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import _ from 'lodash';
import provincesService from './provincesService';
import districtsService from './districtsService';
import riverBasinsService from './riverBasinsService';
import wardsService from './wardsService';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import fs from 'fs';

import axios from 'axios';

const { /* sequelize, */users,riverBasins,provinces,districts,wards } = models;

export default {
  
  crawlerProvinces: async param => {
    let finnalyResult;
    console.log("sfsdfsfds=====")
    try {
      const entity = param.entity;
/*
      await axios({
        method:"GET",
        url: 'https://data.opendevelopmentmekong.net/dataset/999c96d8-fae0-4b82-9a2b-e481f6f50e12/resource/234169fb-ae73-4f23-bbd4-ff20a4fca401/download/diaphantinh.geojson',
      }).then(async function (response) {
           // console.log("response",response);
            
            _.forEach(response.data.features, function(dataTinh) { 
               // console.log("object", dataTinh.properties)
               let entityProvinces ={
                    entity:
                    {
                        provinceName: dataTinh.properties.ten_tinh,
                        userCreatorsId:1,
                        status:1,
                        points: JSON.stringify( dataTinh.geometry)
                    }
                }
                // console.log("entityProvinces",entityProvinces)
                provincesService.create(entityProvinces);
            })
            
         
        }
       );
      */

      let rawdata = fs.readFileSync('D:\\DICHVU\\VNDMS\\tinh.geojsonl.json','utf8').toString().split('\n');
  
       _.forEach(rawdata, function(data) { 
         if(data !=='')
         {
            let dataTinh =JSON.parse(data)
            let entityProvinces ={
                entity:
                {
                    provinceName: dataTinh.properties.NAME_1,
                    userCreatorsId:1,
                    status:1,
                    points: JSON.stringify( dataTinh.geometry)
                }
            }
            provincesService.create(entityProvinces);
          }
       })

      // console.log(student);

      finnalyResult={success:true};
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  
  crawlerDistricts: async param => {
    let finnalyResult;
    console.log("sfsdfsfds=====")
    try {
      const entity = param.entity;

      /* await axios({
        method:"GET",
        url: 'https://data.opendevelopmentmekong.net/dataset/6f054351-bf2c-422e-8deb-0a511d63a315/resource/78b3fb31-8c96-47d3-af64-d1a6e168e2ea/download/diaphanhuyen.geojson',
      }).then(function (response) {
           // console.log("response",response);
            
            _.forEach(response.data.features, async function( dataTinh) { 
               // console.log("object", dataTinh.properties)
              if(dataTinh.properties.Ten_Tinh==='Bà Rịa - Vũng Tàu'
                || dataTinh.properties.Ten_Tinh==='Cần Thơ'
                || dataTinh.properties.Ten_Tinh==='Đắk Lắk'
                || dataTinh.properties.Ten_Tinh==='Đắk Nông'
                || dataTinh.properties.Ten_Tinh==='Quảng Bình'
                || dataTinh.properties.Ten_Tinh==='Kiên Giang'
              )
              {
                console.log(dataTinh.properties.Ten_Tinh)
                let whereFilter={provinceName:dataTinh.properties.Ten_Tinh}

               whereFilter = await filterHelpers.makeStringFilterAbsolutely(['provinceName'], whereFilter, 'provinces');
              
               await MODELS.findOne(provinces,{where:whereFilter}).then(async resultProvinces => {
                    let whereFilterDistrict=
                    {
                      districtName:dataTinh.properties.Ten_Huyen,
                      provincesId: resultProvinces.id
                    }

                    whereFilterDistrict = await filterHelpers.makeStringFilterAbsolutely(['districtName'], whereFilterDistrict, 'districts');
                    await MODELS.findOne(districts,{where:whereFilterDistrict,logging:console.log}).then(async resultDistrict => {
                        // console.log("resultDistrict===",resultDistrict )
                        const entityDistricts ={
                          entity:
                          {
                              districtName: dataTinh.properties.Ten_Huyen,
                              userCreatorsId:1,
                              provincesId: resultProvinces.id,
                              status:1,
                              points: JSON.stringify( dataTinh.geometry)
                          }
                        }
      
                        await districtsService.create(entityDistricts);
                     
                    })
                    
                 }) 
              }
               
              })
        }
       );*/
       let rawdata = fs.readFileSync('D:\\DICHVU\\VNDMS\\huyen.geojsonl.json','utf8').toString().split('\n');
  
       _.forEach(rawdata, async function(data) { 
         if(data !=='')
         {
            let dataHuyen =JSON.parse(data)
              let whereFilter={provinceName:dataHuyen.properties.NAME_1}

               whereFilter = await filterHelpers.makeStringFilterAbsolutely(['provinceName'], whereFilter, 'provinces');
              
               await MODELS.findOne(provinces,{where:whereFilter}).then(async resultProvinces => {
                    // let whereFilterDistrict=
                    // {
                    //   districtName:dataHuyen.properties.NAME_2,
                    //   provincesId: resultProvinces.id
                    // }

                    // whereFilterDistrict = await filterHelpers.makeStringFilterAbsolutely(['districtName'], whereFilterDistrict, 'districts');
                    // await MODELS.findOne(districts,{where:whereFilterDistrict,logging:console.log}).then(async resultDistrict => {
                        // console.log("resultDistrict===",resultDistrict )
                        // if(!resultDistrict)
                        // {
                          const entityDistricts ={
                            entity:
                            {
                                districtName: dataHuyen.properties.NAME_2,
                                userCreatorsId:1,
                                provincesId: resultProvinces.id,
                                status:1,
                                points: JSON.stringify( dataHuyen.geometry)
                            }
                          }
        
                          await districtsService.create(entityDistricts);
                        // }
                  
                     
                    // });
                  });
          }
       })

       finnalyResult={success:true};
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  crawlerWards: async param => {
    let finnalyResult;

    console.log("sfsdfsfds=====")
    try {
      const entity = param.entity;
      /*    let dataA=[
           
          ]
          
          ;

          _.forEach(dataA, async function( dataWards) { 
            // console.log("object", dataTinh.properties)

              if(dataWards)
              {
                // 

                const entityWards ={
                    
                        wardName: 'cần cập nhật tên xã',
                        userCreatorsId:1,
                        districtsId: 43,
                        status:1,
                        points: dataWards
                }
                console.log("dataTinh.properties.Ten_Tinh===",entityWards )
                MODELS.create(wards,entityWards);
              }
        })
*/
        let rawdata = fs.readFileSync('D:\\DICHVU\\VNDMS\\xa.geojsonl.json','utf8').toString().split('\n');
          
        _.forEach(rawdata, async function(data) { 
          if(data !=='')
          {
            let dataXa =JSON.parse(data)

             

              let whereFilterTinh={provinceName:dataXa.properties.NAME_1}

              whereFilterTinh = await filterHelpers.makeStringFilterAbsolutely(['provinceName'], whereFilterTinh, 'provinces');
             
              await MODELS.findOne(provinces,{where:whereFilterTinh}).then(async resultProvinces => {

                if(resultProvinces)
                {
                  let whereFilterHuyen={districtName:dataXa.properties.NAME_2,provincesId: resultProvinces.id}
                // console.log("whereFilterHuyen===",whereFilterHuyen)
                  whereFilterHuyen = await filterHelpers.makeStringFilterAbsolutely(['districtName'], whereFilterHuyen, 'districts');

                    await MODELS.findOne(districts,{where:whereFilterHuyen}).then(async resultHuyen => {

                        if(resultHuyen)
                        {
                          const entityWards ={
                                    
                                  wardName: dataXa.properties.NAME_3,
                                  userCreatorsId:1,
                                  districtsId: resultHuyen.id,
                                  status:1,
                                  points: dataXa.geometry
                          }
                          // console.log("resultHuyen==",resultHuyen)

                          await MODELS.create(wards,entityWards);
                        }
                        else
                        {
                          console.log("NOT resultHuyen==",dataXa.properties.NAME_3)
                        }
                    });
                  }
                  else
                  {
                    console.log("NOT resultProvinces==",dataXa.properties.NAME_1)
                  }
                });
          }
        })
        finnalyResult={success:true};

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  crawlerRiverBasins: async param => {
    let finnalyResult;
    console.log("sfsdfsfds=====")
    try {
      const entity = param.entity;
      let rawdata = fs.readFileSync('D:\\DICHVU\\VNDMS\\luvucsong.geojsonl.json','utf8').toString().split('\n');
  
       _.forEach(rawdata, function(data) { 
         if(data !=='')
         {
            let dataTinh =JSON.parse(data)
            let entityProvinces ={
                entity:
                {
                    riverBasinName: dataTinh.properties.TEXTSTRING,
                    userCreatorsId:1,
                    status:1,
                    points: JSON.stringify( dataTinh.geometry)
                }
            }
            riverBasinsService.create(entityProvinces);
          }
       })

      // console.log(student);

      finnalyResult={success:true};
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
}
