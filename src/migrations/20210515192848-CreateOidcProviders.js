'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return  queryInterface.createTable(
            'oidc_providers',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.BIGINT
                },
                issuer: {
                    type: Sequelize.STRING(1024),
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING(250),
                    allowNull: false,
                },
                identifier: {
                    type: Sequelize.STRING(250),
                    allowNull: false,
                },
                secret: {
                    allowNull: false,
                    type: Sequelize.STRING(250)
                },
                
            })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('oidc_providers')
    }
};
