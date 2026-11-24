const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'books.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read books from JSON file
function readBooks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading books file:', error);
    return [];
  }
}

// Helper function to write books to JSON file
function writeBooks(books) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing books file:', error);
    return false;
  }
}

// Routes

// 1. GET /books - Retrieve all books
app.get('/books', (req, res) => {
  const books = readBooks();
  res.status(200).json(books);
});

// 2. POST /books - Add a new book
app.post('/books', (req, res) => {
  const { title, author, category, year } = req.body;

  // Validation
  if (!title || !author || !category || !year) {
    return res.status(400).json({ error: 'All fields (title, author, category, year) are required.' });
  }

  const books = readBooks();
  const newBook = {
    id: Date.now().toString(),
    title: String(title).trim(),
    author: String(author).trim(),
    category: String(category).trim(),
    year: Number(year)
  };

  books.push(newBook);
  const success = writeBooks(books);

  if (!success) {
    return res.status(500).json({ error: 'Failed to save book to storage.' });
  }

  res.status(201).json(newBook);
});

// 3. DELETE /books/:id - Delete a book by ID
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const books = readBooks();
  const bookIndex = books.findIndex(b => String(b.id) === String(id));

  if (bookIndex === -1) {
    return res.status(404).json({ error: `Book with id "${id}" not found.` });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  const success = writeBooks(books);

  if (!success) {
    return res.status(500).json({ error: 'Failed to update storage after deletion.' });
  }

  res.status(200).json({ message: 'Book deleted successfully.', book: deletedBook });
});

// Root endpoint for status check
app.get('/', (req, res) => {
  res.send({ status: 'Library Book Tracker API is running' });
});

app.listen(PORT, () => {
  console.log(`Library Book Tracker backend running at http://localhost:${PORT}`);
});
