'use strict';
module.exports = (sequelize, DataTypes) => {
    const Backend = sequelize.define('Backend',
                                     {
                                         name: {
                                             type: DataTypes.STRING
                                         },
                                         params: {
                                             type: DataTypes.JSONB
                                         },
                                         backend_type: {
                                             type: DataTypes.STRING
                                         },
                                         created_at: {
                                             type: DataTypes.DATE
                                         },

                                     },
                                     {
                                         underscored: true,
                                         tableName: 'backends',
                                         timestamps: false,
                                     }


                                    )
    return Backend;
}
