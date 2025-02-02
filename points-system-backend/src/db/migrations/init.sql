CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_solutions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    puzzle_id INTEGER NOT NULL,
    solution TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_solutions_user_id ON user_solutions(user_id);
CREATE UNIQUE INDEX idx_user_solutions_unique ON user_solutions(user_id, puzzle_id); 