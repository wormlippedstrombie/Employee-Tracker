const inquirer = require('inquirer');
const db = require('./db'); // Import the database connection module

// Function to start the application
function startApp() {
    // Use Inquirer to present menu options and handle user input
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'menuChoice',
                message: 'What would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Exit',
                ],
            },
        ])
        .then((answers) => {
            // Handle user's choice here
            switch (answers.menuChoice) {
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'View all roles':
                    viewAllRoles();
                    break;
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployeeRole();
                    break;
                case 'Exit':
                    db.close(); // Close the database connection
                    console.log('Goodbye!');
                    process.exit();
            }
        });
}

// Function to view all departments
function viewAllDepartments() {
    db.queryAsync('SELECT * FROM department').then((results) => {
        // Display the results in a formatted table
        console.table(results);
        startApp(); // Return to the main menu
    });
}

// Function to view all roles
function viewAllRoles() {
    db.queryAsync('SELECT * FROM role').then((results) => {
        // Display the results in a formatted table
        console.table(results);
        startApp(); // Return to the main menu
    });
}

function viewAllEmployees() {
    const query = `
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            e.salary,
            r.title AS role,
            d.name AS department,
            CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN role r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
    `;
    db.queryAsync(query).then((results) => {
        console.table(results);
        startApp();
    });
}

// Function to add a department
function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of the department:',
            },
        ])
        .then((answers) => {
            db.queryAsync('INSERT INTO department SET ?', answers).then(() => {
                console.log('Department added!');
                startApp(); // Return to the main menu
            });
        });
}

// Function to add a role
function addRole() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the role:',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the role:',
            },
            {
                type: 'input',
                name: 'department_id',
                message: 'Enter the department ID for the role:',
            },
        ])
        .then((answers) => {
            db.queryAsync('INSERT INTO role SET ?', answers).then(() => {
                console.log('Role added!');
                startApp(); // Return to the main menu
            });
        });
}

// Function to add an employee
function addEmployee() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'Enter the employee\'s first name:',
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'Enter the employee\'s last name:',
            },
            {
                type: 'input',
                name: 'role_id',
                message: 'Enter the role ID for the employee:',
            },
            {
                type: 'input',
                name: 'manager_id',
                message: 'Enter the manager ID for the employee (leave empty if none):',
            },
        ])
        .then((answers) => {
            db.queryAsync('INSERT INTO employee SET ?', answers).then(() => {
                console.log('Employee added!');
                startApp(); // Return to the main menu
            });
        });
}

// Function to update an employee's role
function updateEmployeeRole() {
    // First, query the database to get a list of employees
    db.queryAsync('SELECT id, first_name, last_name FROM employee').then((employees) => {
        const employeeChoices = employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));

        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Select the employee to update:',
                    choices: employeeChoices,
                },
                {
                    type: 'input',
                    name: 'new_role_id',
                    message: 'Enter the new role ID for the employee:',
                },
            ])
            .then((answers) => {
                db.queryAsync('UPDATE employee SET role_id = ? WHERE id = ?', [answers.new_role_id, answers.employee_id])
                    .then(() => {
                        console.log('Employee role updated!');
                        startApp(); // Return to the main menu
                    });
            });
    });
}

// Start the application
startApp();