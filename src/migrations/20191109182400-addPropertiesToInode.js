module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn(
          'inodes', // name of Source model
          'props', // name of the key we're adding
          {
              type: Sequelize.JSONB,
              allowNull: false,
              defaultValue: {}
          } );
      return queryInterface.addIndex(
          'inodes',
          {
            fields: ['props'],
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
      'props' // key we want to remove
    );
  }
};
