'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addConstraint('inodes', ['parent_id'], {
            type: 'foreign key',
            name: 'inodes_fkey_parent_id',
            references: { //Required field
                table: 'inodes',
                field: 'id'
            }
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('inodes','inodes_fkey_parent_id')
    }
};
