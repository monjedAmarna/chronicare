module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');

    if (!table.firstName) {
      await queryInterface.addColumn('users', 'firstName', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.lastName) {
      await queryInterface.addColumn('users', 'lastName', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.phone) {
      await queryInterface.addColumn('users', 'phone', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.gender) {
      await queryInterface.addColumn('users', 'gender', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.dateOfBirth) {
      await queryInterface.addColumn('users', 'dateOfBirth', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
    if (!table.address) {
      await queryInterface.addColumn('users', 'address', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');

    if (table.firstName) {
      await queryInterface.removeColumn('users', 'firstName');
    }
    if (table.lastName) {
      await queryInterface.removeColumn('users', 'lastName');
    }
    if (table.phone) {
      await queryInterface.removeColumn('users', 'phone');
    }
    if (table.gender) {
      await queryInterface.removeColumn('users', 'gender');
    }
    if (table.dateOfBirth) {
      await queryInterface.removeColumn('users', 'dateOfBirth');
    }
    if (table.address) {
      await queryInterface.removeColumn('users', 'address');
    }
  }
}; 