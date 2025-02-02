import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Endpoint to handle puzzle submission
app.post('/submit-solution', async (req: Request, res: Response) => {
  const { userId, puzzleId, solution } = req.body;

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if the user has already solved this puzzle
      const solutionQuery = 'SELECT * FROM user_solutions WHERE user_id = $1 AND puzzle_id = $2';
      const solutionResult = await client.query(solutionQuery, [userId, puzzleId]);

      if (solutionResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'You have already solved this puzzle!' });
      }

      // Validate the solution
      if (!isValidSolution(solution)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid solution' });
      }

      // Add points to the user
      const updatePointsQuery = 'UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points';
      const updatedPointsResult = await client.query(updatePointsQuery, [10, userId]);

      // Log the solution
      const insertSolutionQuery = 
        'INSERT INTO user_solutions (user_id, puzzle_id, solution) VALUES ($1, $2, $3)';
      await client.query(insertSolutionQuery, [userId, puzzleId, solution]);

      await client.query('COMMIT');

      res.status(200).json({
        message: 'Solution accepted!',
        newPoints: updatedPointsResult.rows[0].points,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function isValidSolution(solution: string): boolean {
  return solution === 'correct'; // Replace with actual validation logic
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 