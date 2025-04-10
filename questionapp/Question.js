// Import the Express.js framework to create the server
const express = require('express')
const app = express()

// Import MySQL2 library to connect to a MySQL database
const mysql = require('mysql2')

// Import path module to work with file and directory paths
const path = require('path')

// Define the port number the server will listen on
const PORT = 3000

// MySQL database connection details (container name, user, password, db name)
const conStr = {
  host: 'mysql-db',        // Hostname (likely a Docker service name)
  user: 'admin',           // MySQL username
  password: 'Pj41142$',    // MySQL password
  database: 'data'         // Database name
}

// Create a connection to the MySQL database using the details above
const db = mysql.createConnection(conStr)

// Attempt to connect to the database
db.connect((err) => {
  if (err) {
    // If connection fails, log the error and stop the server
    console.error('Database connection error:', err);
    process.exit(1);
  }
  // Connection successful
  console.log('Connected to MySQL database ...');
});

// Middleware to serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')))

// Root route to confirm the API is up and running
app.get('/', (req, res) => {
  res.send('API backend is running')
})

// GET /categories
// Fetch all category names from the quiz_categories table
app.get('/categories', (req, res) => {
  const sql = 'SELECT name FROM quiz_categories' // SQL query
  db.query(sql, (err, results) => {
    if (err) {
      // If there's a query error, send a 500 error
      console.error('Database query error:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    // Extract category names from the query results
    const categories = results.map(row => row.name)
    res.json({ categories }) // Send them back as a JSON response
  })
})

// GET /question/:category
// Fetch a random question from the given category
app.get('/question/:category', (req, res) => {
  const category = req.params.category // Get category from URL parameter
  const count = req.query.count ? req.query.count : 1 // Optional count param, default is 1

  // SQL query to get a random question from the specified category
  const sql = `
    SELECT 
      quiz_questions.id,
      quiz_questions.text,
      quiz_questions.option_a,
      quiz_questions.option_b,
      quiz_questions.option_c,
      quiz_questions.option_d,
      quiz_questions.correct_answer,
      quiz_categories.name AS category
    FROM quiz_questions
    INNER JOIN quiz_categories ON quiz_questions.category_id = quiz_categories.id
    WHERE quiz_categories.name = ?
    ORDER BY RAND()
    LIMIT ?
  `

  // Execute the query with the selected category and count as parameters
  db.query(sql, [category, count], (err, results) => {
    if (err) {
      // If query fails, log error and return 500 status
      console.error('Database query error:', err);
      return res.sendStatus(500)
    }
    // Return the results as a JSON response
    res.json(results)
  })
})

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
