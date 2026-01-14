# Curry Pot - Login Credentials

## Default Admin Account

The admin account is automatically created when you first run the backend:

- **Email:** `admin@currypot.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Admin dashboard, manage producers, view reports

## Sample Test Accounts

After running `create_sample_data.bat`, you'll have these test accounts:

### Customer Account

- **Email:** `customer@test.com`
- **Password:** `customer123`
- **Role:** Customer
- **Name:** John Customer
- **Preferences:** Non-vegetarian, Medium spice, North Indian & South Indian

### Chef 1 - North Indian

- **Email:** `chef@test.com`
- **Password:** `chef123`
- **Role:** Producer (Chef)
- **Kitchen Name:** Ravi's Home Kitchen
- **Cuisine:** North Indian
- **Dishes:** 6 dishes including Butter Chicken, Biryani, Dal Makhani, etc.

### Chef 2 - South Indian

- **Email:** `chef2@test.com`
- **Password:** `chef123`
- **Role:** Producer (Chef)
- **Kitchen Name:** Priya's South Indian Delights
- **Cuisine:** South Indian
- **Dishes:** 7 dishes including Dosa, Idli, Sambar Rice, etc.

## Creating Sample Data

To create these accounts and dishes, run:

```bash
create_sample_data.bat
```

Or manually:

```bash
cd backend
venv\Scripts\activate
python create_sample_data.py
```

## Dishes Created

### North Indian Kitchen (Ravi's Home Kitchen) - 6 Dishes
1. Butter Chicken - ₹280 (Non-veg, Medium)
2. Dal Makhani - ₹180 (Veg, Mild)
3. Paneer Tikka Masala - ₹220 (Veg, Medium)
4. Biryani (Chicken) - ₹320 (Non-veg, Hot)
5. Chole Bhature - ₹160 (Veg, Medium)
6. Palak Paneer - ₹200 (Veg, Mild)

### South Indian Kitchen (Priya's South Indian Delights) - 7 Dishes
1. Dosa with Sambar - ₹120 (Veg, Mild)
2. Idli with Chutney - ₹100 (Veg, Mild)
3. Pongal - ₹90 (Veg, Mild)
4. Sambar Rice - ₹130 (Veg, Medium)
5. Rasam Rice - ₹110 (Veg, Medium)
6. Vegetable Biryani - ₹250 (Veg, Medium)
7. Coconut Rice - ₹140 (Veg, Mild)

**Total: 13 dishes available for testing!**

## Testing Different Roles

### As Admin:
1. Login with `admin@currypot.com` / `admin123`
2. Access admin dashboard at `/admin/dashboard`
3. Approve/manage producers
4. View reports and analytics

### As Customer:
1. Login with `customer@test.com` / `customer123`
2. Browse dishes at `/catalog`
3. Add items to cart
4. Place orders (with demo Stripe payment)

### As Chef/Producer:
1. Login with `chef@test.com` or `chef2@test.com` / `chef123`
2. Access producer dashboard at `/producer/dashboard`
3. Manage dishes (view/edit existing ones)
4. Accept/manage orders

## Notes

- All accounts are pre-activated and ready to use
- Chef accounts are already approved (no need for admin approval)
- All dishes are set to available
- Prices are in Indian Rupees (₹)
- Test data can be recreated by running the script again (it checks for existing data)



