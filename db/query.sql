-- SELECT department.department_name AS department, department.department_id
-- FROM department
-- ORDER BY department.department_name;

-- SELECT roles.title AS department, role.title, role.salary
-- FROM roles
-- LEFT JOIN department
-- ON roles.department_id = role.id
-- ORDER BY role.title;

-- SELECT employees.id AS department, employees.first_name, employees.last_name, employees.role_id, role.salary, employees.manager_id
-- FROM employees
-- LEFT JOIN role
-- ON employees.role_id = employees.id
-- ORDER BY employees.last_name;

