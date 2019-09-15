module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'inodes', // name of Source model
      'backend_id', // name of the key we're adding
      {
          type: Sequelize.BIGINT,
          references: {
              model: 'backends', // name of Target model
              key: 'id', // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'inodes', // name of Source model
      'backend_id' // key we want to remove
    );
  }
};
