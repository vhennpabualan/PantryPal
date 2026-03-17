// ═══════════════════════════════════════════
// THEME TOGGLE - DARK/LIGHT MODE
// ═══════════════════════════════════════════
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Initialize theme from localStorage or system preference
function initTheme() {
  const savedTheme = localStorage.getItem('pantrypal-theme');
  
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    localStorage.setItem('pantrypal-theme', theme);
  }
  
  updateThemeIcon();
}

// Update theme icon based on current theme
function updateThemeIcon() {
  const currentTheme = html.getAttribute('data-theme');
  themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.title = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

// Toggle theme
themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('pantrypal-theme', newTheme);
  updateThemeIcon();
});

// Initialize theme on page load
initTheme();

// ── SUPABASE ──
const supabaseUrl = 'https://isytoqteubkqzdezskdm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzeXRvcXRldWJrcXpkZXpza2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjgxMjEsImV4cCI6MjA4OTIwNDEyMX0.JZ35u710c6pekokj2eeRVs2mPrXWCjmTR3iS4p8bMj0';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

// ── STATE ──
let currentUser = null;
let savedRecipesCache = [];
let currentView = 'home';
let navigationHistory = [];

// ── CATEGORIES ──
const MEAL_TYPES = [
  { name: 'Beef',          emoji: '🥩', value: 'Beef' },
  { name: 'Breakfast',     emoji: '🍳', value: 'Breakfast' },
  { name: 'Chicken',       emoji: '🍗', value: 'Chicken' },
  { name: 'Dessert',       emoji: '🍰', value: 'Dessert' },
  { name: 'Goat',          emoji: '🐐', value: 'Goat' },
  { name: 'Lamb',          emoji: '🫕', value: 'Lamb' },
  { name: 'Miscellaneous', emoji: '🍱', value: 'Miscellaneous' },
  { name: 'Pasta',         emoji: '🍝', value: 'Pasta' },
  { name: 'Pork',          emoji: '🥓', value: 'Pork' },
  { name: 'Seafood',       emoji: '🦐', value: 'Seafood' },
  { name: 'Side',          emoji: '🥦', value: 'Side' },
  { name: 'Starter',       emoji: '🥟', value: 'Starter' },
  { name: 'Vegan',         emoji: '🌱', value: 'Vegan' },
  { name: 'Vegetarian',    emoji: '🥗', value: 'Vegetarian' }
];

// ── DOM ──
const authOverlay      = document.getElementById('authOverlay');
const authClose        = document.getElementById('authClose');
const openAuthBtn      = document.getElementById('openAuthBtn');
const loginTabBtn      = document.getElementById('loginTabBtn');
const signupTabBtn     = document.getElementById('signupTabBtn');
const loginForm        = document.getElementById('loginForm');
const signupForm       = document.getElementById('signupForm');
const loginBtn         = document.getElementById('loginBtn');
const signupBtn        = document.getElementById('signupBtn');
const logoutBtn        = document.getElementById('logoutBtn');
const authMessage      = document.getElementById('authMessage');
const loggedOutView    = document.getElementById('loggedOutView');
const loggedInView     = document.getElementById('loggedInView');
const userEmailDisplay = document.getElementById('userEmailDisplay');

const topHeader           = document.getElementById('mobileHeader');
const searchInput         = document.getElementById('searchInput');
const searchBtn           = document.getElementById('searchBtn');
const backBtn             = document.getElementById('backBtn');
const backButtonContainer = document.getElementById('backButtonContainer');
const mealsContainer      = document.getElementById('mealsContainer');
const favoritesContainer  = document.getElementById('favoritesContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const categoryResultsContainer = document.getElementById('categoryResultsContainer');
const randomRecipesGrid   = document.getElementById('randomRecipesGrid');
const recipeModal         = document.getElementById('recipeModal');
const modalCloseBtn       = document.getElementById('modalCloseBtn');
const modalBody           = document.getElementById('modalBody');
const headerTitle         = document.getElementById('headerTitle');


// ── MOBILE AUTH BUTTON ──
const mobileAuthBtn = document.getElementById('mobileAuthBtn');
if (mobileAuthBtn) {
  mobileAuthBtn.addEventListener('click', () => {
    if (currentUser) {
      // Show a confirm logout prompt
      if (confirm(`Logged in as ${currentUser.email}\n\nDo you want to log out?`)) {
        db.auth.signOut();
        savedRecipesCache = [];
      }
    } else {
      authOverlay.classList.add('open');
      showAuthMsg('', '');
    }
  });
}

// ── THEMEALDB API ──
async function apiCall(params) {
  try {
    let endpoint = '';
    if (params.type === 'detail') {
      endpoint = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${params.id}`;
    } else if (params.type === 'category') {
      endpoint = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${params.category}`;
    } else if (params.type === 'search') {
      endpoint = `https://www.themealdb.com/api/json/v1/1/search.php?s=${params.query}`;
    } else if (params.type === 'cuisine') {
      endpoint = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${params.cuisine}`;
    } else if (params.type === 'random') {
      endpoint = `https://www.themealdb.com/api/json/v1/1/search.php?s=c`;
    }

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    const meals = data.meals || [];

    if (params.type === 'detail') {
      if (!meals[0]) throw new Error('Recipe details not found');
      return formatMealDBRecipe(meals[0]);
    } else {
      const formattedRecipes = meals.map(formatMealDBRecipe);
      return { recipes: formattedRecipes, results: formattedRecipes };
    }
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

function formatMealDBRecipe(meal) {
  if (!meal) return null;
  let ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim() !== '') {
      ingredients.push({ name: ing, original: `${measure ? measure.trim() : ''} ${ing.trim()}` });
    }
  }
  let stepsList = (meal.strInstructions || 'No instructions provided.')
    .split(/\r?\n/)
    .filter(s => s.trim().length > 2)
    .map(s => ({ step: s.trim() }));

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    readyInMinutes: null,
    servings: null,
    cuisines: meal.strArea ? [meal.strArea] : [],
    healthScore: null,
    sourceUrl: meal.strYoutube || meal.strSource,
    extendedIngredients: ingredients,
    analyzedInstructions: [{ steps: stepsList }]
  };
}

// ── AUTH MODAL ──
openAuthBtn.addEventListener('click', () => { authOverlay.classList.add('open'); showAuthMsg('', ''); });
authClose.addEventListener('click', () => authOverlay.classList.remove('open'));
authOverlay.addEventListener('click', (e) => { if (e.target === authOverlay) authOverlay.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { authOverlay.classList.remove('open'); closeModal(); } });

loginTabBtn.addEventListener('click', () => {
  loginTabBtn.classList.add('active'); signupTabBtn.classList.remove('active');
  loginForm.style.display = 'block'; signupForm.style.display = 'none';
  showAuthMsg('', '');
});
signupTabBtn.addEventListener('click', () => {
  signupTabBtn.classList.add('active'); loginTabBtn.classList.remove('active');
  signupForm.style.display = 'block'; loginForm.style.display = 'none';
  showAuthMsg('', '');
});

function showAuthMsg(text, type) {
  authMessage.textContent = text;
  authMessage.className = `auth-message${type ? ' ' + type : ''}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

// ── LOGIN ──
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showAuthMsg('❌ Please fill in all fields.', 'error'); return; }
  if (!validateEmail(email)) { showAuthMsg('❌ Invalid email address.', 'error'); return; }
  if (password.length < 6)  { showAuthMsg('❌ Password must be at least 6 characters.', 'error'); return; }
  loginBtn.disabled = true; loginBtn.textContent = 'Logging in...';
  const { error } = await db.auth.signInWithPassword({ email, password });
  loginBtn.disabled = false; loginBtn.textContent = 'Log In';
  if (error) { showAuthMsg('❌ ' + error.message, 'error'); }
  else { showAuthMsg('✅ Logged in!', 'success'); setTimeout(() => authOverlay.classList.remove('open'), 800); }
});

// ── SIGNUP ──
signupBtn.addEventListener('click', async () => {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  if (!email || !password || !confirm) { showAuthMsg('❌ Please fill in all fields.', 'error'); return; }
  if (!validateEmail(email)) { showAuthMsg('❌ Invalid email address.', 'error'); return; }
  if (password.length < 6)  { showAuthMsg('❌ Password must be at least 6 characters.', 'error'); return; }
  if (password !== confirm)  { showAuthMsg('❌ Passwords do not match.', 'error'); return; }
  signupBtn.disabled = true; signupBtn.textContent = 'Creating account...';
  const { error } = await db.auth.signUp({ email, password });
  signupBtn.disabled = false; signupBtn.textContent = 'Create Account';
  if (error) { showAuthMsg('❌ ' + error.message, 'error'); }
  else { showAuthMsg('✅ Account created! Check your email to confirm.', 'success'); }
});

// ── LOGOUT ──
logoutBtn.addEventListener('click', async () => { await db.auth.signOut(); savedRecipesCache = []; });

// ── AUTH STATE ──
db.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null;
  if (currentUser) {
    loggedOutView.style.display = 'none';
    loggedInView.style.display = 'block';
    userEmailDisplay.textContent = currentUser.email;
    loadFavoritesFromDB();
  } else {
    loggedOutView.style.display = 'block';
    loggedInView.style.display = 'none';
    savedRecipesCache = [];
  }
  if (mobileAuthBtn) {
    mobileAuthBtn.textContent = currentUser ? '👤' : '🔐';
    mobileAuthBtn.classList.toggle('logged-in', !!currentUser);
  }
});

// ── NAVIGATION ──
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    switchTab(item.getAttribute('data-tab'));
  });
});

function hideAllSections() {
  ['homeSection','searchSection','favoritesSection','categoriesSection','categoryResultsSection']
    .forEach(id => document.getElementById(id).style.display = 'none');
  backButtonContainer.style.display = 'none';
}

function switchTab(tab) {
  if (currentView !== tab) navigationHistory.push(currentView);
  currentView = tab;
  hideAllSections();
  headerTitle.textContent = 'Recipe Browser';

  if (tab === 'home') {
    document.getElementById('homeSection').style.display = 'block';
    loadRandomRecipes();
  } else if (tab === 'search') {
    document.getElementById('searchSection').style.display = 'block';
    mealsContainer.innerHTML = emptyState('🔍', 'Search for a recipe', 'Type something above and hit Search');
    searchInput.focus();
  } else if (tab === 'favorites') {
    document.getElementById('favoritesSection').style.display = 'block';
    headerTitle.textContent = 'My Favorites';
    renderFavorites();
  } else if (tab === 'categories') {
    document.getElementById('categoriesSection').style.display = 'block';
    headerTitle.textContent = 'Categories';
    loadCategoriesGrid();
  }
}

// ── EMPTY STATE HELPER ──
function emptyState(icon, title, text, fullWidth = true) {
  const style = fullWidth ? 'style="grid-column:1/-1"' : '';
  return `<div class="empty-state" ${style}>
    <span class="empty-state-icon">${icon}</span>
    <div class="empty-state-title">${title}</div>
    <div class="empty-state-text">${text}</div>
  </div>`;
}

// ── HOME — RANDOM RECIPES ──
async function loadRandomRecipes() {
  randomRecipesGrid.innerHTML = `<div class="loading" style="grid-column:1/-1">Loading recipes...</div>`;
  try {
    const data = await apiCall({ type: 'random' });
    displayMeals(data.recipes || [], randomRecipesGrid);
  } catch (err) {
    console.error('Random Recipes Error:', err);
    randomRecipesGrid.innerHTML = emptyState('❌', 'Failed to load recipes', err.message || 'Please try again');
  }
}

// ── CATEGORIES GRID ──
function loadCategoriesGrid() {
  categoriesContainer.innerHTML = MEAL_TYPES.map(cat => `
    <div class="category-card" onclick="loadCategoryMeals('${cat.value}', '${cat.name}')">
      <span class="category-emoji">${cat.emoji}</span>
      <div class="category-name">${cat.name}</div>
    </div>
  `).join('');
}

async function loadCategoryMeals(category, name) {
  navigationHistory.push(currentView);
  hideAllSections();
  backButtonContainer.style.display = 'block';
  document.getElementById('categoryResultsSection').style.display = 'block';
  headerTitle.textContent = name + ' Recipes';
  categoryResultsContainer.innerHTML = `<div class="loading" style="grid-column:1/-1">Loading...</div>`;
  
  try {
    const data = await apiCall({ type: 'category', category });
    displayMeals(data.results || [], categoryResultsContainer);
  } catch (err) {
    console.error('Category Load Error:', err);
    categoryResultsContainer.innerHTML = emptyState('❌', 'Failed to load recipes', err.message || 'Please try again');
  }
}

// ── FLOATING SEARCH ──
const floatingSearchIcon = document.getElementById('floatingSearchIcon');
const floatingSearchPanel = document.getElementById('floatingSearchPanel');
const floatingSearchContainer = document.getElementById('floatingSearchContainer');

floatingSearchIcon.addEventListener('click', () => {
  floatingSearchPanel.classList.toggle('active');
  if (floatingSearchPanel.classList.contains('active')) {
    searchInput.focus();
  }
});

// Close search panel when clicking outside
document.addEventListener('click', (e) => {
  if (!floatingSearchContainer.contains(e.target)) {
    floatingSearchPanel.classList.remove('active');
  }
});

// Close search panel on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    floatingSearchPanel.classList.remove('active');
  }
});

// ── UNIVERSAL SEARCH ──
searchBtn.addEventListener('click', searchMeals);
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchMeals(); });

async function searchMeals() {
  const query = searchInput.value.trim();
  if (!query) {
    showAuthMsg('⚠️ Please enter a search term', 'error');
    return;
  }
  
  floatingSearchPanel.classList.remove('active');
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  switchTab('search');
  backButtonContainer.style.display = 'block';
  mealsContainer.innerHTML = `<div class="loading" style="grid-column:1/-1">Searching...</div>`;
  headerTitle.textContent = `Results for "${query}"`;
  
  try {
    const data = await apiCall({ type: 'search', query });
    if (data.results && data.results.length > 0) {
      displayMeals(data.results, mealsContainer);
    } else {
      mealsContainer.innerHTML = emptyState('🔍', 'No results found', `We couldn't find anything for "${query}"`);
    }
  } catch (err) {
    console.error('Search Error:', err);
    mealsContainer.innerHTML = emptyState('❌', 'Search failed', err.message || 'Please try again');
  }
}

// ── DISPLAY MEALS ──
function displayMeals(meals, container) {
  if (!meals || meals.length === 0) {
    container.innerHTML = emptyState('😅', 'No recipes found', 'Try a different search or category');
    return;
  }
  container.innerHTML = meals.map(meal => `
    <div class="meal-card" onclick="viewRecipe(${meal.id})">
      <div class="meal-image-wrapper">
        <img src="${meal.image || ''}" alt="${meal.title}" class="meal-image"
             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <button class="floating-fav-btn ${isSaved(meal.id) ? 'active' : ''}"
          onclick="event.stopPropagation(); toggleFavorite(${meal.id}, '${(meal.title||'').replace(/'/g,"\\'")}', '${meal.image||''}', this)">
          ${isSaved(meal.id) ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="meal-info">
        <div class="meal-title">${meal.title}</div>
        <div class="meal-actions">
          <button class="meal-btn meal-btn-view">View Recipe</button>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── RECIPE DETAIL MODAL ──
async function viewRecipe(id) {
  recipeModal.classList.add('active');
  modalBody.innerHTML = `<div class="loading" style="padding: 4rem;">Loading recipe...</div>`;
  document.body.style.overflow = 'hidden';

  try {
    const recipe = await apiCall({ type: 'detail', id });

    const ingredients = (recipe.extendedIngredients || []).map(ing => `
      <div class="ingredient-item">
        <div class="ingredient-name">✓ ${ing.name}</div>
        <div class="ingredient-measure">${ing.original}</div>
      </div>
    `).join('');

    const instructions = recipe.analyzedInstructions?.[0]?.steps?.map((step, i) => `
      <div class="instruction-step">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${step.step}</div>
      </div>
    `).join('') || '<p style="color:var(--text-tertiary); padding: 20px;">No instructions available.</p>';

    const metaChips = [
      recipe.readyInMinutes ? `<div class="recipe-meta-chip"><span>⏱️</span> ${recipe.readyInMinutes}m</div>` : '',
      recipe.cuisines?.length ? `<div class="recipe-meta-chip"><span>🌍</span> ${recipe.cuisines[0]}</div>` : '',
    ].filter(Boolean).join('');

    modalBody.innerHTML = `
      <div class="recipe-hero">
        <img src="${recipe.image || ''}" alt="${recipe.title}" class="recipe-hero-img"
             onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
        <div class="recipe-hero-overlay"></div>
        <div class="recipe-hero-title">${recipe.title}</div>
      </div>

      <div class="recipe-body">
        <div style="display: flex; gap: 10px; margin-bottom: 20px; align-items: center;">
            <div class="recipe-meta-bar" style="border: none; margin: 0; padding: 0; flex: 1;">
                ${metaChips}
            </div>
            ${recipe.sourceUrl ? `<a href="${recipe.sourceUrl}" target="_blank" class="recipe-source-link">Watch Tutorial ↗</a>` : ''}
        </div>

        <button class="recipe-fav-btn ${isSaved(recipe.id) ? 'active' : ''}" id="modalFavBtn"
          onclick="toggleFavorite(${recipe.id}, '${recipe.title.replace(/'/g,"\\'")}', '${recipe.image||''}', this)">
          ${isSaved(recipe.id) ? '❤️ Saved to Favorites' : '🤍 Save to Favorites'}
        </button>

        <div class="recipe-section">
          <h2 class="recipe-section-title">📋 Ingredients</h2>
          <div class="ingredients-list">${ingredients}</div>
        </div>

        <div class="recipe-section">
          <h2 class="recipe-section-title">👨‍🍳 Instructions</h2>
          <div class="instructions-container">
            ${instructions}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Recipe Load Error:', err);
    modalBody.innerHTML = `<div class="empty-state"><span class="empty-state-icon">❌</span><div class="empty-state-text">${err.message || 'Failed to load recipe'}</div></div>`;
  }
}

modalCloseBtn.addEventListener('click', closeModal);
recipeModal.addEventListener('click', (e) => { if (e.target === recipeModal) closeModal(); });

function closeModal() {
  recipeModal.classList.remove('active');
  modalBody.innerHTML = '';
  document.body.style.overflow = 'auto';
}

// ── BACK BUTTON ──
backBtn.addEventListener('click', () => {
  const previous = navigationHistory.pop();
  hideAllSections();
  backButtonContainer.style.display = 'none';
  headerTitle.textContent = 'Recipe Browser';
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

  if (!previous || previous === 'home') {
    document.getElementById('homeSection').style.display = 'block';
    document.querySelector('[data-tab="home"]').classList.add('active');
    loadRandomRecipes();
  } else if (previous === 'categories') {
    document.getElementById('categoriesSection').style.display = 'block';
    document.querySelector('[data-tab="categories"]').classList.add('active');
    headerTitle.textContent = 'Categories';
    loadCategoriesGrid();
  } else if (previous === 'favorites') {
    document.getElementById('favoritesSection').style.display = 'block';
    document.querySelector('[data-tab="favorites"]').classList.add('active');
    headerTitle.textContent = 'My Favorites';
    renderFavorites();
  } else if (previous === 'search') {
    document.getElementById('searchSection').style.display = 'block';
    backButtonContainer.style.display = 'block';
  }

  if (navigationHistory.length === 0) backButtonContainer.style.display = 'none';
});

// ── FAVORITES — CRUD ──
function isSaved(recipeId) {
  return savedRecipesCache.some(r => r.recipe_id == recipeId);
}

async function toggleFavorite(recipeId, title, imageUrl, btn) {
  if (!currentUser) {
    authOverlay.classList.add('open');
    showAuthMsg('⚠️ Please log in to save recipes.', 'error');
    return;
  }
  
  try {
    if (isSaved(recipeId)) {
      const { error } = await db.from('saved_recipes').delete().match({ user_id: currentUser.id, recipe_id: recipeId });
      if (error) throw error;
      
      savedRecipesCache = savedRecipesCache.filter(r => r.recipe_id != recipeId);
      if (btn) { 
        btn.classList.remove('active'); 
        btn.textContent = btn.textContent.includes('Saved') ? '🤍 Save to Favorites' : '🤍'; 
      }
    } else {
      const { data, error } = await db.from('saved_recipes')
        .insert([{ user_id: currentUser.id, recipe_id: recipeId, title, image_url: imageUrl }]).select();
      if (error) throw error;
      
      if (data) {
        savedRecipesCache.push(data[0]);
        if (btn) { 
          btn.classList.add('active'); 
          btn.textContent = btn.textContent.includes('Save') ? '❤️ Saved to Favorites' : '❤️'; 
        }
      }
    }
    if (currentView === 'favorites') renderFavorites();
  } catch (error) {
    console.error('Favorite Toggle Error:', error);
    showAuthMsg('❌ Failed to update favorite', 'error');
  }
}

async function loadFavoritesFromDB() {
  if (!currentUser) return;
  const { data, error } = await db.from('saved_recipes').select('*').eq('user_id', currentUser.id);
  if (!error) savedRecipesCache = data || [];
}

function renderFavorites() {
  if (!currentUser) {
    favoritesContainer.innerHTML = emptyState('🔐', 'Not logged in', 'Please log in to see your saved recipes.');
    return;
  }
  if (savedRecipesCache.length === 0) {
    favoritesContainer.innerHTML = emptyState('❤️', 'No favorites yet', 'Browse recipes and tap ❤️ to save them here.');
    return;
  }
  const mapped = savedRecipesCache.map(r => ({ id: r.recipe_id, title: r.title, image: r.image_url }));
  displayMeals(mapped, favoritesContainer);
}

// ── CUISINE DROPDOWN LOGIC ──
const cuisineDropdown = document.getElementById('cuisineDropdown');
const cuisineSelected = document.getElementById('cuisineSelected');
const cuisineOptions  = document.getElementById('cuisineOptions');

const CUISINE_FLAGS = {
  "American": "us", "British": "gb", "Canadian": "ca",
  "Chinese": "cn", "Croatian": "hr", "Dutch": "nl",
  "Egyptian": "eg", "Filipino": "ph", "French": "fr",
  "Greek": "gr", "Indian": "in", "Irish": "ie",
  "Italian": "it", "Jamaican": "jm", "Japanese": "jp",
  "Kenyan": "ke", "Malaysian": "my", "Mexican": "mx",
  "Moroccan": "ma", "Polish": "pl", "Portuguese": "pt",
  "Russian": "ru", "Spanish": "es", "Thai": "th",
  "Tunisian": "tn", "Turkish": "tr", "Vietnamese": "vn"
};

function flagImg(code) {
  return `<img src="https://flagcdn.com/20x15/${code}.png" width="20" height="15" style="border-radius:2px;vertical-align:middle;" alt="${code}">`;
}

if (cuisineDropdown && cuisineSelected && cuisineOptions) {
  cuisineOptions.innerHTML = Object.keys(CUISINE_FLAGS).map(cuisine => `
    <div class="cuisine-option" data-value="${cuisine}">
      ${flagImg(CUISINE_FLAGS[cuisine])} ${cuisine}
    </div>
  `).join('');

  cuisineSelected.addEventListener('click', () => cuisineDropdown.classList.toggle('open'));

  document.addEventListener('click', (e) => {
    if (!cuisineDropdown.contains(e.target)) cuisineDropdown.classList.remove('open');
  });

  cuisineOptions.addEventListener('click', async (e) => {
    const option = e.target.closest('.cuisine-option');
    if (!option) return;
    const cuisine = option.dataset.value;
    const code = CUISINE_FLAGS[cuisine];
    navigationHistory.push(currentView);

    cuisineDropdown.classList.remove('open');
    cuisineSelected.innerHTML = `${flagImg(code)}<span style="flex:1;">${cuisine}</span><span class="cuisine-arrow">▾</span>`;

    hideAllSections();
    backButtonContainer.style.display = 'block';
    document.getElementById('categoryResultsSection').style.display = 'block';
    headerTitle.innerHTML = `${flagImg(code)} ${cuisine} Cuisine`;
    categoryResultsContainer.innerHTML = `<div class="loading" style="grid-column:1/-1">Loading recipes...</div>`;

    try {
      const data = await apiCall({ type: 'cuisine', cuisine });
      displayMeals(data.results || [], categoryResultsContainer);
    } catch (err) {
      console.error('Cuisine Load Error:', err);
      categoryResultsContainer.innerHTML = emptyState('❌', 'Failed to load recipes', err.message || 'Please try again');
    }
  });
}

// ── MOBILE HEADER SCROLL LOGIC ──
const contentArea = document.querySelector('.content');
let lastScrollY = contentArea.scrollTop;

contentArea.addEventListener('scroll', () => {
  if (!topHeader) return;
  if (window.innerWidth <= 768) {
    topHeader.classList.toggle('hidden', contentArea.scrollTop > lastScrollY && contentArea.scrollTop > 50);
  } else {
    topHeader.classList.remove('hidden');
  }
  lastScrollY = contentArea.scrollTop;
});

// ── INIT ──
switchTab('home');