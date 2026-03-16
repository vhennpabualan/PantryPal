# 🍳 PantryPal - Recipe Finder Website

A beautiful, mobile-friendly recipe discovery website powered by **The MealDB API**. Find recipes by ingredients, browse categories, and save your favorite recipes!

## 🌟 Features

- **Search by Ingredient**: Find recipes using any ingredient (e.g., chicken, tomato, rice)
- **Browse Categories**: Explore recipes organized by culinary categories
- **Save Favorites**: Store your favorite recipes using browser local storage
- **View Recipes**: See detailed recipe instructions, ingredients, and measurements
- **YouTube Links**: Watch video tutorials for select recipes
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **No Backend Required**: Uses browser's local storage for favorites

## 📱 Mobile Responsive

The website is fully optimized for:
- ✅ Desktop (1200px and above)
- ✅ Tablet (768px to 1199px)
- ✅ Mobile (480px to 767px)
- ✅ Small Mobile (below 480px)

## 🚀 Getting Started

### Installation

1. Download or clone this repository
2. No installation required! Just open `index.html` in your web browser
3. Alternatively, serve with a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## 📖 How to Use

### Search by Ingredient
1. Click on the **Search** tab
2. Enter an ingredient (e.g., "chicken", "pasta", "garlic")
3. Click **Search Recipes** or press Enter
4. Browse the resulting recipes

### Browse by Category
1. Click on the **Categories** tab
2. Click on any category to see recipes
3. Explore recipes from different cuisines

### Save Favorites
1. On any recipe card, click the heart button (🤍) to save
2. Your favorites are automatically saved to your browser
3. Click on **Favorites** tab to see all your saved recipes

### View Recipe Details
1. Click **View** button on any recipe card
2. See complete ingredients list with measurements
3. Read step-by-step instructions
4. Watch video tutorial if available
5. Save/unsave the recipe from the detail view

## 💾 Local Storage

Your favorite recipes are stored in your browser's **Local Storage**:
- Up to ~5-10MB of storage (depending on browser)
- Favorites persist even after closing the browser
- Clear browser data to reset favorites
- Uses no external database or server

## 🎨 Customization

### Change Colors
Edit the gradient colors in `style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Responsive Breakpoints
Modify the media queries at the bottom of `style.css`:
```css
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

## 🔗 API Reference

This app uses **The MealDB API** (free, no authentication required):
- **Base URL**: `https://www.themealdb.com/api/json/v1/1`
- **Search by ingredient**: `/filter.php?i={ingredient}`
- **Search by category**: `/filter.php?c={category}`
- **Get categories**: `/categories.php`
- **Meal details**: `/lookup.php?i={mealId}`

Learn more at: [themealdb.com](https://www.themealdb.com)

## ⚙️ Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Responsive design with flexbox and CSS Grid
- **JavaScript (Vanilla)** - No framework dependencies
- **The MealDB API** - Recipe data source

## 🐛 Troubleshooting

### Recipes not loading?
- Check your internet connection
- The MealDB API might be temporarily unavailable
- Try searching with a different ingredient

### Favorites not saving?
- Make sure browser's local storage is enabled
- Check if you have enough local storage space
- Try clearing browser cache and try again

### Mobile view looks wrong?
- Make sure to include the viewport meta tag (already included)
- Try refreshing the page
- Check browser zoom level (should be 100%)

## 📝 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Improve the design
- Optimize the code

## 📄 License

This project uses The MealDB API which is free to use. Feel free to use and modify this project for personal and educational purposes.

## 🙏 Credits

- Recipe data provided by [The MealDB](https://www.themealdb.com)
- Icons: Emoji
- UI Inspiration: Modern web design best practices

---

**Enjoy exploring recipes with PantryPal! 🍴**
