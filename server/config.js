// VULN: V6.4 - Hardcoded credentials and secrets in source code
module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: 'secret', // VULN: V6.4 - Weak, hardcoded JWT secret
  dbPath: process.env.DB_PATH || './server/db/vulnlab.db',
  sessionSecret: 'vulnlab-session-secret-123',
  desKey: 'vulnc0rp', // VULN: V6.2 - Hardcoded DES key
  apiKey: 'sk-vulnlab-api-key-12345',
  adminEmail: 'admin@vulncorp.com',
  adminPassword: 'admin123',
  dbCredentials: {
    host: 'localhost',
    user: 'vulnlab_admin',
    password: 'P@ssw0rd123!',
    database: 'vulnlab'
  },
  difficulty: 'easy' // easy, medium, hard
};
