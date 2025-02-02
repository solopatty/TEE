export interface User {
  id: number;
  username: string;
  email: string;
  points: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserSolution {
  id: number;
  user_id: number;
  puzzle_id: number;
  solution: string;
  created_at: Date;
} 