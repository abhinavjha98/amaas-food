# New Features Added

## 1. Admin Dish Management

Admins now have full control over dishes:

### Admin Dish Routes:
- `GET /api/admin/dishes` - List all dishes (includes unavailable ones)
- `PUT /api/admin/dishes/<id>` - Edit any dish
- `DELETE /api/admin/dishes/<id>` - Delete any dish
- `POST /api/admin/dishes/<id>/approve` - Approve/make dish available
- `POST /api/admin/dishes/<id>/disable` - Disable/make dish unavailable

### Features:
- ✅ Admins can view all dishes (including unavailable ones)
- ✅ Admins can edit any dish (name, price, description, availability, etc.)
- ✅ Admins can delete any dish
- ✅ Admins can approve/disable dishes
- ✅ Producers can still manage their own dishes
- ✅ Existing producer routes still work (they can only manage their own)

## 2. Enhanced Customer Registration with Preference Questions

Customer registration now includes comprehensive preference questions for better AI recommendations:

### Preference Questions Added:
1. **Dietary Preference** (Required)
   - Options: Vegetarian, Non-Vegetarian, Vegan
   - Default: Non-Vegetarian

2. **Preferred Spice Level** (Required)
   - Options: Mild, Medium, Hot
   - Default: Medium

3. **Preferred Cuisines** (Optional - Multiple selection)
   - North Indian, South Indian, Bengali, Gujarati
   - Maharashtrian, Punjabi, Rajasthani, Kerala

4. **Budget Preference** (Optional)
   - Low: ₹0-150 per meal
   - Medium: ₹150-300 per meal
   - High: ₹300+ per meal
   - Default: Medium

5. **Preferred Meal Times** (Optional - Multiple selection)
   - Breakfast, Lunch, Dinner, Snacks

6. **Allergens** (Optional - Multiple selection)
   - Nuts, Dairy, Soy, Seafood, Eggs, Gluten, Sesame

### Database Schema Updates:
- Added `budget_preference` field to User model
- Added `meal_preferences` field to User model (JSON array)
- Enhanced preference parsing methods in User model

## 3. Enhanced AI Recommendation System

The recommendation engine now uses all customer preferences:

### Enhanced Scoring Algorithm:
- **Dietary Preference Match**: +15 points
- **Spice Level Match**: +10 points
- **Preferred Cuisine Match**: +20 points
- **Meal Preference Match**: +15 points (matches dish category with meal preferences)
- **Budget Preference Match**: +20 points
  - Low budget: Prefers dishes ≤ ₹150
  - Medium budget: Prefers dishes ₹150-300
  - High budget: Prefers dishes > ₹300
  - Penalties for mismatches (-30 for expensive when low budget)
- **Allergen Avoidance**: -50 points penalty if allergen present
- **Past Behavior**: 
  - +20 if ordered from same producer before
  - +50 if liked similar dish before (rating ≥ 4)
  - +10 for diversity (never ordered this dish)
- **Popularity**: Based on ratings, order count, view count

### Recommendation Flow:
1. User registers with preferences
2. Preferences are stored in database
3. When user requests recommendations:
   - System filters dishes by dietary preference and spice level
   - Scores dishes based on all preferences
   - Returns top N personalized recommendations

## API Changes

### Registration Endpoint (`POST /api/auth/register`)
Now accepts additional fields for customers:
```json
{
  "name": "John Customer",
  "email": "john@test.com",
  "password": "password123",
  "role": "customer",
  "dietary_preferences": "non-veg",
  "spice_level": "medium",
  "preferred_cuisines": ["North Indian", "South Indian"],
  "budget_preference": "medium",
  "meal_preferences": ["Lunch", "Dinner"],
  "allergens": ["Nuts", "Dairy"]
}
```

### New Admin Dish Endpoints:
- `GET /api/admin/dishes?status=all&producer_id=1`
- `PUT /api/admin/dishes/1`
- `DELETE /api/admin/dishes/1`
- `POST /api/admin/dishes/1/approve`
- `POST /api/admin/dishes/1/disable`

## Frontend Updates

### Registration Page:
- Enhanced form for customer registration with:
  - Dropdown for dietary preferences and spice level
  - Checkboxes for cuisines, meal preferences, and allergens
  - Budget preference dropdown
  - Clear labels and instructions

### Admin Dashboard:
- Can now manage dishes (edit, delete, approve, disable)
- View all dishes including unavailable ones
- Filter by producer, status

## Testing

To test these features:

1. **Admin Dish Management:**
   ```bash
   # Login as admin
   POST /api/auth/login
   {
     "email": "admin@currypot.com",
     "password": "admin123"
   }
   
   # List all dishes
   GET /api/admin/dishes
   
   # Edit a dish
   PUT /api/admin/dishes/1
   {
     "name": "Updated Name",
     "price": 250
   }
   
   # Delete a dish
   DELETE /api/admin/dishes/1
   
   # Approve/disable dish
   POST /api/admin/dishes/1/approve
   POST /api/admin/dishes/1/disable
   ```

2. **Customer Registration with Preferences:**
   ```bash
   # Register with preferences
   POST /api/auth/register
   {
     "name": "New Customer",
     "email": "new@test.com",
     "password": "password123",
     "role": "customer",
     "dietary_preferences": "veg",
     "spice_level": "mild",
     "preferred_cuisines": ["South Indian", "Gujarati"],
     "budget_preference": "low",
     "meal_preferences": ["Breakfast", "Lunch"],
     "allergens": ["Nuts"]
   }
   ```

3. **Get Recommendations:**
   ```bash
   # Get personalized recommendations
   GET /api/ai/recommendations?limit=10&lat=19.0760&lon=72.8777
   # Returns dishes matching user preferences
   ```

## Database Migration

If you have an existing database, you may need to add the new columns:
- `budget_preference VARCHAR(20)`
- `meal_preferences TEXT` (JSON array)

Or simply delete the database and recreate it (data will be lost):
```bash
cd backend
rm data/currypot.db
python run.py  # This will recreate the database with new schema
python create_sample_data.py  # Recreate sample data
```



