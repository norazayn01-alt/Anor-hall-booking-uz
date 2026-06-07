import pool from '../lib/pg';

async function getSchema() {
  const query = `
    SELECT table_name, column_name, data_type, character_maximum_length, column_default, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
  `;
  try {
    const res = await pool.query(query);
    const tables: Record<string, any[]> = {};
    for (const row of res.rows) {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push(row);
    }
    console.log(JSON.stringify(tables, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

getSchema();
