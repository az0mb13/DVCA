module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: 'secret',
  dbPath: process.env.DB_PATH || './server/db/dvca.db',
  sessionSecret: 'dvca-session-secret-123',
  desKey: 'dvca2024',
  apiKey: 'sk-dvca-api-key-12345',
  adminEmail: 'admin@dvca.com',
  adminPassword: 'admin123',
  dbCredentials: {
    host: 'localhost',
    user: 'dvca_admin',
    password: 'P@ssw0rd123!',
    database: 'dvca'
  },
  difficulty: 'easy'
};
