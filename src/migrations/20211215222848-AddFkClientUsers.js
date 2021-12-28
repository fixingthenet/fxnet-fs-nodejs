'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addConstraint('clients', ['user_id'], {
            type: 'foreign key',
            name: 'clients_user_id',
            references: { //Required field
                table: 'users',
                field: 'id'
            }
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('clients','clients_user_id')
    }
};
