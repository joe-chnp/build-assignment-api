// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:chnpostgres@localhost:5432/build-creating-data-api-assignment",
});

export default connectionPool;
