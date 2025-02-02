import { Client } from "pg"
import * as dotenv from "dotenv"
import sql from "./db"

dotenv.config() // Load environment variables from .env file

// Initialize PostgreSQL client with connection details from the .env file
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

async function testConnection() {
  try {
    await client.connect() // Connect to the database
    console.log("Connection successful!")

    // Example query to check the database version
    const res = await client.query("SELECT version()")
    console.log("PostgreSQL version:", res.rows[0].version)

    await client.end() // Close the connection
  } catch (error) {
    console.error("Error connecting to the database:", error)
  }
}

// Run the test
testConnection()
