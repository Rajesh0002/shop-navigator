-- ============================================================
-- SHOP NAVIGATOR - SEED DATA
-- ============================================================
-- Run: mysql -u root -p'Root@123' shop_navigator < seed.sql
-- ============================================================

USE shop_navigator;

-- ============================================================
-- 0. CREATE WORKERS TABLE IF NOT EXISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    admin_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ============================================================
-- 1. CLEAR EXISTING DATA (in order due to foreign keys)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE api_logs;
TRUNCATE TABLE offers;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE zones;
TRUNCATE TABLE workers;
TRUNCATE TABLE shops;
TRUNCATE TABLE admins;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 2. ADMIN USERS
-- ============================================================
-- Password for all: admin123 (bcrypt hashed)
INSERT INTO admins (id, name, email, password, phone) VALUES
(1, 'Rajesh Kumar',    'admin@shop.com',       '$2a$10$7gVgeBWRAX9Mx2tDVhfyKOD8TQwJEZi7YBtOakr7aoX5fYhqUwsTC', '9876543210'),
(2, 'Priya Sharma',    'priya@textilehub.com', '$2a$10$7gVgeBWRAX9Mx2tDVhfyKOD8TQwJEZi7YBtOakr7aoX5fYhqUwsTC', '9876543211'),
(3, 'Mohammed Ali',    'ali@megamart.com',     '$2a$10$7gVgeBWRAX9Mx2tDVhfyKOD8TQwJEZi7YBtOakr7aoX5fYhqUwsTC', '9876543212');

-- ============================================================
-- 3. SHOPS (Multi-tenant: Admin 1 has 2 shops)
-- ============================================================
INSERT INTO shops (id, admin_id, name, type, address, logo, api_key) VALUES
(1, 1, 'Super Fresh Market',     'supermarket', '12, MG Road, Bangalore - 560001',       NULL, 'snk_supermarket_api_key_001'),
(2, 1, 'Fresh Mart Express',     'supermarket', '45, Anna Nagar, Chennai - 600040',      NULL, 'snk_supermarket_api_key_002'),
(3, 2, 'Fashion Hub Textiles',   'textile',     '78, Commercial Street, Bangalore',      NULL, 'snk_textile_api_key_001'),
(4, 3, 'Mega Electronics World', 'electronics', '23, SP Road, Bangalore - 560002',       NULL, 'snk_electronics_api_key_001');

-- ============================================================
-- 4. CATEGORIES
-- ============================================================

-- Shop 1: Super Fresh Market (Supermarket)
INSERT INTO categories (id, shop_id, name, icon, color, sort_order) VALUES
(1,  1, 'Fruits & Vegetables', '🥬', '#4caf50', 1),
(2,  1, 'Dairy & Eggs',        '🧀', '#2196f3', 2),
(3,  1, 'Grains & Staples',    '🌾', '#ff9800', 3),
(4,  1, 'Snacks & Bakery',     '🍪', '#e91e63', 4),
(5,  1, 'Beverages',           '🥤', '#9c27b0', 5),
(6,  1, 'Meat & Seafood',      '🍖', '#f44336', 6),
(7,  1, 'Household Items',     '🧹', '#607d8b', 7),
(8,  1, 'Personal Care',       '🧴', '#00bcd4', 8),
(9,  1, 'Spices & Masala',     '🌶️', '#ff5722', 9),
(10, 1, 'Frozen Foods',        '🧊', '#3f51b5', 10);

-- Shop 2: Fresh Mart Express (Supermarket)
INSERT INTO categories (id, shop_id, name, icon, color, sort_order) VALUES
(11, 2, 'Fruits & Vegetables', '🥬', '#4caf50', 1),
(12, 2, 'Dairy Products',      '🥛', '#2196f3', 2),
(13, 2, 'Groceries',           '🛒', '#ff9800', 3),
(14, 2, 'Snacks',              '🍿', '#e91e63', 4),
(15, 2, 'Beverages',           '🥤', '#9c27b0', 5);

-- Shop 3: Fashion Hub Textiles
INSERT INTO categories (id, shop_id, name, icon, color, sort_order) VALUES
(16, 3, 'Men''s Wear',      '👔', '#1565c0', 1),
(17, 3, 'Women''s Wear',    '👗', '#ad1457', 2),
(18, 3, 'Kids Wear',        '👶', '#ff8f00', 3),
(19, 3, 'Ethnic Wear',      '🎎', '#6a1b9a', 4),
(20, 3, 'Footwear',         '👟', '#2e7d32', 5),
(21, 3, 'Accessories',      '👜', '#d84315', 6);

-- Shop 4: Mega Electronics World
INSERT INTO categories (id, shop_id, name, icon, color, sort_order) VALUES
(22, 4, 'Mobile Phones',    '📱', '#1a73e8', 1),
(23, 4, 'Laptops',          '💻', '#0d47a1', 2),
(24, 4, 'TV & Audio',       '📺', '#e91e63', 3),
(25, 4, 'Home Appliances',  '🏠', '#ff9800', 4),
(26, 4, 'Accessories',      '🎧', '#607d8b', 5);

-- ============================================================
-- 5. ZONES (Store Layout / Aisles)
-- ============================================================

-- Shop 1: Super Fresh Market - 9 Zones + Entrance + Billing
INSERT INTO zones (id, shop_id, name, icon, color, position_row, position_col, photo, description, sort_order) VALUES
(1,  1, 'Entrance',          '🚪', '#333333', '1/2', '1/4', NULL, 'Main entrance of the store', 0),
(2,  1, 'Fresh Produce',     '🥦', '#4caf50', '2/3', '1/2', NULL, 'Fresh fruits, vegetables, and leafy greens', 1),
(3,  1, 'Dairy & Eggs',      '🧀', '#2196f3', '2/3', '2/3', NULL, 'Milk, cheese, butter, yogurt, and eggs', 2),
(4,  1, 'Bakery',            '🍞', '#ff9800', '2/3', '3/4', NULL, 'Fresh bread, cakes, cookies, and pastries', 3),
(5,  1, 'Meat & Seafood',    '🍖', '#f44336', '3/4', '1/2', NULL, 'Fresh chicken, mutton, fish, and prawns', 4),
(6,  1, 'Grains & Staples',  '🍚', '#795548', '3/4', '2/3', NULL, 'Rice, wheat flour, dal, sugar, oil, and spices', 5),
(7,  1, 'Snacks & Chips',    '🍿', '#e91e63', '3/4', '3/4', NULL, 'Chips, biscuits, chocolates, and namkeen', 6),
(8,  1, 'Beverages',         '🥤', '#9c27b0', '4/5', '1/2', NULL, 'Water, soft drinks, juice, tea, and coffee', 7),
(9,  1, 'Household Items',   '🧹', '#607d8b', '4/5', '2/3', NULL, 'Detergent, soap, brooms, and cleaning supplies', 8),
(10, 1, 'Personal Care',     '🧴', '#00bcd4', '4/5', '3/4', NULL, 'Shampoo, soap, toothpaste, and skincare', 9),
(11, 1, 'Billing Counter',   '💳', '#333333', '5/6', '1/4', NULL, 'Payment and checkout counter', 10);

-- Shop 2: Fresh Mart Express - Smaller store
INSERT INTO zones (id, shop_id, name, icon, color, position_row, position_col, photo, description, sort_order) VALUES
(12, 2, 'Entrance',       '🚪', '#333333', '1/2', '1/3', NULL, 'Store entrance', 0),
(13, 2, 'Fresh Section',  '🥬', '#4caf50', '2/3', '1/2', NULL, 'Fruits, vegetables, and dairy', 1),
(14, 2, 'Grocery Aisle',  '🛒', '#ff9800', '2/3', '2/3', NULL, 'Rice, dal, flour, oil, and spices', 2),
(15, 2, 'Snacks & Drinks','🍿', '#e91e63', '3/4', '1/2', NULL, 'Chips, biscuits, cold drinks, and juice', 3),
(16, 2, 'Billing',        '💳', '#333333', '3/4', '2/3', NULL, 'Checkout counter', 4);

-- Shop 3: Fashion Hub Textiles - 9 Zones
INSERT INTO zones (id, shop_id, name, icon, color, position_row, position_col, photo, description, sort_order) VALUES
(17, 3, 'Entrance',          '🚪', '#333333', '1/2', '1/4', NULL, 'Main entrance with display window', 0),
(18, 3, 'Men''s Casuals',    '👕', '#1565c0', '2/3', '1/2', NULL, 'T-shirts, jeans, shorts, and casual wear', 1),
(19, 3, 'Men''s Formals',    '👔', '#0d47a1', '2/3', '2/3', NULL, 'Formal shirts, trousers, blazers, and ties', 2),
(20, 3, 'Women''s Western',  '👗', '#ad1457', '2/3', '3/4', NULL, 'Tops, jeans, dresses, and skirts', 3),
(21, 3, 'Women''s Ethnic',   '🎎', '#6a1b9a', '3/4', '1/2', NULL, 'Sarees, salwar kameez, lehengas, and kurtas', 4),
(22, 3, 'Kids Section',      '👶', '#ff8f00', '3/4', '2/3', NULL, 'Kids clothing for boys and girls', 5),
(23, 3, 'Footwear',          '👟', '#2e7d32', '3/4', '3/4', NULL, 'Shoes, sandals, heels, and sports shoes', 6),
(24, 3, 'Accessories',       '👜', '#d84315', '4/5', '1/2', NULL, 'Watches, belts, bags, and sunglasses', 7),
(25, 3, 'Trial Rooms',       '🚪', '#455a64', '4/5', '2/3', NULL, 'Fitting and trial rooms', 8),
(26, 3, 'Billing Counter',   '💳', '#333333', '4/5', '3/4', NULL, 'Payment counter and alterations', 9);

-- Shop 4: Mega Electronics World
INSERT INTO zones (id, shop_id, name, icon, color, position_row, position_col, photo, description, sort_order) VALUES
(27, 4, 'Entrance',       '🚪', '#333333', '1/2', '1/4', NULL, 'Main entrance with latest launches display', 0),
(28, 4, 'Mobile Zone',    '📱', '#1a73e8', '2/3', '1/2', NULL, 'All brands - Samsung, Apple, OnePlus, etc.', 1),
(29, 4, 'Laptop Zone',    '💻', '#0d47a1', '2/3', '2/3', NULL, 'Laptops, desktops, and tablets', 2),
(30, 4, 'TV & Audio',     '📺', '#e91e63', '2/3', '3/4', NULL, 'LED TVs, speakers, soundbars, and headphones', 3),
(31, 4, 'Home Appliances','🏠', '#ff9800', '3/4', '1/2', NULL, 'Washing machines, ACs, refrigerators', 4),
(32, 4, 'Accessories',    '🎧', '#607d8b', '3/4', '2/3', NULL, 'Covers, chargers, cables, and peripherals', 5),
(33, 4, 'Service Center', '🔧', '#795548', '3/4', '3/4', NULL, 'Repair and service desk', 6),
(34, 4, 'Billing',        '💳', '#333333', '4/5', '1/4', NULL, 'Checkout and EMI counter', 7);

-- ============================================================
-- 6. PRODUCTS
-- ============================================================

-- =============================================
-- Shop 1: Super Fresh Market (60+ Products)
-- =============================================

-- Zone 2: Fresh Produce
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 2, 1, 'Apple (1kg)',        '🍎', NULL, 'Fresh Shimla apples',          180.00, 1),
(1, 2, 1, 'Banana (1 dozen)',   '🍌', NULL, 'Yellow ripe bananas',          40.00,  1),
(1, 2, 1, 'Tomato (1kg)',       '🍅', NULL, 'Fresh red tomatoes',           30.00,  1),
(1, 2, 1, 'Onion (1kg)',        '🧅', NULL, 'Premium onions',              35.00,  1),
(1, 2, 1, 'Potato (1kg)',       '🥔', NULL, 'Fresh potatoes',              25.00,  1),
(1, 2, 1, 'Carrot (500g)',      '🥕', NULL, 'Fresh orange carrots',         20.00,  1),
(1, 2, 1, 'Spinach (bunch)',    '🥬', NULL, 'Fresh green spinach',          15.00,  1),
(1, 2, 1, 'Mango (1kg)',        '🥭', NULL, 'Alphonso mangoes (seasonal)',  250.00, 1),
(1, 2, 1, 'Grapes (500g)',      '🍇', NULL, 'Green seedless grapes',        60.00,  1),
(1, 2, 1, 'Capsicum (250g)',    '🫑', NULL, 'Green capsicum',               25.00,  1);

-- Zone 3: Dairy & Eggs
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 3, 2, 'Milk (1L) - Nandini',    '🥛', NULL, 'Full cream milk 1 litre',      56.00,  1),
(1, 3, 2, 'Milk (500ml) - Amul',    '🥛', NULL, 'Amul Taaza toned milk',        28.00,  1),
(1, 3, 2, 'Curd (400g)',            '🥣', NULL, 'Fresh set curd',               30.00,  1),
(1, 3, 2, 'Paneer (200g)',          '🧀', NULL, 'Fresh cottage cheese',          80.00,  1),
(1, 3, 2, 'Cheese Slices',          '🧀', NULL, 'Amul cheese slices (10 pack)', 120.00, 1),
(1, 3, 2, 'Butter (100g)',          '🧈', NULL, 'Amul butter',                  55.00,  1),
(1, 3, 2, 'Eggs (12 pack)',         '🥚', NULL, 'Farm fresh eggs',              72.00,  1),
(1, 3, 2, 'Yogurt - Flavored',      '🍦', NULL, 'Epigamia Greek yogurt',        45.00,  1);

-- Zone 4: Bakery
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 4, 4, 'Bread - White',          '🍞', NULL, 'Britannia white bread',        40.00,  1),
(1, 4, 4, 'Bread - Brown',          '🍞', NULL, 'Whole wheat bread',            50.00,  1),
(1, 4, 4, 'Cake - Chocolate',       '🎂', NULL, 'Fresh chocolate cake 500g',    250.00, 1),
(1, 4, 4, 'Pav (8 pack)',           '🍞', NULL, 'Soft pav buns',                30.00,  1),
(1, 4, 4, 'Cookies - Butter',       '🍪', NULL, 'Britannia Good Day butter',    30.00,  1);

-- Zone 5: Meat & Seafood
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 5, 6, 'Chicken (1kg)',          '🍗', NULL, 'Fresh whole chicken',          180.00, 1),
(1, 5, 6, 'Chicken Breast (500g)',  '🍗', NULL, 'Boneless chicken breast',      160.00, 1),
(1, 5, 6, 'Mutton (500g)',          '🥩', NULL, 'Fresh goat meat with bone',    350.00, 1),
(1, 5, 6, 'Fish - Rohu (1kg)',      '🐟', NULL, 'Fresh rohu fish',              200.00, 1),
(1, 5, 6, 'Prawns (500g)',          '🦐', NULL, 'Cleaned medium prawns',        300.00, 1),
(1, 5, 6, 'Eggs - Country (6)',     '🥚', NULL, 'Free range country eggs',      60.00,  1);

-- Zone 6: Grains & Staples
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 6, 3, 'Rice - Basmati (5kg)',   '🍚', NULL, 'India Gate Basmati rice',      450.00, 1),
(1, 6, 3, 'Rice - Sona Masoori (5kg)','🍚', NULL, 'Premium Sona Masoori',       320.00, 1),
(1, 6, 3, 'Wheat Flour - Atta (5kg)','🌾', NULL, 'Aashirvaad whole wheat atta', 280.00, 1),
(1, 6, 3, 'Sugar (1kg)',            '🍬', NULL, 'White crystal sugar',           45.00,  1),
(1, 6, 3, 'Toor Dal (1kg)',         '🫘', NULL, 'Premium toor dal',              140.00, 1),
(1, 6, 3, 'Moong Dal (1kg)',        '🫘', NULL, 'Yellow moong dal',              120.00, 1),
(1, 6, 3, 'Sunflower Oil (1L)',     '🫗', NULL, 'Fortune sunflower oil',         140.00, 1),
(1, 6, 3, 'Mustard Oil (1L)',       '🫗', NULL, 'Pure mustard oil',              180.00, 1),
(1, 6, 3, 'Salt (1kg)',             '🧂', NULL, 'Tata iodized salt',             22.00,  1),
(1, 6, 9, 'Turmeric Powder (100g)', '🌶️', NULL, 'MDH turmeric powder',           35.00,  1),
(1, 6, 9, 'Red Chilli Powder (100g)','🌶️', NULL, 'MDH red chilli powder',         40.00,  1),
(1, 6, 9, 'Garam Masala (50g)',     '🌶️', NULL, 'Everest garam masala',           45.00,  1),
(1, 6, 9, 'Cumin Seeds (100g)',     '🌿', NULL, 'Whole jeera / cumin seeds',      40.00,  1);

-- Zone 7: Snacks & Chips
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 7, 4, 'Lays Chips - Classic',   '🍟', NULL, 'Lays classic salted 52g',      20.00,  1),
(1, 7, 4, 'Kurkure - Masala',       '🍟', NULL, 'Kurkure masala munch',          20.00,  1),
(1, 7, 4, 'Biscuit - Parle-G',      '🍪', NULL, 'Parle-G glucose biscuits',      10.00,  1),
(1, 7, 4, 'Biscuit - Oreo',         '🍪', NULL, 'Cadbury Oreo cookies',           30.00,  1),
(1, 7, 4, 'Chocolate - Dairy Milk',  '🍫', NULL, 'Cadbury Dairy Milk 50g',        40.00,  1),
(1, 7, 4, 'Chocolate - KitKat',      '🍫', NULL, 'Nestle KitKat 4 finger',        35.00,  1),
(1, 7, 4, 'Namkeen - Haldiram',      '🥜', NULL, 'Haldiram aloo bhujia 200g',     60.00,  1),
(1, 7, 4, 'Popcorn - Act II',        '🍿', NULL, 'Act II butter popcorn',          40.00,  1);

-- Zone 8: Beverages
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 8, 5, 'Water - Bisleri (1L)',    '💧', NULL, 'Bisleri mineral water',         20.00,  1),
(1, 8, 5, 'Coca Cola (750ml)',       '🥤', NULL, 'Coca Cola bottle',              40.00,  1),
(1, 8, 5, 'Pepsi (750ml)',           '🥤', NULL, 'Pepsi bottle',                  40.00,  1),
(1, 8, 5, 'Mango Juice - Maaza',    '🧃', NULL, 'Maaza mango drink 600ml',       35.00,  1),
(1, 8, 5, 'Tea - Tata (250g)',       '☕', NULL, 'Tata Premium tea leaves',        120.00, 1),
(1, 8, 5, 'Coffee - Nescafe (50g)',  '☕', NULL, 'Nescafe Classic instant',        150.00, 1),
(1, 8, 5, 'Lassi - Amul (200ml)',    '🥛', NULL, 'Amul Kool mango lassi',          25.00,  1);

-- Zone 9: Household Items
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 9, 7, 'Detergent - Surf Excel',  '🧹', NULL, 'Surf Excel Easy Wash 1kg',     120.00, 1),
(1, 9, 7, 'Dish Wash - Vim',         '🧽', NULL, 'Vim liquid 500ml',              99.00,  1),
(1, 9, 7, 'Floor Cleaner - Lizol',   '🧹', NULL, 'Lizol surface cleaner 500ml',   85.00,  1),
(1, 9, 7, 'Garbage Bags (30 pcs)',   '🗑️', NULL, 'Black garbage bags medium',      60.00,  1),
(1, 9, 7, 'Tissue Paper Roll',       '🧻', NULL, 'Soft touch tissue roll',         35.00,  1);

-- Zone 10: Personal Care
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(1, 10, 8, 'Shampoo - Head & Shoulders','🧴', NULL, 'Anti dandruff 180ml',        199.00, 1),
(1, 10, 8, 'Soap - Dove (3 pack)',    '🧼', NULL, 'Dove cream beauty bar',         165.00, 1),
(1, 10, 8, 'Toothpaste - Colgate',    '🪥', NULL, 'Colgate MaxFresh 150g',          85.00, 1),
(1, 10, 8, 'Face Wash - Himalaya',    '💧', NULL, 'Himalaya Neem face wash',        120.00, 1),
(1, 10, 8, 'Deodorant - Nivea',       '🧴', NULL, 'Nivea Men deodorant 150ml',      199.00, 1),
(1, 10, 8, 'Hair Oil - Parachute',    '🧴', NULL, 'Parachute coconut oil 200ml',     85.00, 1);

-- =============================================
-- Shop 3: Fashion Hub Textiles (40+ Products)
-- =============================================

-- Zone 18: Men's Casuals
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(3, 18, 16, 'Round Neck T-Shirt',     '👕', NULL, 'Cotton round neck tee - All colors', 499.00,  1),
(3, 18, 16, 'Polo T-Shirt',           '👕', NULL, 'Collar polo tee - Premium cotton',   799.00,  1),
(3, 18, 16, 'Men''s Jeans - Slim',    '👖', NULL, 'Slim fit denim jeans',               1299.00, 1),
(3, 18, 16, 'Men''s Jeans - Regular',  '👖', NULL, 'Regular fit comfort jeans',           999.00,  1),
(3, 18, 16, 'Cargo Shorts',           '🩳', NULL, 'Cotton cargo shorts',                 599.00,  1),
(3, 18, 16, 'Track Pants',            '👖', NULL, 'Sports track pants',                  499.00,  1),
(3, 18, 16, 'Hoodie',                 '🧥', NULL, 'Pullover hoodie - Winter wear',       999.00,  1);

-- Zone 19: Men's Formals
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(3, 19, 16, 'Formal Shirt - White',   '👔', NULL, 'Cotton white formal shirt',           999.00,  1),
(3, 19, 16, 'Formal Shirt - Blue',    '👔', NULL, 'Premium blue formal shirt',           1099.00, 1),
(3, 19, 16, 'Formal Trousers',        '👖', NULL, 'Slim fit formal trousers',            1299.00, 1),
(3, 19, 16, 'Blazer - Navy Blue',     '🧥', NULL, 'Single breasted navy blazer',         3999.00, 1),
(3, 19, 16, 'Tie - Silk',             '👔', NULL, 'Premium silk tie',                     499.00,  1),
(3, 19, 16, 'Formal Belt',            '👔', NULL, 'Genuine leather belt',                 799.00,  1);

-- Zone 20: Women's Western
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(3, 20, 17, 'Women''s Top',           '👚', NULL, 'Casual cotton top',                   499.00,  1),
(3, 20, 17, 'Women''s Jeans',         '👖', NULL, 'High waist skinny jeans',             1199.00, 1),
(3, 20, 17, 'Dress - Floral',         '👗', NULL, 'Floral print summer dress',           1499.00, 1),
(3, 20, 17, 'Skirt - A-Line',         '👗', NULL, 'Cotton A-line skirt',                 799.00,  1),
(3, 20, 17, 'Jacket - Denim',         '🧥', NULL, 'Classic denim jacket',                1599.00, 1);

-- Zone 21: Women's Ethnic
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(3, 21, 19, 'Saree - Silk',           '🥻', NULL, 'Kanchipuram silk saree',              4999.00, 1),
(3, 21, 19, 'Saree - Cotton',         '🥻', NULL, 'Handloom cotton saree',               1999.00, 1),
(3, 21, 19, 'Salwar Kameez',          '👘', NULL, 'Embroidered salwar set',               2499.00, 1),
(3, 21, 19, 'Lehenga',                '👗', NULL, 'Bridal lehenga choli',                 8999.00, 1),
(3, 21, 19, 'Kurta - Women',          '👘', NULL, 'Printed cotton kurta',                 799.00,  1),
(3, 21, 19, 'Kurta - Men',            '👘', NULL, 'Men''s ethnic kurta - All sizes',      999.00,  1),
(3, 21, 19, 'Dupatta',                '🧣', NULL, 'Embroidered silk dupatta',              599.00,  1);

-- Zone 22: Kids Section
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(3, 22, 18, 'Kids T-Shirt (Boys)',    '👕', NULL, 'Cartoon print t-shirt',               349.00,  1),
(3, 22, 18, 'Kids Frock (Girls)',     '👗', NULL, 'Cotton frock with bow',                449.00,  1),
(3, 22, 18, 'Kids Jeans',             '👖', NULL, 'Elastic waist kids jeans',              499.00,  1),
(3, 22, 18, 'School Uniform Set',     '🎒', NULL, 'Shirt + trouser school set',            699.00,  1),
(3, 22, 18, 'Kids Party Wear',        '👗', NULL, 'Designer party wear - Boys/Girls',      999.00,  1);

-- Zone 23: Footwear
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(3, 23, 20, 'Men''s Formal Shoes',    '👞', NULL, 'Leather formal shoes - Black/Brown',   1999.00, 1),
(3, 23, 20, 'Men''s Sports Shoes',    '👟', NULL, 'Nike/Adidas running shoes',             2999.00, 1),
(3, 23, 20, 'Women''s Heels',         '👠', NULL, 'Party wear heels 3 inch',               1499.00, 1),
(3, 23, 20, 'Women''s Sandals',       '👡', NULL, 'Casual daily wear sandals',              699.00,  1),
(3, 23, 20, 'Kids Shoes',             '👟', NULL, 'Velcro kids shoes',                      599.00,  1),
(3, 23, 20, 'Flip Flops',             '🩴', NULL, 'Bathroom and casual slippers',           199.00,  1);

-- Zone 24: Accessories
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(3, 24, 21, 'Wrist Watch - Men',      '⌚', NULL, 'Titan analog watch',                    2499.00, 1),
(3, 24, 21, 'Wrist Watch - Women',    '⌚', NULL, 'Fastrack women''s watch',                1999.00, 1),
(3, 24, 21, 'Leather Belt',           '👜', NULL, 'Genuine leather belt',                   599.00,  1),
(3, 24, 21, 'Handbag',                '👜', NULL, 'Women''s premium handbag',                1499.00, 1),
(3, 24, 21, 'Sunglasses',             '🕶️', NULL, 'UV protection sunglasses',                799.00,  1),
(3, 24, 21, 'Wallet - Men',           '👛', NULL, 'Leather bi-fold wallet',                  499.00,  1),
(3, 24, 21, 'Scarf / Stole',          '🧣', NULL, 'Printed chiffon stole',                   399.00,  1);

-- =============================================
-- Shop 4: Mega Electronics World (25+ Products)
-- =============================================

-- Zone 28: Mobile Zone
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(4, 28, 22, 'Samsung Galaxy S24',      '📱', NULL, '8GB RAM, 256GB, 5G',             74999.00, 1),
(4, 28, 22, 'iPhone 15',               '📱', NULL, '128GB, A16 Bionic chip',         79999.00, 1),
(4, 28, 22, 'OnePlus 12',              '📱', NULL, '12GB RAM, 256GB, Snapdragon',    64999.00, 1),
(4, 28, 22, 'Redmi Note 13 Pro',       '📱', NULL, '8GB RAM, 128GB, 5G',             24999.00, 1),
(4, 28, 22, 'Realme Narzo 60',         '📱', NULL, '6GB RAM, 128GB',                 14999.00, 1);

-- Zone 29: Laptop Zone
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(4, 29, 23, 'HP Pavilion 15',          '💻', NULL, 'i5 12th Gen, 8GB, 512GB SSD',   54999.00, 1),
(4, 29, 23, 'Dell Inspiron 14',        '💻', NULL, 'i5, 16GB RAM, 512GB SSD',        62999.00, 1),
(4, 29, 23, 'MacBook Air M2',          '💻', NULL, '8GB RAM, 256GB SSD',              99999.00, 1),
(4, 29, 23, 'Lenovo IdeaPad',          '💻', NULL, 'Ryzen 5, 8GB, 512GB',             44999.00, 1),
(4, 29, 23, 'iPad 10th Gen',           '📱', NULL, '64GB, 10.9 inch display',         44999.00, 1);

-- Zone 30: TV & Audio
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(4, 30, 24, 'Samsung 55" Smart TV',    '📺', NULL, '4K UHD, Smart TV with Tizen',     54999.00, 1),
(4, 30, 24, 'LG 43" LED TV',           '📺', NULL, 'Full HD Smart TV',                 32999.00, 1),
(4, 30, 24, 'Sony Soundbar',           '🔊', NULL, '2.1 channel with subwoofer',       14999.00, 1),
(4, 30, 24, 'JBL Bluetooth Speaker',   '🔊', NULL, 'JBL Flip 6 portable speaker',      9999.00,  1),
(4, 30, 24, 'Sony WH-1000XM5',         '🎧', NULL, 'Noise cancelling headphones',       24999.00, 1);

-- Zone 31: Home Appliances
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(4, 31, 25, 'Samsung Washing Machine', '🫧', NULL, '7kg Front Load fully automatic',    32999.00, 1),
(4, 31, 25, 'Whirlpool Refrigerator',  '🧊', NULL, '265L double door frost free',       24999.00, 1),
(4, 31, 25, 'Voltas AC 1.5 Ton',       '❄️', NULL, '5 Star Inverter split AC',           38999.00, 1),
(4, 31, 25, 'Philips Mixer Grinder',   '🍶', NULL, '750W 3 jar mixer grinder',            3999.00, 1),
(4, 31, 25, 'Prestige Induction',      '🍳', NULL, '1600W induction cooktop',              2499.00, 1);

-- Zone 32: Accessories
INSERT INTO products (shop_id, zone_id, category_id, name, icon, photo, description, price, in_stock) VALUES
(4, 32, 26, 'Phone Cover - Silicon',   '📱', NULL, 'Transparent silicon back cover',       199.00,  1),
(4, 32, 26, 'USB-C Charger 65W',       '🔌', NULL, 'Fast charger with cable',               999.00,  1),
(4, 32, 26, 'Wireless Mouse',          '🖱️', NULL, 'Logitech wireless mouse',                699.00,  1),
(4, 32, 26, 'Laptop Bag',              '💼', NULL, '15.6 inch laptop backpack',               999.00,  1),
(4, 32, 26, 'Power Bank 20000mAh',     '🔋', NULL, 'MI power bank fast charging',             1499.00, 1);


-- ============================================================
-- 7. OFFERS / DEALS
-- ============================================================

-- Shop 1: Super Fresh Market Offers
INSERT INTO offers (shop_id, title, description, photo, discount_percent, start_date, end_date, is_active) VALUES
(1, 'Fresh Fruit Festival - 30% OFF!',       'Get 30% off on all seasonal fruits. Limited time offer!',        NULL, 30, '2026-02-20', '2026-03-15', 1),
(1, 'Buy 2 Get 1 Free on Dairy Products',    'Special combo offer on milk, curd, and paneer.',                 NULL, NULL, '2026-02-25', '2026-03-10', 1),
(1, 'Weekend Mega Sale - Upto 50% OFF',      'Every Saturday & Sunday - massive discounts on all categories.', NULL, 50, '2026-02-22', '2026-04-30', 1),
(1, 'New Arrivals - Organic Vegetables',      'Fresh organic vegetables now available in our store!',           NULL, NULL, '2026-02-20', '2026-03-31', 1);

-- Shop 3: Fashion Hub Offers
INSERT INTO offers (shop_id, title, description, photo, discount_percent, start_date, end_date, is_active) VALUES
(3, 'End of Season Sale - 40% OFF!',         'Flat 40% off on all winter collection. Hurry!',                 NULL, 40, '2026-02-15', '2026-03-15', 1),
(3, 'Buy 1 Get 1 on T-Shirts',              'All men''s and women''s t-shirts - Buy 1 Get 1 free.',           NULL, NULL, '2026-02-20', '2026-03-10', 1),
(3, 'Wedding Collection Launched!',           'Exclusive bridal lehengas and sherwanis now available.',         NULL, NULL, '2026-02-01', '2026-05-31', 1),
(3, 'Kids Festival Wear - 25% OFF',          'Special discounts on kids party wear and ethnic outfits.',       NULL, 25, '2026-02-25', '2026-03-20', 1);

-- Shop 4: Electronics Offers
INSERT INTO offers (shop_id, title, description, photo, discount_percent, start_date, end_date, is_active) VALUES
(4, 'Smartphone Mega Sale!',                 'Up to Rs.15,000 off on select smartphones + exchange bonus.',    NULL, NULL, '2026-02-20', '2026-03-10', 1),
(4, 'Laptop Back to School Offer',           'Special student discounts on HP, Dell, and Lenovo laptops.',     NULL, 15, '2026-02-15', '2026-03-31', 1),
(4, 'No Cost EMI on All Products',           '0% EMI available on all products above Rs.5000.',               NULL, NULL, '2026-02-01', '2026-04-30', 1);


-- ============================================================
-- 8. WORKERS (Staff accounts)
-- ============================================================
-- Password for all: admin123 (bcrypt hashed)
INSERT INTO workers (id, shop_id, admin_id, name, email, password, phone) VALUES
(1, 1, 1, 'Arun Kumar',  'arun@shop.com',          '$2a$10$7gVgeBWRAX9Mx2tDVhfyKOD8TQwJEZi7YBtOakr7aoX5fYhqUwsTC', '9876543220'),
(2, 3, 2, 'Meena Devi',  'meena@textilehub.com',   '$2a$10$7gVgeBWRAX9Mx2tDVhfyKOD8TQwJEZi7YBtOakr7aoX5fYhqUwsTC', '9876543221');


-- ============================================================
-- 9. VERIFY DATA
-- ============================================================
SELECT 'SEED DATA LOADED SUCCESSFULLY!' AS status;
SELECT '--- Summary ---' AS info;
SELECT 'Admins' AS item, COUNT(*) AS count FROM admins
UNION ALL SELECT 'Shops', COUNT(*) FROM shops
UNION ALL SELECT 'Categories', COUNT(*) FROM categories
UNION ALL SELECT 'Zones', COUNT(*) FROM zones
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Offers', COUNT(*) FROM offers
UNION ALL SELECT 'Workers', COUNT(*) FROM workers;
