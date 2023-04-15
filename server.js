// require('dotenv').config()
// console.log(process.env)
const db = require('./config');
// const { error } = require('console');
const inquirer = require('inquirer');
const cTable = require('console.table');
const validate = require('./js/validate');
const PORT = process.env.PORT || 3001
const connection = require('./config/index')

// const { default: Choice } = require('inquirer/lib/objects/choices');
// const values = [
    
//     'first_name', 'last_name', 'title', 'salary', 'department_name', 'department_id', 'role_id'
// ]
// console.table(values[0], values.slice(1));

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
                'Update Employee',
                'Update Employee Manager',
                'Remove Employee',
                'Quit'
            ],
            name: 'task' 
        }
    ])
    .then((answers) => {
        const {choice} = answers;
        if (choice === 'View all Departments') {
            viewAllDepartments();
        }
        if (choice === 'View all Roles') {
            viewAllRoles();
        }
        if (choice === 'View all Employees') {
            viewAllEmployees();
        }
        if (choice === 'Add a Department') {
            addDepartment();
        }
        if (choice === 'Add a Role') {
            addRole();
        }
        if (choice === 'Add an Employee') {
            addEmployee();
        }
        if (choice === 'Update Employee') {
            updateEmployee();
        }
        if (choice === 'Update Employee Manager') {
            updateManager();
        }
        if (choice === 'Remove Employee') {
            removeEmployee();
        }
        if (choice === 'Quit') {
            connection.end();
        }
    })
}

// view tasks


const viewAllDepartments = () => {
    let sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      startPrompt();
    });
  };

const viewAllRoles = () => {
    let sql = `SELECT role.id, role.title, department.department_name AS department FROM role INNER JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
        response.forEach((role) => {console.log(role.title);});
        startPrompt();
    });
  };

  const viewAllEmployees = () => {
    let sql = `SELECT emmployee.id, employee.first_name, employee.last_name, role.title, role.salary, department.department_name AS 'department', FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id = employee.role_id ORDER BY employee.id ASC`;
    connection.promise().query(sql, (error, response)=> {
        if (error) throw error;
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
          viewAllDepartments();
        });
      });
};




const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.promise().query(sql, (error, response) => {
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
              connection.promise().query(sql, emplRole, (error) => {
                if (error) throw error;
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
      connection.promise().query(role, (error, data) => {
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
                const managerDB =  `SELECT * FROM employee`;
                connection.promise().query(managerDB, (error, data) => {
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
                      const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
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
    let sql = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;
     connection.promise().query(sql, (error, response) => {
      let emplNames = [];
      response.forEach((employee) => {emplNames.push(`${employee.first_name} ${employee.last_name}`);});
      inquirer
        .prompt([
          {
            name: 'EmplUpdate',
            type: 'list',
            message: 'Please select employee to be updated',
            choices: emplNames
          },
        ])
        .then((answer) => {
          let employeeId;
          response.forEach((employee) => {
            if (
              answer.selectedEmployee === `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });
          if (validate.isSame(answer.selectedEmployee)) {
            startPrompt();
          } else {
            let sql = `UPDATE employee WHERE employee.id = ?`;
            connection.query(
              sql,
              [employeeId],
              (error) => {
                if (error) throw error;
                startPrompt();
              }
            );
          }
        });
    });
};





const updateManager = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id FROM employee`;
     connection.promise().query(sql, (error, response) => {
      let emplNames = [];
      response.forEach((employee) => {emplNames.push(`${employee.first_name} ${employee.last_name}`);});
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
          response.forEach((employee) => {
            if (
              answer.selectedEmployee === `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
            if (
              answer.updatedManager === `${employee.first_name} ${employee.last_name}`
            ) {
              managerId = employee.id;
            }
          });
          if (validate.isSame(answer.selectedEmployee, answer.udpatedManager)) {
            startPrompt();
          } else {
            let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;
            connection.query(
              sql,
              [managerId, employeeId],
              (error) => {
                if (error) throw error;
                startPrompt();
              }
            );
          }
        });
    });
};




// DELETE TASK
const removeEmployee = () => {
    let sql =     `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let emplNames = [];
      response.forEach((employee) => {emplNames.push(`${employee.first_name} ${employee.last_name}`);});

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

          response.forEach((employee) => {
            if (
              answer.selectedEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });
          let sql = `DELETE FROM employee WHERE employee.id = ?`;
          connection.query(sql, [employeeId], (error) => {
            if (error) throw error;
            viewAllEmployees();
          });
        });
    });
  };








// function queryAllUsers(){
//     db.promise().query("SELECT * FROM employees").then((results)=>{
//         console.log(results)
//     })
//     .catch (error => console.log(error))
// } 



// function main(){
//     startPrompt() 
// }


// main()

    





