import postgres from "postgres"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("database url not found")
}
const sql = postgres(connectionString)

export default sql
