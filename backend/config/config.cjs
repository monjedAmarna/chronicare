module.exports = {
    development: {
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || null,
      database: process.env.DB_NAME || 'chronicare',
      host: process.env.DB_HOST || 'db',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
    },
    test: {
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || null,
      database: process.env.DB_NAME || 'chronicare_test',
      host: process.env.DB_HOST || 'db',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
    },
    production: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
    },
  };
  