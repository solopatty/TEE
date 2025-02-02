import pool from './db';

async function testConnection() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT version()');
      console.log('Connection successful!');
      console.log('PostgreSQL version:', res.rows[0].version);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 