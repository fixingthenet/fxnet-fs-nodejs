'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return  queryInterface.createTable(
            'inodes',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.BIGINT
                },
                parent_id: {
                    type: Sequelize.BIGINT,
                    allowNull: true

                },
                name: {
                    type: Sequelize.STRING(1024),
                    allowNull: false,
                },
                is_folder: { //
                    type: Sequelize.BOOLEAN
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                deleted_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                modified_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            })// ,
        //     await queryInterface.addIndex(
        //         'inodes',
        //         {
        //             fields: ['parent_id','name'],
        //             type: 'UNIQUE',
        //             where: {
        //                 deleted_at: {[Sequelize.Op.ne]: null}
        //             }
        //         }
        //     )
        //         ]
        // })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('inodes')
    }
};
