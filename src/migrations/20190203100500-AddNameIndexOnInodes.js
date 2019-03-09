'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addIndex(
                 'inodes',
                 {
                     fields: ['parent_id','name'],
                     type: 'UNIQUE',
                     where: {
                         deleted_at:  null
                     }
                 }
             )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeIndex('inodes',
                                        'inodes_parent_id_name')
    }
};
