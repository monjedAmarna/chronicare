module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');
    if (!table.doctorId) {
      await queryInterface.addColumn('users', 'doctorId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        // references: { model: 'users', key: 'id' }, // Uncomment if you want a FK constraint
      });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');
    if (table.doctorId) {
      await queryInterface.removeColumn('users', 'doctorId');
    }
  }
}; 