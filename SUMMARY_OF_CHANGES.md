# Summary of Changes - Admin Rights & Customer Preferences

## ✅ Completed Features

### 1. Admin Dish Management Rights

Admins can now fully manage all dishes in the system:

#### New Admin Endpoints:
- **`GET /api/admin/dishes`** - List all dishes (includes unavailable)
  - Query params: `status` (available/unavailable/all), `producer_id`, `page`, `per_page`
  
- **`PUT /api/admin/dishes/<dish_id>`** - Edit any dish
  - Admin can update: name, description, price, category, dietary_type, spice_level, allergens, ingredients, availability, max_orders_per_day, display_order
  
- **`DELETE /api/admin/dishes/<dish_id>`** - Delete any dish
  - Admin can delete any dish regardless of producer
  
- **`POST /api/admin/dishes/<dish_id>/approve`** - Approve/make dish available
  - Makes dish visible and available for ordering
  
- **`POST /api/admin/dishes/<dish_id>/disable`** - Disable/make dish unavailable
  - Hides dish from customers

#### Updated Producer Endpoints:
- Producers can still edit/delete their own dishes
- Producers can only manage dishes they created
- Admins can now manage all dishes in addition to their original rights

### 2. Enhanced Customer Registration with Preference Questions

Customer registration now includes comprehensive preference questions that are used for AI recommendations:

#### New Preference Fields:
1. **Dietary Preferences** (Required)
   - Options: `veg`, `non-veg`, `vegan`
   - Default: `non-veg`

2. **Spice Level** (Required)
   - Options: `mild`, `medium`, `hot`
   - Default: `medium`

3. **Preferred Cuisines** (Optional - Multiple selection)
   - Array of cuisines: North Indian, South Indian, Bengali, Gujarati, Maharashtrian, Punjabi, Rajasthani, Kerala
   - Stored as JSON array in database

4. **Budget Preference** (Optional)
   - Options: `low` (₹0-150), `medium` (₹150-300), `high` (₹300+)
   - Default: `medium`

5. **Meal Preferences** (Optional - Multiple selection)
   - Array of meal times: Breakfast, Lunch, Dinner, Snacks
   - Stored as JSON array in database

6. **Allergens** (Optional - Multiple selection)
   - Array of allergens: Nuts, Dairy, Soy, Seafood, Eggs, Gluten, Sesame
   - Stored as JSON array in database

#### Frontend Registration Form:
- Enhanced UI with checkboxes for multiple selections
- Dropdowns for single selections
- Clear labels and instructions
- Only shown for customer role registration

### 3. Enhanced AI Recommendation System

The recommendation engine now uses all customer preferences for better personalization:

#### Enhanced Scoring Algorithm:
- **Dietary Preference Match**: +15 points
- **Spice Level Match**: +10 points  
- **Preferred Cuisine Match**: +20 points per match
- **Meal Preference Match**: +15 points (matches dish category)
- **Budget Preference Match**: +20 points
  - Low budget: Prefers dishes ≤ ₹150
  - Medium budget: Prefers dishes ₹150-300
  - High budget: Prefers dishes > ₹300
  - Penalties: -30 for expensive when low budget, -10 for cheap when high budget
- **Allergen Avoidance**: -50 points penalty if allergen present
- **Past Behavior**:
  - +20 if ordered from same producer before
  - +50 if liked similar dish (rating ≥ 4)
  - +10 for diversity (never ordered this dish)
- **Base Popularity**: Rating (×10) + Order count (×0.1) + View count

#### Recommendation Flow:
1. User registers with preferences → Stored in database
2. User requests recommendations → System retrieves preferences
3. Dishes are filtered and scored based on all preferences
4. Top N personalized recommendations are returned

## Database Schema Changes

### User Model - New Fields:
- `budget_preference` (String, 20 chars) - low, medium, high
- `meal_preferences` (Text, JSON array) - breakfast, lunch, dinner, snacks

### User Model - New Methods:
- `get_preferred_cuisines_list()` - Returns list of preferred cuisines
- `get_meal_preferences_list()` - Returns list of meal preferences
- `get_allergens_list()` - Returns list of allergens (updated)

### User Model - Updated Methods:
- `to_dict()` - Now includes all new preference fields

## API Changes

### Registration Endpoint
**`POST /api/auth/register`**

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

### New Admin Dish Endpoints
See `FEATURES_ADDED.md` for complete endpoint documentation.

## Frontend Changes

### Registration Page (`frontend/src/pages/RegisterPage.jsx`)
- Added preference form section for customers
- Checkbox groups for multiple selections
- Dropdowns for single selections
- Better form validation and UX

### Admin Dashboard (To be implemented in UI)
- Admin can manage dishes through API
- Admin can approve/disable dishes
- Admin can edit/delete any dish

## Testing Instructions

### 1. Test Admin Dish Management:
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@currypot.com","password":"admin123"}'

# List all dishes
curl -X GET http://localhost:5000/api/admin/dishes \
  -H "Authorization: Bearer <admin_token>"

# Edit a dish
curl -X PUT http://localhost:5000/api/admin/dishes/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","price":250}'

# Delete a dish
curl -X DELETE http://localhost:5000/api/admin/dishes/1 \
  -H "Authorization: Bearer <admin_token>"

# Approve a dish
curl -X POST http://localhost:5000/api/admin/dishes/1/approve \
  -H "Authorization: Bearer <admin_token>"

# Disable a dish
curl -X POST http://localhost:5000/api/admin/dishes/1/disable \
  -H "Authorization: Bearer <admin_token>"
```

### 2. Test Customer Registration with Preferences:
```bash
# Register customer with preferences
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "test@customer.com",
    "password": "password123",
    "role": "customer",
    "dietary_preferences": "veg",
    "spice_level": "mild",
    "preferred_cuisines": ["South Indian", "Gujarati"],
    "budget_preference": "low",
    "meal_preferences": ["Breakfast", "Lunch"],
    "allergens": ["Nuts", "Dairy"]
  }'
```

### 3. Test Recommendations:
```bash
# Get personalized recommendations
curl -X GET "http://localhost:5000/api/ai/recommendations?limit=10&lat=19.0760&lon=72.8777" \
  -H "Authorization: Bearer <customer_token>"
```

## Migration Steps

If you have an existing database, you may need to:

1. **Delete and recreate database** (recommended for development):
   ```bash
   cd backend
   rm data/currypot.db
   python run.py  # Recreates database
   python create_sample_data.py  # Creates sample data
   ```

2. **Or add new columns manually** (for production):
   ```sql
   ALTER TABLE users ADD COLUMN budget_preference VARCHAR(20);
   ALTER TABLE users ADD COLUMN meal_preferences TEXT;
   ```

## Next Steps

1. **Implement Admin Dashboard UI** - Create admin interface for dish management
2. **Enhance Recommendation UI** - Show recommendations on homepage/catalog
3. **Add Preference Update** - Allow customers to update preferences after registration
4. **Add Analytics** - Track recommendation effectiveness
5. **Phase 2 ML** - Move from rule-based to ML-based recommendations

## Files Modified

### Backend:
- `backend/app/routes/admin.py` - Added dish management routes
- `backend/app/routes/auth.py` - Enhanced registration with preferences
- `backend/app/routes/dishes.py` - Updated to allow admin access
- `backend/app/routes/ai.py` - Enhanced recommendation engine
- `backend/app/models/user.py` - Added new fields and methods

### Frontend:
- `frontend/src/pages/RegisterPage.jsx` - Added preference questions UI

## Notes

- All existing functionality remains intact
- Producers can still manage their own dishes
- Admin rights are additive (they can also manage dishes)
- Customer preferences are optional during registration (except dietary and spice level)
- Recommendations improve as users interact more with the platform
- Budget preferences have penalty system to avoid mismatches



