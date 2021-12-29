'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const AppConfiguration = sequelize.define('AppConfiguration', {
        configuration: {
            type: DataTypes.JSONB
        },
        secrets: {
            type: DataTypes.JSONB
        },
        created_at: {
            type: DataTypes.DATE
        },
    }, {
//        paranoid: true,
        timestamp: true,
        underscored: true,
        tableName: 'app_configurations',
//        deletedAt: 'deleted_at'
    }

                                  );
    return AppConfiguration;
};
