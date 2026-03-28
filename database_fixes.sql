-- ==========================================
-- STEP 1: Create the Reference Table
-- ==========================================
CREATE TABLE IF NOT EXISTS branches (
    branch_code VARCHAR(15) PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert standard baseline branches
INSERT INTO branches (branch_code, branch_name) VALUES 
('CSE', 'Computer Science & Engineering'),
('IT', 'Information Technology'),
('ECE', 'Electronics & Communication Engineering'),
('ME', 'Mechanical Engineering'),
('EE', 'Electrical Engineering'),
('CE', 'Civil Engineering')
ON CONFLICT (branch_code) DO NOTHING;

-- ==========================================
-- STEP 2: Normalize Existing Data
-- ==========================================
-- Clean up users.branch 
UPDATE users 
SET branch = 'CSE' 
WHERE UPPER(TRIM(branch)) IN ('CS', 'COMPUTER SCIENCE', 'C.S.', 'C.S', 'COMP SCI');

-- Clean up tasks.target_branch
UPDATE tasks 
SET target_branch = 'CSE' 
WHERE UPPER(TRIM(target_branch)) IN ('CS', 'COMPUTER SCIENCE', 'C.S.', 'C.S', 'COMP SCI');

-- Normalize other common aliases if any exist in your db
UPDATE users SET branch = 'IT' WHERE UPPER(TRIM(branch)) IN ('I.T.', 'INFORMATION TECHNOLOGY');
UPDATE tasks SET target_branch = 'IT' WHERE UPPER(TRIM(target_branch)) IN ('I.T.', 'INFORMATION TECHNOLOGY');

-- ==========================================
-- STEP 3: Handle Unmapped/Unknown Values
-- ==========================================
-- If there is still garbage data (e.g. "asdf", "arts"), we must insert it 
-- as an inactive branch in the reference table so the constraint doesn't fail.

INSERT INTO branches (branch_code, branch_name, is_active)
SELECT DISTINCT branch, branch, false
FROM users 
WHERE branch IS NOT NULL AND branch NOT IN (SELECT branch_code FROM branches)
ON CONFLICT (branch_code) DO NOTHING;

INSERT INTO branches (branch_code, branch_name, is_active)
SELECT DISTINCT target_branch, target_branch, false
FROM tasks 
WHERE target_branch IS NOT NULL AND target_branch NOT IN (SELECT branch_code FROM branches)
ON CONFLICT (branch_code) DO NOTHING;

-- ==========================================
-- STEP 4: Apply Constraints & Indexes
-- ==========================================
-- Add Foreign Key to enforce future consistency
ALTER TABLE users 
ADD CONSTRAINT fk_users_branch 
FOREIGN KEY (branch) REFERENCES branches(branch_code);

ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_target_branch 
FOREIGN KEY (target_branch) REFERENCES branches(branch_code);

-- Add performance indexes for filtering 
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch);
CREATE INDEX IF NOT EXISTS idx_tasks_target_branch ON tasks(target_branch);
