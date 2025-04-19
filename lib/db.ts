import Postgres from 'postgres';

const sql = Postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
});

export default sql;