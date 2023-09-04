const mysql = require('mysql12');
const util = require('util');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Warquest611@',
    database: 'employee_db',
});

// Promisify MySQL queries
const queryAsync = util.promisify(db.query).bind(db);

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

module.exports = {
    queryAsync,
    close: () => db.end(),
};
// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });