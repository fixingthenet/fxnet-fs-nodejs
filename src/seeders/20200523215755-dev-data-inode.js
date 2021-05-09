'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return queryInterface.bulkInsert('inodes',
                                       [{
                                           name: 'data',
                                           parent_id: 1, // hot to not hardcode this?
                                           is_folder: true,
                                           created_at: new Date(),
                                           updated_at: new Date(),
                                           modified_at: new Date(),
                                           backend_id: 2, //how to not hardcode this?
                                           readers: [1],
                                           writers: [1],
                                           admins: [1],
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
