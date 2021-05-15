'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const OidcProvider = sequelize.define('OidcProvider', {
        issuer: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        identifier: {
            type: DataTypes.STRING
        },
        secret: {
            type: DataTypes.STRING
        },
    }, {
//        paranoid: true,
        timestamps: false,
        underscored: true,
        tableName: 'oidc_providers',
    }

                                  );
    return OidcProvider;
};
