const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Warquest611@',
    database: 'employee_db',
});

async function startApp() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'Add an employee',
                'Edit an employee',
                'View all roles',
                'Add a role',
                'View all departments',
                'Add a department',
                'Quit',
            ],
        },
    ]);

    switch (action) {
        case 'View all employees':
            viewAllEmployees();
            break;
        case 'Add an employee':
            addEmployee();
            break;
        case 'Edit an employee':
            editEmployee();
            break;
        case 'View all roles':
            viewAllRoles();
            break;
        case 'Add a role':
            addRole();
            break;
        case 'View all departments':
            viewAllDepartments();
            break;
        case 'Add a department':
            addDepartment();
            break;
        case 'Quit':
            quit();
            break;
    }
}

// Function to view all employees
async function viewAllEmployees() {
    const [rows] = await pool.query(`
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
    `);

    console.table(rows);
    startApp();
}

// Function to add an employee
async function addEmployee() {
    // Get roles and managers from the database
    const [roles] = await pool.query('SELECT id, title FROM role');
    const [managers] = await pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager FROM employee');

    const employeeData = await inquirer.prompt([
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
            type: 'list',
            name: 'role_id',
            message: 'Select the employee\'s role:',
            choices: roles.map((role) => ({ name: role.title, value: role.id })),
        },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Select the employee\'s manager (if applicable):',
            choices: [{ name: 'None', value: null }, ...managers.map((manager) => ({ name: manager.manager, value: manager.id }))],
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the employee\'s salary:',
        },
    ]);

    await pool.query('INSERT INTO employee SET ?', employeeData);
    console.log('Employee added!');
    startApp();
}

// Function to edit an employee
async function editEmployee() {
    // Get a list of employees from the database
    const [employees] = await pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');

    const employeeToEdit = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee you want to edit:',
            choices: employees.map((employee) => ({ name: employee.name, value: employee.id })),
        },
    ]);

    const [employeeData] = await pool.query('SELECT * FROM employee WHERE id = ?', [employeeToEdit.employee_id]);

    // Prompt the user for the fields they want to edit
    const updatedEmployeeData = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter the updated first name (leave empty to keep current):',
            default: employeeData[0].first_name,
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter the updated last name (leave empty to keep current):',
            default: employeeData[0].last_name,
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the updated salary (leave empty to keep current):',
            default: employeeData[0].salary,
        },
    ]);

    // Update the employee data in the database
    await pool.query('UPDATE employee SET ? WHERE id = ?', [updatedEmployeeData, employeeToEdit.employee_id]);

    console.log('Employee updated!');
    startApp();
}


// Function to view all roles
async function viewAllRoles() {
    const [rows] = await pool.query('SELECT * FROM role');
    console.table(rows);
    startApp();
}

// Function to add a role
async function addRole() {
    const departmentChoices = await pool.query('SELECT id, name FROM department');

    const roleData = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the role title:',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the role salary:',
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Select the department for the role:',
            choices: departmentChoices[0].map((department) => ({ name: department.name, value: department.id })),
        },
    ]);

    await pool.query('INSERT INTO role SET ?', roleData);
    console.log('Role added!');
    startApp();
}

// Function to view all departments
async function viewAllDepartments() {
    const [rows] = await pool.query('SELECT * FROM department');
    console.table(rows);
    startApp();
}

// Function to add a department
async function addDepartment() {
    const departmentData = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the department name:',
        },
    ]);

    await pool.query('INSERT INTO department SET ?', departmentData);
    console.log('Department added!');
    startApp();
}

// Manual quit function to close the database connection
function quit() {
    pool.end();
    console.log('Goodbye!');
}

// Start the application
startApp();