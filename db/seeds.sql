USE employee_db;

INSERT INTO
    department (department_name)
VALUES ("Clinic"), ("Scheduling"), ("Midlevels"), ("Therapy"), ("Imaging"), ("Billing/Medical Records"), ("Administration"), ("Physician");

INSERT INTO
    role (department_id, title, salary)
VALUES (
        1,
        "Medical Assistant",
        "50000"
    ), (2, "Scheduler", "50000"), (
        3,
        "Physician Assistant",
        "100000"
    ), (
        4,
        "Physical Therapist",
        "75000"
    ), (
        5,
        "Radiology Technician",
        "65000"
    ), (6, "Biller/Coder", "65000"), (7, "Administrator", "120000"), (
        8,
        "Employeed Physician",
        "250000"
    );

INSERT INTO
    employees (
        role_id,
        first_name,
        last_name,
        manager_id
    )
VALUES (1, "Krisha", "S", 4), (2, "Amy", "D", 4), (3, "Tiffany", "A", 4), (4, "Susan", "B", 10), (5, "Becky", "G", 10), (6, "Phillip", "F", 10), (7, "Darin", "B", 10), (8, "Terri", "A", 10), (9, "Donna", "R", 10), (10, "Autumn", "Q", 12), (11, "Chelsey", "V", 12), (12, "John", "B", 14), (13, "Robert", "H", 14), (14, "Eric", "J", null);

SELECT
    employees.id,
    employees.first_name,
    employees.last_name,
    role.title,
    role.salary,
    department.department_name AS 'department'
FROM
    employees,
    role,
    department
WHERE
    department.id = role.department_id
    AND role.id = employees.role_id
ORDER BY employees.id ASC;