// CREATE TABLE `affiliateWebsites` (
//     `id` bigint(20) NOT NULL AUTO_INCREMENT,
//     `affiliateWebsitesName` varchar(500) not NULL,
//     `image` json,
//     `link` varchar(500) not NULL,
//     `userCreatorsId` bigint(20) DEFAULT NULL,
//     `dateCreated` datetime DEFAULT current_timestamp(),
//     `dateUpdated` datetime DEFAULT current_timestamp(),
//     `status` int(11) DEFAULT 1 COMMENT '1: enabled\\\\n0: disabled\\\\n-1: draf',
//     PRIMARY KEY (`id`),
//     UNIQUE KEY `id_UNIQUE` (`id`)
//   ) 

module.exports = (sequelize,DataTypes)=>{
    return sequelize.define('affiliateWebsites',{
        id: {
			type: DataTypes.BIGINT(20),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
        affiliateWebsitesName: {
			type: DataTypes.STRING(500),
			allowNull: false,
			field: 'affiliateWebsitesName'
		},
        image: {
			type: DataTypes.JSON,
            allowNull: true,
			field: 'image'
		},
        link: {
			type: DataTypes.STRING(500),
			allowNull: false,
			field: 'link'
		},
        userCreatorsId: {
			type: DataTypes.BIGINT(20),
            allowNull: true,
			field: 'userCreatorsId',
            defaultValue : null
		},
        dateCreated: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'dateCreated'
          },
          dateUpdated: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'dateUpdated'
          },
          status: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: 1,
            field: 'status'
          }
    },
    {
        tableName: 'affiliateWebsites',
        timestamps: false
    }
    )
}