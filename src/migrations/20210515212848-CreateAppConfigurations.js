'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return  queryInterface.createTable(
            'app_configurations',
            {
                id: {
                    allowNull: false,
                    default: Sequelize.UUIDV4,
                    primaryKey: true,
                    type: Sequelize.UUID
                },
                name: {
                    type: Sequelize.STRING(250),
                    allowNull: false,
                },
                configuration: {
                    type: Sequelize.JSONB,
                    default: '{}',
                    allowNull: false
                },
                secrets: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    default: '{}'
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('app_configurations')
    }
};
