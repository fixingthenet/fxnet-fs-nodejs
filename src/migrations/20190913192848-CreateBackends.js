'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return  queryInterface.createTable(
            'backends',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.BIGINT
                },
                name: {
                    type: Sequelize.STRING(1024),
                    allowNull: false,
                },
                params: {
                    type: Sequelize.JSONB,
                    default: '{}'
                },
                backend_type: {
                    type: Sequelize.STRING(),
                    allowNull: false,
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('backends')
    }
};
