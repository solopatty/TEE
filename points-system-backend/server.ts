import express, { Request, Response } from "express"
import bodyParser from "body-parser"
import { Client } from "pg"
import dotenv from "dotenv"

dotenv.config()

// Create an instance of the express application
const app = express()
const port = process.env.PORT || 3000

// Initialize PostgreSQL client
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "5432"), // Ensure DB_PORT is correctly parsed as an integer
})

client.connect()

// Middleware
app.use(bodyParser.json())

// Endpoint to handle puzzle submission
app.post("/submit-solution", async (req: Request, res: Response) => {
  const { userId, puzzleId, solution } = req.body

  try {
    // Check if the user has already solved this puzzle
    const solutionQuery =
      "SELECT * FROM user_solutions WHERE user_id = $1 AND puzzle_id = $2"
    const solutionResult = await client.query(solutionQuery, [userId, puzzleId])

    if (solutionResult.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "You have already solved this puzzle!" })
    }

    // Validate the solution (dummy check, adjust logic based on your needs)
    if (!isValidSolution(solution)) {
      return res.status(400).json({ error: "Invalid solution" })
    }

    // Add points to the user (assuming 10 points per correct solution)
    const updatePointsQuery =
      "UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points"
    const updatedPointsResult = await client.query(updatePointsQuery, [
      10,
      userId,
    ])

    // Log the solution
    const insertSolutionQuery =
      "INSERT INTO user_solutions (user_id, puzzle_id, solution) VALUES ($1, $2, $3)"
    await client.query(insertSolutionQuery, [userId, puzzleId, solution])

    res.status(200).json({
      message: "Solution accepted!",
      newPoints: updatedPointsResult.rows[0].points,
    })
  } catch (error) {
    console.error("Error submitting solution:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Dummy function to validate the solution (you'll replace this with real logic)
function isValidSolution(solution: string) {
  return solution === "correct" // For demonstration
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
