import type { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const config: { [key: string]: Knex.Config } = {  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'aws-0-eu-north-1.pooler.supabase.com',
      user: process.env.DB_USER || 'postgres.nezwavnslymfssrlsxbj',
      password: process.env.DB_PASSWORD || 'mkounga10',
      database: process.env.DB_NAME || 'postgres',
      port: +(process.env.DB_PORT || 5432),
      ssl: {
        rejectUnauthorized: false,
        ca: undefined
      }
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  },production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: +(process.env.DB_PORT || 5432),
      ssl: {
        rejectUnauthorized: false,
        ca: undefined
      }
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};

module.exports = config;
