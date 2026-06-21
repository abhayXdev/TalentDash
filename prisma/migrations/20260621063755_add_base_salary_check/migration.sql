-- Add check constraint for base_salary > 0
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_base_salary_check" CHECK ("base_salary" > 0);