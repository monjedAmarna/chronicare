module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('system_settings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('system_settings');
  }
}; 