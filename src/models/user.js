'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        oidc_provider_id: {
            type: DataTypes.BIGINT
        },
        sub: {
            type: DataTypes.STRING
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        },
    }, {
//        paranoid: true,
        timestamps: true,
        underscored: true,
        tableName: 'users',
//        deletedAt: 'deleted_at'
    }

    );
    User.associate = function(models) {
        console.log("Assoc: User -> OidcProvider", models.OidcProvider.name)
        User.OidcProvider=User.belongsTo(models.OidcProvider, {foreignKey: 'oidc_provider_id',
                                                       as: 'oidc_provider'});
    };

    return User;
};
