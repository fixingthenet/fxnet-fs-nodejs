'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     var provider = await queryInterface.bulkInsert('oidc_providers',
                                       [{  issuer: 'https://none',
                                           name: 'none',
                                           identifier: 'none',
                                           secret: 'none',
                                       }], {identifier: 1});
                                         
     await queryInterface.bulkInsert('users',
                                       [{
                                           sub: '0',
                                           oidc_provider_id: 1,
                                           identifier: 'guest',
                                           created_at: new Date(),
                                           updated_at: new Date(),
                                       }], {identifier: 1});
     return queryInterface.bulkInsert('users',
                                       [{
                                           sub: '1',
                                           oidc_provider_id: 1,
                                           identifier: 'admin',
                                           created_at: new Date(),
                                           updated_at: new Date(),
                                       }], {identifier: 1});

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
