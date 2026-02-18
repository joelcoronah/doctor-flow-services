#!/usr/bin/env node
/**
 * Creates the application database if it does not exist.
 * Connects to the default 'postgres' database to run CREATE DATABASE.
 * Uses env: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE.
 */

const { Client } = require('pg');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres',
};

async function createDatabaseIfNotExists() {
  const client = new Client(config);
  const dbName = process.env.DB_DATABASE || 'docflow_schedule';

  try {
    await client.connect();
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } finally {
    await client.end();
  }
}

createDatabaseIfNotExists().catch((err) => {
  console.error('Create database failed:', err.message);
  process.exit(1);
});
