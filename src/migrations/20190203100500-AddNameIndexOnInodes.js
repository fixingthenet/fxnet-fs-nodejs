'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addIndex(
                 'inodes',
                 {
                     fields: ['parent_id','name'],
                     type: 'UNIQUE',
                     where: {
                         deleted_at: {[Sequelize.Op.ne]: null}
                     }
                 }
             )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropIndex('inodes',
                                        'inodes_parent_id_name')
    }
};
