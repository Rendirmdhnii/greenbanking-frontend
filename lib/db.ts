import mysql from 'mysql2/promise';

const globalForDb = global as unknown as {
  dbPool: mysql.Pool | undefined;
};

export const dbPool =
  globalForDb.dbPool ||
  mysql.createPool({
    host: process.env.DB_HOST || 'yamabiko.proxy.rlwy.net',
    port: Number(process.env.DB_PORT) || 42807,
    database: process.env.DB_DATABASE || 'railway',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'IyYPqqlRxmSkAQftWKKARKgRqgKBQWjE',
    connectionLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.dbPool = dbPool;
