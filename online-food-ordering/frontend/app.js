// API Endpoints
const API_BASE = 'http://localhost:4000';
const API_KEY = 'food-ordering-secret-key-2026';

// Global State
let restaurants = [];
let menuItems = [];
let selectedRestaurantFilter = 'All';

// DOM References
const restaurantForm = document.getElementById('restaurantForm');
const restNameInput = document.getElementById('restName');
const restAddressInput = document.getElementById('restAddress');

const menuItemForm = document.getElementById('menuItemForm');
const itemRestaurantSelect = document.getElementById('itemRestaurant');
const itemNameInput = document.getElementById('itemName');
const itemPriceInput = document.getElementById('itemPrice');
const itemCategorySelect = document.getElementById('itemCategory');
const itemDescriptionInput = document.getElementById('itemDescription');

const restaurantFilterSelect = document.getElementById('restaurantFilter');
const menuItemsContainer = document.getElementById('menuItemsContainer');
const itemsCountSpan = document.getElementById('itemsCount');
const noItemsState = document.getElementById('noItemsState');
const alertContainer = document.getElementById('alertContainer');

// Modal Elements
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editItemForm = document.getElementById('editItemForm');
const editItemId = document.getElementById('editItemId');
const editName = document.getElementById('editName');
const editPrice = document.getElementById('editPrice');
const editCategory = document.getElementById('editCategory');
const editDescription = document.getElementById('editDescription');

// Alert Banner helper
function showAlert(message, type = 'success') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
      ${type === 'success' ? '<i class="bi bi-check-circle-fill me-2"></i>' : '<i class="bi bi-exclamation-triangle-fill me-2"></i>'}
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  setTimeout(() => {
    const alert = alertContainer.querySelector('.alert');
    if (alert) {
      bootstrap.Alert.getOrCreateInstance(alert).close();
    }
  }, 4000);
}

// Helper headers for API-key protected routes
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
}

// 1. Load Restaurants using async/await
async function loadRestaurants() {
  try {
    const res = await fetch(`${API_BASE}/restaurants`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    restaurants = await res.json();
    populateRestaurantSelects();
  } catch (err) {
    console.error('Failed to load restaurants:', err);
    showAlert('Could not connect to NestJS backend on http://localhost:4000', 'danger');
  }
}

// 2. Load Menu Items using async/await & API Guard header
async function loadMenuItems() {
  try {
    const res = await fetch(`${API_BASE}/menu-items`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    menuItems = await res.json();
    renderMenuItems();
  } catch (err) {
    console.error('Failed to load menu items:', err);
    showAlert(`Error loading menu items: ${err.message}`, 'danger');
  }
}

// Populate dropdowns with restaurants
function populateRestaurantSelects() {
  // Add item form select
  itemRestaurantSelect.innerHTML = '<option value="" disabled selected>Choose a restaurant...</option>';
  restaurants.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.address})`;
    itemRestaurantSelect.appendChild(opt);
  });

  // Filter select
  const currentVal = restaurantFilterSelect.value;
  restaurantFilterSelect.innerHTML = '<option value="All">All Restaurants</option>';
  restaurants.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.name;
    restaurantFilterSelect.appendChild(opt);
  });
  if (currentVal && Array.from(restaurantFilterSelect.options).some(o => o.value === currentVal)) {
    restaurantFilterSelect.value = currentVal;
  }
}

// Render menu items into DOM
function renderMenuItems() {
  menuItemsContainer.innerHTML = '';

  const filtered = selectedRestaurantFilter === 'All'
    ? menuItems
    : menuItems.filter(item => String(item.restaurantId) === String(selectedRestaurantFilter));

  itemsCountSpan.textContent = `Showing ${filtered.length} of ${menuItems.length} item(s)`;

  if (filtered.length === 0) {
    noItemsState.classList.remove('d-none');
    return;
  }
  noItemsState.classList.add('d-none');

  filtered.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-12';
    col.setAttribute('data-id', item.id);

    const restaurantName = item.restaurant ? item.restaurant.name : 'Unknown Restaurant';

    col.innerHTML = `
      <div class="card h-100 shadow-sm border-0 food-card">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge badge-res border">
                <i class="bi bi-shop me-1"></i>${escapeHtml(restaurantName)}
              </span>
              <span class="badge bg-secondary-subtle text-secondary small">
                ${escapeHtml(item.category || 'General')}
              </span>
            </div>
            <h5 class="card-title fw-bold text-dark mb-1">${escapeHtml(item.name)}</h5>
            <p class="card-text text-muted small mb-2">${escapeHtml(item.description || 'Delicious dish made with fresh ingredients.')}</p>
          </div>
          <div>
            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
              <span class="price-tag">$${parseFloat(item.price).toFixed(2)}</span>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary edit-btn" data-id="${item.id}">
                  <i class="bi bi-pencil-square"></i> Edit
                </button>
                <button class="btn btn-outline-danger delete-btn" data-id="${item.id}">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    menuItemsContainer.appendChild(col);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Handle Add Restaurant form submit
restaurantForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = restNameInput.value.trim();
  const address = restAddressInput.value.trim();

  if (!name || !address) {
    restaurantForm.classList.add('was-validated');
    showAlert('Please fill in both restaurant name and address.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create restaurant');
    }

    const created = await res.json();
    restaurants.push(created);
    populateRestaurantSelects();
    itemRestaurantSelect.value = created.id;
    restaurantForm.reset();
    restaurantForm.classList.remove('was-validated');
    showAlert(`Restaurant "${created.name}" created successfully!`, 'success');
  } catch (err) {
    console.error(err);
    showAlert(`Error: ${err.message}`, 'danger');
  }
});

// Handle Add Menu Item form submit with validation
menuItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const restaurantId = parseInt(itemRestaurantSelect.value, 10);
  const name = itemNameInput.value.trim();
  const price = parseFloat(itemPriceInput.value);
  const category = itemCategorySelect.value;
  const description = itemDescriptionInput.value.trim();

  // JavaScript validation: name must not be empty, price must be a positive number
  if (!restaurantId || !name || isNaN(price) || price <= 0) {
    menuItemForm.classList.add('was-validated');
    showAlert('Validation error: Item name is required, and price must be a positive number.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/menu-items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        price,
        category,
        description,
        restaurantId,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message);
    }

    const created = await res.json();
    menuItems.unshift(created);
    renderMenuItems();
    menuItemForm.reset();
    menuItemForm.classList.remove('was-validated');
    showAlert(`Menu item "${created.name}" added successfully!`, 'success');
  } catch (err) {
    console.error(err);
    showAlert(`Error: ${err.message}`, 'danger');
  }
});

// Handle Item Actions (Edit / Delete) via event delegation
menuItemsContainer.addEventListener('click', async (e) => {
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');

  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    const item = menuItems.find(i => String(i.id) === String(id));
    if (!confirm(`Are you sure you want to delete "${item ? item.name : 'this item'}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/menu-items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      menuItems = menuItems.filter(i => String(i.id) !== String(id));
      renderMenuItems();
      showAlert('Menu item deleted successfully.', 'info');
    } catch (err) {
      console.error(err);
      showAlert(`Failed to delete item: ${err.message}`, 'danger');
    }
  }

  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    const item = menuItems.find(i => String(i.id) === String(id));
    if (!item) return;

    editItemId.value = item.id;
    editName.value = item.name;
    editPrice.value = item.price;
    editCategory.value = item.category || 'Main Course';
    editDescription.value = item.description || '';
    editModal.show();
  }
});

// Handle Edit Modal form submission (PUT /menu-items/:id)
editItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editItemId.value;
  const name = editName.value.trim();
  const price = parseFloat(editPrice.value);
  const category = editCategory.value;
  const description = editDescription.value.trim();

  if (!name || isNaN(price) || price <= 0) {
    showAlert('Name must not be empty and price must be positive.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/menu-items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, price, category, description }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update item');
    }

    const updated = await res.json();
    const idx = menuItems.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) {
      menuItems[idx] = { ...menuItems[idx], ...updated };
    }
    renderMenuItems();
    editModal.hide();
    showAlert(`"${name}" updated successfully!`, 'success');
  } catch (err) {
    console.error(err);
    showAlert(`Update failed: ${err.message}`, 'danger');
  }
});

// Filter change
restaurantFilterSelect.addEventListener('change', (e) => {
  selectedRestaurantFilter = e.target.value;
  renderMenuItems();
});

// Initial boot
document.addEventListener('DOMContentLoaded', async () => {
  await loadRestaurants();
  await loadMenuItems();
});
