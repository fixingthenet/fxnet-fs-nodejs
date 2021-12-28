'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return  queryInterface.createTable(
            'clients',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.BIGINT
                },
                user_id: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                },
                identifier: {
                    type: Sequelize.STRING(250),
                },
                secret: {
                    type: Sequelize.STRING(250),
                },
                name: {
                    type: Sequelize.STRING(250),
                },
                description: {
                    type: Sequelize.TEXT,
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('clients')
    }
};
