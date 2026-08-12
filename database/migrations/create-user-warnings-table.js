require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../../config/db');

async function migrate() {
  const sql = fs.readFileSync(
    path.join(__dirname, 'create-user-warnings-table.sql'),
    'utf8'
  );

  await pool.query(sql);
  console.log('user_warnings table is ready.');
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
