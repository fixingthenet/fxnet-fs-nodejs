'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        user_id: {
            type: DataTypes.BIGINT
        },
        identifier: {
            type: DataTypes.STRING
        },
        secret: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
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
        tableName: 'clients',
//        deletedAt: 'deleted_at'
    }

    );
    Client.associate = function(models) {
        console.log("Assoc: Client -> User", models.User.name)
        Client.User=Client.belongsTo(models.User, {foreignKey: 'user_id',
                                                       as: 'user'});
    };

    return Client;
};
