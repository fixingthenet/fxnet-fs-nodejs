'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
    queryInterface.addColumn('inodes', 'content_type_major', Sequelize.STRING),
    queryInterface.addColumn('inodes', 'content_type_minor', Sequelize.STRING),
    queryInterface.addColumn('inodes', 'content_type_charset', Sequelize.STRING),
    queryInterface.addColumn('inodes', 'content_size', Sequelize.BIGINT),
    queryInterface.addColumn('inodes', 'storage_key', Sequelize.STRING),
    queryInterface.addColumn('inodes', 'sha512', Sequelize.STRING),
    queryInterface.addColumn('inodes', 'in_progress_at', Sequelize.DATE)
    ])
  },

  down: (queryInterface, Sequelize) => {
  }
};
