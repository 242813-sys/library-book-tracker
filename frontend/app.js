// API Configuration
const API_URL = 'http://localhost:5000/books';

// Global state
let books = [];
let currentCategoryFilter = 'All';

// DOM Element references
const bookForm = document.getElementById('bookForm');
const bookTitleInput = document.getElementById('bookTitle');
const bookAuthorInput = document.getElementById('bookAuthor');
const bookCategoryInput = document.getElementById('bookCategory');
const bookYearInput = document.getElementById('bookYear');
const booksContainer = document.getElementById('booksContainer');
const categoryFilterSelect = document.getElementById('categoryFilter');
const bookCountSpan = document.getElementById('bookCount');
const emptyStateDiv = document.getElementById('emptyState');
const alertBox = document.getElementById('alertBox');

// Helper to show dismissible alerts
function showAlert(message, type = 'success') {
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
      ${type === 'success' ? '<i class="bi bi-check-circle-fill me-2"></i>' : '<i class="bi bi-exclamation-triangle-fill me-2"></i>'}
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  setTimeout(() => {
    const alert = alertBox.querySelector('.alert');
    if (alert) {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }
  }, 4000);
}

// Fetch all books from the Node.js REST API
async function fetchBooks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    books = await response.json();
    updateCategoryFilterDropdown();
    renderBooks();
  } catch (error) {
    console.error('Error fetching books:', error);
    showAlert('Could not load books from backend. Please ensure the backend server is running.', 'danger');
    bookCountSpan.textContent = 'Failed to load books';
  }
}

// Update the Category Filter dropdown dynamically using map and Set
const updateCategoryFilterDropdown = () => {
  // Use map to get all categories and arrow functions
  const existingCategories = books.map(book => book.category);
  const uniqueCategories = ['All', ...new Set(existingCategories.filter(Boolean))];

  const currentSelection = categoryFilterSelect.value;
  categoryFilterSelect.innerHTML = '';

  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat === 'All' ? 'All Categories' : cat;
    if (cat === currentCategoryFilter) {
      option.selected = true;
    }
    categoryFilterSelect.appendChild(option);
  });

  if (!uniqueCategories.includes(currentCategoryFilter)) {
    currentCategoryFilter = 'All';
    categoryFilterSelect.value = 'All';
  }
};

// Filter books using array method filter and arrow functions
const getFilteredBooks = () => {
  if (currentCategoryFilter === 'All') {
    return books;
  }
  return books.filter(book => book.category === currentCategoryFilter);
};

// Render books using DOM manipulation
function renderBooks() {
  const filteredBooks = getFilteredBooks();
  booksContainer.innerHTML = '';

  // Update book count text
  bookCountSpan.textContent = `Showing ${filteredBooks.length} of ${books.length} book(s)`;

  if (filteredBooks.length === 0) {
    emptyStateDiv.classList.remove('d-none');
    return;
  }

  emptyStateDiv.classList.add('d-none');

  filteredBooks.forEach(book => {
    // Create card element via DOM manipulation
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-12';
    col.setAttribute('data-id', book.id);

    col.innerHTML = `
      <div class="card h-100 shadow-sm border-0 book-card">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle badge-category">
                ${escapeHtml(book.category)}
              </span>
              <span class="badge bg-secondary-subtle text-secondary small">
                <i class="bi bi-calendar3 me-1"></i>${book.year}
              </span>
            </div>
            <h5 class="card-title fw-bold text-dark mb-1">${escapeHtml(book.title)}</h5>
            <p class="card-subtitle text-muted mb-3">
              <i class="bi bi-person me-1"></i>By ${escapeHtml(book.author)}
            </p>
          </div>
          <div class="pt-2 border-top d-flex justify-content-end">
            <button class="btn btn-outline-danger btn-sm delete-btn" data-id="${book.id}">
              <i class="bi bi-trash3 me-1"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;

    booksContainer.appendChild(col);
  });
}

// Utility to escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Handle Add Book form submission with basic validation
bookForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  event.stopPropagation();

  const title = bookTitleInput.value.trim();
  const author = bookAuthorInput.value.trim();
  const category = bookCategoryInput.value.trim();
  const year = bookYearInput.value.trim();

  // Basic form validation: no empty fields
  if (!title || !author || !category || !year) {
    bookForm.classList.add('was-validated');
    showAlert('Please fill in all required fields.', 'warning');
    return;
  }

  const newBookPayload = {
    title,
    author,
    category,
    year: parseInt(year, 10)
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBookPayload)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to add book');
    }

    const createdBook = await response.json();

    // DOM & State updates
    books.push(createdBook);
    updateCategoryFilterDropdown();
    renderBooks();

    // Reset form
    bookForm.reset();
    bookForm.classList.remove('was-validated');
    showAlert(`"${createdBook.title}" was added successfully!`, 'success');
  } catch (error) {
    console.error('Error adding book:', error);
    showAlert(`Error adding book: ${error.message}`, 'danger');
  }
});

// Handle Delete Book via DOM event delegation
booksContainer.addEventListener('click', async (event) => {
  const deleteBtn = event.target.closest('.delete-btn');
  if (!deleteBtn) return;

  const bookId = deleteBtn.getAttribute('data-id');
  if (!bookId) return;

  const bookToDelete = books.find(b => String(b.id) === String(bookId));
  const bookName = bookToDelete ? bookToDelete.title : 'this book';

  if (!confirm(`Are you sure you want to remove "${bookName}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${bookId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to delete book');
    }

    // Remove from array and DOM
    books = books.filter(b => String(b.id) !== String(bookId));
    updateCategoryFilterDropdown();
    renderBooks();
    showAlert(`"${bookName}" has been removed.`, 'info');
  } catch (error) {
    console.error('Error deleting book:', error);
    showAlert(`Error deleting book: ${error.message}`, 'danger');
  }
});

// Category filter change event
categoryFilterSelect.addEventListener('change', (event) => {
  currentCategoryFilter = event.target.value;
  renderBooks();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
});
