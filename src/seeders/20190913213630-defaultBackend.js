'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('backends',
                                       [{
                                           name: 'defaultRootBackend',
                                           params: '{}',
                                           backend_type: 'JustMeta',
                                           created_at: new Date(),
                                       }], {});

  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
