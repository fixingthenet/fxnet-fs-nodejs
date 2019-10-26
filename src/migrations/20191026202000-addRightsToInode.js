module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn(
          'inodes', // name of Source model
          'readers', // name of the key we're adding
          {
              type: Sequelize.ARRAY(Sequelize.STRING)
          }
      );
      await queryInterface.addColumn(
          'inodes', // name of Source model
          'writers', // name of the key we're adding
          {
              type: Sequelize.ARRAY(Sequelize.STRING)
          }
      );
      await queryInterface.addColumn(
          'inodes', // name of Source model
          'admins', // name of the key we're adding
          {
              type: Sequelize.ARRAY(Sequelize.STRING)
          }
      );
      return queryInterface.addIndex(
          'inodes',
          {
              fields: ['readers'],
              type: 'GIN',
              where: {
                  deleted_at:  null
              }
          }
      )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'inodes', // name of Source model
      'readers' // key we want to remove
    );
  }
};
