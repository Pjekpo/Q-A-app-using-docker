const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path');
const PORT = 3200;

// Database connection configuration (adjust as needed)
const conStr = {
  host: 'mysql-db',
  user: 'admin',
  password: 'Pj41142$',
  database: 'data'
};

const db = mysql.createConnection(conStr)

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database ...');
});

// Middleware to parse JSON bodies and serve static files from the public folder
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

//*** Add swagger doc generation code
// swagger-jsdoc reads annotated source code and creates an openAPI spec. Can use for functions too
const swaggerJsDoc = require('swagger-jsdoc') // Details at npmjs.com/package/swagger-jsdoc

// swagger-ui-express serves up the auto generated documentation as an API. Use for API routes
const swaggerUI = require('swagger-ui-express')

// Now setup the options as described in the npm docs: https://swagger.io/specification/#infoObject
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simple Node Server',
      version: '1.0.0',
      description: `Demonstrates some http methods and associated paths and 
      how to create documentation to the openAPI standard using a code first approach`,
    },
  },
  apis: ['Submit.js'], // If you have other files, you can use a wild card e.g. ./public/js/*.js or list them
}

const swaggerDocs = swaggerJsDoc(options) // Create the document object. Pass in options obj
//console.log(swaggerDocs); // Use this to check all is working then take it out

// Now add app.use. This will create an API path to our documentation generated by swagger-jsdoc. 
// The functions passed in are available to all routes. swaggerUI.serve will serve up the html documntation

// Root route to confirm the API is up and running
app.get('/', (req, res) => {
  res.send('API backend is running')
})

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))
// Now add the route documentation. You can use @swagger or @openapi. This is in YAML format
// ***

// GET /categories - returns a list of existing quiz categories
app.get('/categories', (req, res) => {
  const sql = 'SELECT name FROM quiz_categories';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const categories = results.map(row => row.name);
    res.json({ categories });
  });
});


/**
 * @swagger
 * /submit:
 *   post:
 *     summary: Submit questions
 *     tags:
 *       - Submit
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/submit'
 *     responses:
 *       200:
 *         description: |
 *           Question submitted successfully     

 *components:
 *  schemas:
 *    submit:
 *      type: object
 *      properties:
 *        text:
 *          type: string
 *          description: a question
 *          example: whats johns last name
 * 
 *        option_a:
 *          type: string
 *          description: Option a
 *          example: Doe
 * 
 *        option_b:
 *          type: string
 *          description: Option b
 *          example: Ben
 * 
 *        option_c:
 *          type: string
 *          description: Option c
 *          example: Cena
 * 
 *        option_d:
 *          type: string
 *          description: Option d
 *          example: Johnson
 * 
 *        correct_answer:
 *          type: string
 *          description: the correct answer
 *          example: Doe
 * 
 *        category_id:
 *          type: string
 *          description: Category ID
 *          example: General
 * 
 *      required:
 *        - text
 *        - option_a
 *        - option_b
 *        - option_c
 *        - option_d
 *        - correct_answer
 *        - category_id
*/


// POST /submit - accepts a new question with four answers and its category
app.post('/submit', (req, res) => {
  const { question, answers, correctAnswer, category } = req.body;

  // Basic validation of incoming data
  if (!question || !answers || answers.length !== 4 || typeof correctAnswer !== 'number' || !category) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  // Determine the correct answer text based on the index provided
  const correctAnswerText = answers[correctAnswer];

  // First, check if the category already exists in the database
  const checkCategorySql = 'SELECT id FROM quiz_categories WHERE name = ?';
  db.query(checkCategorySql, [category], (err, results) => {
    if (err) {
      console.error('Error checking category:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      // If category exists, use its id
      const categoryId = results[0].id;
      insertQuestion(categoryId);
    } else {
      // Insert new category and then insert the question
      const insertCategorySql = 'INSERT INTO quiz_categories (name) VALUES (?)';
      db.query(insertCategorySql, [category], (err, result) => {
        if (err) {
          console.error('Error inserting new category:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        const categoryId = result.insertId;
        insertQuestion(categoryId);
      });
    }
  });

  // Function to insert the new question into the database
  function insertQuestion(categoryId) {
    const insertQuestionSql = `
      INSERT INTO quiz_questions (text, option_a, option_b, option_c, option_d, correct_answer, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertQuestionSql,
      [
        question,
        answers[0],
        answers[1],
        answers[2],
        answers[3],
        correctAnswerText,
        categoryId
      ],
      (err, result) => {
        if (err) {
          console.error('Error inserting question:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Question submitted successfully', questionId: result.insertId });
      }
    );
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
