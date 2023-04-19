
const db = require('./config');

const inquirer = require('inquirer');

const validate = require('./js/validate');
const PORT = process.env.PORT || 3001
const connection = require('./config/index')



// database connection and inquirer start prompt
connection.connect((error)=>{
    if (error) throw error;
    startPrompt();
});



function startPrompt() {
    inquirer.prompt([
        {
            type:'list',
            message: 'Please select what you would like to do?',
            choices: [
                'View all Departments',
                'View all Roles', 
                'View all Employees', 
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'Remove Employee',
                'Quit'
            ],
            name: 'task' 
        }
    ])
    .then((answers) => {
      console.table(answers)
        const {task} = answers;
        if (task === 'View all Departments') {
          console.log('hit')
            viewAllDepartments();
        }
        if (task === 'View all Roles') {
            viewAllRoles();
        }
        if (task === 'View all Employees') {
            viewAllEmployees();
        }
        if (task === 'Add a Department') {
            addDepartment();
        }
        if (task === 'Add a Role') {
            addRole();
        }
        if (task === 'Add an Employee') {
            addEmployee();
        }
        if (task === 'Update Employee Role') {
            updateEmployee();
        }
        if (task === 'Update Employee Manager') {
            updateManager();
        }
        if (task === 'Remove Employee') {
            removeEmployee();
        }
        if (task === 'Quit') {
            connection.end();
        }
    })
}

// view tasks


const viewAllDepartments = async () => {
    let sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
     connection.query(sql, (error, response) => {
      if (error) throw error;
      console.table(response);
      startPrompt();
    });
  };

const viewAllRoles = () => {
    let sql = `SELECT role.id, role.title, department.department_name AS department FROM role INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
      if (error) throw error;
        response.forEach((role) => {console.log(role.title);});
        console.table(response);
        startPrompt();
    });
  };

  const viewAllEmployees = () => {
    let sql = `SELECT
    employees.id,
    employees.first_name,
    employees.last_name,
    role.title,
    role.salary,
    department.department_name AS 'department'
FROM
    employees, role, department
WHERE
    department.id = role.department_id
    AND role.id = employees.role_id
ORDER BY employees.id ASC;`;
    connection.query(sql, (error, response)=> {
        if (error) throw error;
        console.table(response);
        startPrompt();
    });
};

// ADD tasks
const addDepartment = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'Please name new Department',
          validate: validate.validateString
        }
      ])
      .then((answer) => {
        let sql = `INSERT INTO department (department_name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          console.log('\n success');
          viewAllDepartments();
        });
      });
};


const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let deptNames = [];
        response.forEach((department) => {deptNames.push(department.department_name);});
        deptNames.push('Add to Department');
        inquirer
          .prompt([
            {
              name: 'departmentName',
              type: 'list',
              message: 'Please detail which department this role should be classed within',
              choices: deptNames
            }
          ])
          .then((answer) => {
            if (answer.departmentName === 'Create Department') {
              this.addDepartment();
            } else {
              newRole(answer);
            }
          });
  
        const newRole = (departmentData) => {
          inquirer
            .prompt([
              {
                name: 'newRole',
                type: 'input',
                message: 'Please provide name of new Role',
                validate: validate.validateString
              },
              {
                name: 'salary',
                type: 'input',
                message: 'Please provide New Roles salary',
                validate: validate.validateSalary
              }
            ])
            .then((answer) => {
              let createdRole = answer.newRole;
              let departmentId;
  
              response.forEach((department) => {
                if (departmentData.departmentName === department.department_name) {departmentId = department.id;}
              });
  
              let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
              let emplRole = [createdRole, answer.salary, departmentId];
              connection.query(sql, emplRole, (error) => {
                if (error) throw error;
                console.log('\n success');
                viewAllRoles();
              });

            });
        };
      });
    };



const addEmployee = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "Please provide employee's first name",
        validate: addFirstName => {
          if (addFirstName) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "Please provide employee's last name",
        validate: addLastName => {
          if (addLastName) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
      .then(answer => {
      const emplName = [answer.firstName, answer.lastName]
      const role = `SELECT role.id, role.title FROM role`;
      connection.query(role, (error, data) => {
        if (error) throw error; 
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "please provide employee's role in company",
                choices: roles
              }
            ])
              .then(roleIdentity => {
                const role = roleIdentity.role;
                emplName.push(role);
                const managerDB =  `SELECT * FROM employees`;
                connection.query(managerDB, (error, data) => {
                  if (error) throw error;
                  const manager = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'manager',
                      message: "Please assign a Manager to new Employee",
                      choices: manager
                    }
                  ])
                    .then(managerAssign => {
                      const manager = managerAssign.manager;
                      emplName.push(manager);
                      const sql =   `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                      connection.query(sql, emplName, (error) => {
                      if (error) throw error;
                      console.log("Employee added successfully!")
                      viewAllEmployees();
                });
              });
            });
          });
       });
    });
  };

// UPDATE Tasks

const updateEmployee= () => {
    let sql = `SELECT employees.id, employees.first_name, employees.last_name, role.id AS 'role_id' FROM employees, role, department WHERE department.id = role.department_id AND role.id = employees.role_id`;
     connection.query(sql, (error, response) => {
      if (error) throw error;
      let emplNames = [];
      response.forEach((employees) => {emplNames.push(`${employees.first_name} ${employees.last_name}`);});
      let sql = `SELECT role.id, role.title FROM role`;
      connection.query(sql, (error, response) => {
        if (error) throw error;
        let roleAry = [];
        response.forEach((role) => {roleAry.push(role.title);});
      
      inquirer
        .prompt([
          {
            name: 'EmplUpdate',
            type: 'list',
            message: 'Please select employee to be updated',
            choices: emplNames
          },
          {
            name: 'RoleUpdate',
            type: 'list',
            message: 'What is the employees new role?',
            choices: roleAry
          },
        ])
        .then((answer) => {
          let newRole, employeeId;

          response.forEach((role)=> {
            if (answer.RoleUpdate === role.title) {
            newRole = role.id;
          }
        });
          
          response.forEach((employees) => {
            if (
              answer.EmplUpdate === `${employees.first_name} ${employees.last_name}`
            ) {
              employeeId = employees.id;
            }
          });

          let rolesSql = `UPDATE employees SET employees.role_id = ? WHERE employees.id = ?`;
            connection.query(
              rolesSql,
              [newRole, employeeId],
              (error) => {
                if (error) throw error;
                console.log('\n success, employee role updated');
                startPrompt();
              }
            );
          });
        });
      });
      };
    





const updateManager = () => {
    let sql = `SELECT employees.id, employees.first_name, employees.last_name, employees.manager_id FROM employees`;
     connection.query(sql, (error, response) => {
      let emplNames = [];
      response.forEach((employees) => {emplNames.push(`${employees.first_name} ${employees.last_name}`);});
      inquirer
        .prompt([
          {
            name: 'EmployeeMngUpdate',
            type: 'list',
            message: 'Please select employee to have manager updated',
            choices: emplNames
          },
          {
            name: 'updatedManager',
            type: 'list',
            message: 'Please select which Manager Employee should now be classed to',
            choices: emplNames
          }
        ])
        .then((answer) => {
          let employeeId, managerId;
          response.forEach((employees) => {
            if (
              answer.selectedEmployee === `${employees.first_name} ${employees.last_name}`
            ) {
              employeeId = employees.id;
            }
            if (
              answer.updatedManager === `${employees.first_name} ${employees.last_name}`
            ) {
              managerId = employees.id;
            }
          });
          if (validate.isSame(answer.selectedEmployee, answer.updatedManager)) {
            startPrompt();
          } else {
            let sql = `UPDATE employees SET employees.manager_id = ? WHERE employees.id = ?`;
            connection.query(
              sql,
              [managerId, employeeId],
              (error) => {
                if (error) throw error;
                console.log('Success, Employee Manager updated')
                startPrompt();
              }
            );
          }
        });
    });
};




// DELETE TASK
const removeEmployee = () => {
    let sql =     `SELECT employees.id, employees.first_name, employees.last_name FROM employees`;

    connection.query(sql, (error, response) => {
      if (error) throw error;
      let emplNames = [];
      response.forEach((employees) => {emplNames.push(`${employees.first_name} ${employees.last_name}`);});

      inquirer
        .prompt([
          {
            name: 'selectedEmployee',
            type: 'list',
            message: 'Please select which employee you would like to delete',
            choices: emplNames
          }
        ])
        .then((answer) => {
          let employeeId;

          response.forEach((employees) => {
            if (
              answer.selectedEmployee ===
              `${employees.first_name} ${employees.last_name}`
            ) {
              employeeId = employees.id;
            }
          });
          let sql = `DELETE FROM employees WHERE employees.id = ?`;
          connection.query(sql, [employeeId], (error) => {
            if (error) throw error;
            viewAllEmployees();
          });
        });
    });
  };










    





