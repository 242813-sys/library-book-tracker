const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    database: 'postgres'
  });

  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'food_ordering_db'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE food_ordering_db');
      console.log('Database food_ordering_db created successfully.');
    } else {
      console.log('Database food_ordering_db already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }
}

main();
