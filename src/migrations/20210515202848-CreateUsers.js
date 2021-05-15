'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return  queryInterface.createTable(
            'users',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.BIGINT
                },
                oidc_provider_id: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                },
                sub: {
                    type: Sequelize.STRING(250),
                    allowNull: false
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('users')
    }
};
