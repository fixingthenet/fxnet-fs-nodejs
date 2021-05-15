'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addConstraint('users', ['oidc_provider_id'], {
            type: 'foreign key',
            name: 'users_fkey_oidc_provider_id',
            references: { //Required field
                table: 'oidc_providers',
                field: 'id'
            }
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('users','users_fkey_oidc_provider_id')
    }
};
