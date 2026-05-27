-- ============================================================
--  STOCKIFY — Supabase PostgreSQL Schema + Dummy Data
--  Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE user_role       AS ENUM ('admin', 'cashier', 'customer', 'delivery');
CREATE TYPE order_type      AS ENUM ('dine-in', 'takeaway', 'delivery');
CREATE TYPE order_source    AS ENUM ('online', 'onsite', 'whatsapp');
CREATE TYPE order_status    AS ENUM ('pending', 'on_delivery', 'complete', 'cancelled');
CREATE TYPE stock_unit      AS ENUM ('kg', 'liter', 'piece', 'gram', 'ml');


-- ─────────────────────────────────────────────
-- TABLE: users
-- Extends Supabase auth.users.
-- auth.users handles password hashing + Google OAuth tokens.
-- This table stores app-level profile data per user.
-- ─────────────────────────────────────────────
CREATE TABLE users (
    id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name           TEXT        NOT NULL,
    phone          TEXT        UNIQUE,                -- nullable for Google OAuth users until profile is completed
    email          TEXT        UNIQUE,
    role           user_role   NOT NULL DEFAULT 'customer',
    address        TEXT,                              -- customers only
    auth_provider  TEXT        NOT NULL DEFAULT 'email', -- 'email' | 'google'
    profile_complete BOOLEAN   NOT NULL DEFAULT FALSE, -- FALSE for new Google users until phone collected
    is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create users row when a new Supabase auth user signs up
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, name, email, auth_provider, role, profile_complete)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        CASE WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google' ELSE 'email' END,
        'customer',   -- default role; admin/cashier accounts are seeded manually
        CASE WHEN NEW.app_metadata->>'provider' = 'google' THEN FALSE ELSE TRUE END
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_new_auth_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();


-- ─────────────────────────────────────────────
-- TABLE: categories
-- ─────────────────────────────────────────────
CREATE TABLE categories (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar    TEXT NOT NULL,
    name_en    TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0
);


-- ─────────────────────────────────────────────
-- TABLE: allergens
-- ─────────────────────────────────────────────
CREATE TABLE allergens (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL
);


-- ─────────────────────────────────────────────
-- TABLE: ingredients
-- ─────────────────────────────────────────────
CREATE TABLE ingredients (
    id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar              TEXT        NOT NULL,
    name_en              TEXT        NOT NULL,
    stock_quantity       NUMERIC     NOT NULL DEFAULT 0,
    unit                 stock_unit  NOT NULL DEFAULT 'piece',
    low_stock_threshold  NUMERIC     NOT NULL DEFAULT 5,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TABLE: menu_items
-- ─────────────────────────────────────────────
CREATE TABLE menu_items (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar       TEXT        NOT NULL,
    name_en       TEXT        NOT NULL,
    category_id   UUID        NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
    price         NUMERIC     NOT NULL,
    photo_url     TEXT,                          -- Unsplash URL
    is_available  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TABLE: menu_item_ingredients  (junction)
-- ─────────────────────────────────────────────
CREATE TABLE menu_item_ingredients (
    menu_item_id   UUID NOT NULL REFERENCES menu_items(id)   ON DELETE CASCADE,
    ingredient_id  UUID NOT NULL REFERENCES ingredients(id)  ON DELETE CASCADE,
    quantity       NUMERIC NOT NULL DEFAULT 1,
    PRIMARY KEY (menu_item_id, ingredient_id)
);


-- ─────────────────────────────────────────────
-- TABLE: menu_item_allergens  (junction)
-- ─────────────────────────────────────────────
CREATE TABLE menu_item_allergens (
    menu_item_id  UUID NOT NULL REFERENCES menu_items(id)  ON DELETE CASCADE,
    allergen_id   UUID NOT NULL REFERENCES allergens(id)   ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);


-- ─────────────────────────────────────────────
-- TABLE: orders
-- ─────────────────────────────────────────────
CREATE TABLE orders (
    id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    source           order_source  NOT NULL DEFAULT 'online',
    type             order_type    NOT NULL,
    status           order_status  NOT NULL DEFAULT 'pending',
    customer_id      UUID          REFERENCES users(id) ON DELETE SET NULL,  -- online orders
    owner_name       TEXT,                                                    -- onsite takeaway
    delivery_address TEXT,                                                    -- delivery orders
    notes            TEXT,
    total_price      NUMERIC       NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TABLE: order_items
-- ─────────────────────────────────────────────
CREATE TABLE order_items (
    id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id      UUID    NOT NULL REFERENCES orders(id)      ON DELETE CASCADE,
    menu_item_id  UUID    NOT NULL REFERENCES menu_items(id)  ON DELETE SET NULL,
    quantity      INT     NOT NULL DEFAULT 1,
    unit_price    NUMERIC NOT NULL,
    notes         TEXT
);


-- ─────────────────────────────────────────────
-- TABLE: chatbot_insights
-- ─────────────────────────────────────────────
CREATE TABLE chatbot_insights (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    favourite_items  UUID[]      DEFAULT '{}',    -- array of menu_item ids
    default_address  TEXT,
    last_seen        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- FUNCTION: auto-update orders.updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_insights   ENABLE ROW LEVEL SECURITY;

-- Public can read menu
CREATE POLICY "menu_public_read" ON menu_items FOR SELECT USING (TRUE);
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "allergens_public_read" ON allergens FOR SELECT USING (TRUE);
CREATE POLICY "ingredients_public_read" ON ingredients FOR SELECT USING (TRUE);
CREATE POLICY "menu_item_ingredients_public_read" ON menu_item_ingredients FOR SELECT USING (TRUE);
CREATE POLICY "menu_item_allergens_public_read" ON menu_item_allergens FOR SELECT USING (TRUE);

-- Users can only read their own row
CREATE POLICY "users_self_read" ON users FOR SELECT
    USING (auth.uid()::TEXT = id::TEXT);

-- Customers can only see their own orders
CREATE POLICY "orders_customer_read" ON orders FOR SELECT
    USING (customer_id::TEXT = auth.uid()::TEXT);

-- Customers can insert their own orders
CREATE POLICY "orders_customer_insert" ON orders FOR INSERT
    WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);

-- Customers read their own insights
CREATE POLICY "insights_self_read" ON chatbot_insights FOR SELECT
    USING (user_id::TEXT = auth.uid()::TEXT);

-- Customers upsert their own insights
CREATE POLICY "insights_self_upsert" ON chatbot_insights FOR ALL
    USING (user_id::TEXT = auth.uid()::TEXT);


-- ============================================================
--  DUMMY DATA
-- ============================================================

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
INSERT INTO categories (id, name_ar, name_en, sort_order) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'مقبلات',       'Starters',    1),
    ('c1000000-0000-0000-0000-000000000002', 'وجبات رئيسية', 'Main Dishes',  2),
    ('c1000000-0000-0000-0000-000000000003', 'مشويات',       'Grills',       3),
    ('c1000000-0000-0000-0000-000000000004', 'سندوتشات',     'Sandwiches',   4),
    ('c1000000-0000-0000-0000-000000000005', 'سلطات',        'Salads',       5),
    ('c1000000-0000-0000-0000-000000000006', 'مشروبات',      'Drinks',       6),
    ('c1000000-0000-0000-0000-000000000007', 'حلويات',       'Desserts',     7);


-- ─────────────────────────────────────────────
-- ALLERGENS
-- ─────────────────────────────────────────────
INSERT INTO allergens (id, name_ar, name_en) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'جلوتين',      'Gluten'),
    ('a1000000-0000-0000-0000-000000000002', 'منتجات ألبان', 'Dairy'),
    ('a1000000-0000-0000-0000-000000000003', 'مكسرات',      'Nuts'),
    ('a1000000-0000-0000-0000-000000000004', 'بيض',         'Eggs'),
    ('a1000000-0000-0000-0000-000000000005', 'صويا',        'Soy'),
    ('a1000000-0000-0000-0000-000000000006', 'سمسم',        'Sesame');


-- ─────────────────────────────────────────────
-- INGREDIENTS
-- ─────────────────────────────────────────────
INSERT INTO ingredients (id, name_ar, name_en, stock_quantity, unit, low_stock_threshold) VALUES
    ('i1000000-0000-0000-0000-000000000001', 'لحم بقري',      'Beef',           15,  'kg',    3),
    ('i1000000-0000-0000-0000-000000000002', 'فراخ',          'Chicken',        20,  'kg',    4),
    ('i1000000-0000-0000-0000-000000000003', 'أرز',           'Rice',           30,  'kg',    5),
    ('i1000000-0000-0000-0000-000000000004', 'طماطم',         'Tomatoes',       10,  'kg',    2),
    ('i1000000-0000-0000-0000-000000000005', 'خيار',          'Cucumber',       5,   'kg',    1),
    ('i1000000-0000-0000-0000-000000000006', 'ثوم',           'Garlic',         3,   'kg',    0.5),
    ('i1000000-0000-0000-0000-000000000007', 'بصل',           'Onion',          8,   'kg',    2),
    ('i1000000-0000-0000-0000-000000000008', 'خبز عيش بلدي', 'Pita Bread',     60,  'piece', 10),
    ('i1000000-0000-0000-0000-000000000009', 'جبنة بيضاء',   'White Cheese',   4,   'kg',    1),
    ('i1000000-0000-0000-0000-000000000010', 'زيت زيتون',    'Olive Oil',      5,   'liter', 1),
    ('i1000000-0000-0000-0000-000000000011', 'طحينة',         'Tahini',         3,   'kg',    0.5),
    ('i1000000-0000-0000-0000-000000000012', 'كبدة',          'Liver',          4,   'kg',    1),
    ('i1000000-0000-0000-0000-000000000013', 'بيض',           'Eggs',           48,  'piece', 12),
    ('i1000000-0000-0000-0000-000000000014', 'فول مدمس',     'Fava Beans',     10,  'kg',    2),
    ('i1000000-0000-0000-0000-000000000015', 'كريمة',         'Heavy Cream',    2,   'liter', 0.5),
    ('i1000000-0000-0000-0000-000000000016', 'شيكولاتة',     'Chocolate',      3,   'kg',    0.5),
    ('i1000000-0000-0000-0000-000000000017', 'سكر',           'Sugar',          10,  'kg',    2),
    ('i1000000-0000-0000-0000-000000000018', 'بطاطس',         'Potatoes',       12,  'kg',    3),
    ('i1000000-0000-0000-0000-000000000019', 'فلفل رومي',    'Bell Pepper',    4,   'kg',    1),
    ('i1000000-0000-0000-0000-000000000020', 'بهارات مشكلة', 'Mixed Spices',   2,   'kg',    0.3);


-- ─────────────────────────────────────────────
-- MENU ITEMS  (Unsplash photos)
-- ─────────────────────────────────────────────
INSERT INTO menu_items (id, name_ar, name_en, category_id, price, photo_url, is_available) VALUES
    -- Starters
    ('m1000000-0000-0000-0000-000000000001', 'حمص بالطحينة',     'Hummus',              'c1000000-0000-0000-0000-000000000001', 35,  'https://images.unsplash.com/photo-1567364143-3de17a5dc3b6?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000002', 'فول مدمس',         'Fava Beans',          'c1000000-0000-0000-0000-000000000001', 30,  'https://images.unsplash.com/photo-1626081078019-a1e8f5a7e7b3?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000003', 'بابا غنوج',        'Baba Ganoush',        'c1000000-0000-0000-0000-000000000001', 40,  'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=600', TRUE),

    -- Main Dishes
    ('m1000000-0000-0000-0000-000000000004', 'فراخ بالأرز',      'Chicken with Rice',   'c1000000-0000-0000-0000-000000000002', 120, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000005', 'كفتة بالصلصة',     'Kofta in Sauce',      'c1000000-0000-0000-0000-000000000002', 110, 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000006', 'مكرونة بشاميل',    'Macarona Béchamel',   'c1000000-0000-0000-0000-000000000002', 95,  'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600', TRUE),

    -- Grills
    ('m1000000-0000-0000-0000-000000000007', 'مشاوي مشكلة',      'Mixed Grill',         'c1000000-0000-0000-0000-000000000003', 220, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000008', 'كباب حلة',          'Grilled Kebab',       'c1000000-0000-0000-0000-000000000003', 160, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000009', 'دجاج مشوي',        'Grilled Chicken',     'c1000000-0000-0000-0000-000000000003', 145, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c2?w=600', TRUE),

    -- Sandwiches
    ('m1000000-0000-0000-0000-000000000010', 'سندوتش كبدة',      'Liver Sandwich',      'c1000000-0000-0000-0000-000000000004', 25,  'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000011', 'سندوتش فراخ',      'Chicken Sandwich',    'c1000000-0000-0000-0000-000000000004', 55,  'https://images.unsplash.com/photo-1562967914-608f82629710?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000012', 'سندوتش فلافل',     'Falafel Sandwich',    'c1000000-0000-0000-0000-000000000004', 20,  'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600', TRUE),

    -- Salads
    ('m1000000-0000-0000-0000-000000000013', 'سلطة خضراء',       'Green Salad',         'c1000000-0000-0000-0000-000000000005', 35,  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000014', 'سلطة فتوش',        'Fattoush Salad',      'c1000000-0000-0000-0000-000000000005', 40,  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', TRUE),

    -- Drinks
    ('m1000000-0000-0000-0000-000000000015', 'عصير ليمون',       'Lemonade',            'c1000000-0000-0000-0000-000000000006', 30,  'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000016', 'مياه معدنية',      'Mineral Water',       'c1000000-0000-0000-0000-000000000006', 10,  'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000017', 'عصير مانجو',       'Mango Juice',         'c1000000-0000-0000-0000-000000000006', 40,  'https://images.unsplash.com/photo-1546173159-315724a31696?w=600', TRUE),

    -- Desserts
    ('m1000000-0000-0000-0000-000000000018', 'أم علي',           'Om Ali',              'c1000000-0000-0000-0000-000000000007', 65,  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000019', 'بسبوسة',           'Basbousa',            'c1000000-0000-0000-0000-000000000007', 40,  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', TRUE),
    ('m1000000-0000-0000-0000-000000000020', 'كنافة',            'Kunafa',              'c1000000-0000-0000-0000-000000000007', 70,  'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600', TRUE);


-- ─────────────────────────────────────────────
-- MENU ITEM → INGREDIENTS
-- ─────────────────────────────────────────────
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity) VALUES
    -- حمص بالطحينة
    ('m1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000014', 0.2),
    ('m1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000011', 0.05),
    ('m1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000010', 0.02),
    ('m1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000006', 0.01),
    -- فول مدمس
    ('m1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000014', 0.3),
    ('m1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000004', 0.05),
    ('m1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000010', 0.02),
    -- فراخ بالأرز
    ('m1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000002', 0.4),
    ('m1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000003', 0.2),
    ('m1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000020', 0.01),
    -- كفتة بالصلصة
    ('m1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000001', 0.3),
    ('m1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000004', 0.2),
    ('m1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000007', 0.1),
    -- مشاوي مشكلة
    ('m1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000001', 0.3),
    ('m1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000002', 0.3),
    ('m1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000019', 0.1),
    ('m1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000020', 0.02),
    -- سندوتش كبدة
    ('m1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000012', 0.15),
    ('m1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000008', 1),
    ('m1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000007', 0.05),
    -- سلطة خضراء
    ('m1000000-0000-0000-0000-000000000013', 'i1000000-0000-0000-0000-000000000004', 0.15),
    ('m1000000-0000-0000-0000-000000000013', 'i1000000-0000-0000-0000-000000000005', 0.1),
    ('m1000000-0000-0000-0000-000000000013', 'i1000000-0000-0000-0000-000000000010', 0.02),
    -- أم علي
    ('m1000000-0000-0000-0000-000000000018', 'i1000000-0000-0000-0000-000000000015', 0.2),
    ('m1000000-0000-0000-0000-000000000018', 'i1000000-0000-0000-0000-000000000017', 0.05),
    ('m1000000-0000-0000-0000-000000000018', 'i1000000-0000-0000-0000-000000000003', 0.05);


-- ─────────────────────────────────────────────
-- MENU ITEM → ALLERGENS
-- ─────────────────────────────────────────────
INSERT INTO menu_item_allergens (menu_item_id, allergen_id) VALUES
    ('m1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006'), -- حمص → sesame
    ('m1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006'), -- بابا غنوج → sesame
    ('m1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001'), -- مكرونة بشاميل → gluten
    ('m1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002'), -- → dairy
    ('m1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004'), -- → eggs
    ('m1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001'), -- سندوتش كبدة → gluten
    ('m1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001'), -- سندوتش فراخ → gluten
    ('m1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001'), -- فلافل → gluten
    ('m1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000001'), -- فتوش → gluten
    ('m1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000002'), -- أم علي → dairy
    ('m1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000003'), -- → nuts
    ('m1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000001'), -- بسبوسة → gluten
    ('m1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000001'), -- كنافة → gluten
    ('m1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000002'); -- → dairy


-- ─────────────────────────────────────────────
-- USERS
-- NOTE: In production, Admin/Cashier accounts are created via
-- Supabase Auth Admin API (supabase.auth.admin.createUser) which
-- inserts into auth.users first, then the trigger populates this table.
-- The INSERT below simulates the profile rows only (auth.users rows
-- must exist first — create them via the Supabase Auth dashboard or API).
--
-- HOW TO SEED ADMIN/CASHIER IN PRODUCTION:
--   1. Go to Supabase Dashboard → Authentication → Users → Add User
--   2. Set email + password, note the generated UUID
--   3. Then UPDATE users SET role='admin' WHERE id='<that-uuid>'
--
-- For local dev, use the UUIDs below as placeholders.
-- ─────────────────────────────────────────────

-- After creating auth users, set their roles and profiles:
-- (Run these UPDATEs after seeding auth.users with matching IDs)

INSERT INTO users (id, name, phone, email, role, address, auth_provider, profile_complete, is_active) VALUES
    -- Test staff accounts (password: password123) — provisioned via /api/seed-test-users
    ('u1000000-0000-0000-0000-000000000001', 'Test Admin',    '01011111111', 'admin@example.com',    'admin',    NULL, 'email',  TRUE,  TRUE),
    ('u1000000-0000-0000-0000-000000000002', 'Test Cashier',  '01022222222', 'cashier1@example.com', 'cashier',  NULL, 'email',  TRUE,  TRUE),
    ('u1000000-0000-0000-0000-000000000003', 'Test Delivery', '01033333333', 'delivery@example.com', 'delivery', NULL, 'email',  TRUE,  TRUE),
    -- Customer via email/password registration
    ('u1000000-0000-0000-0000-000000000004', 'مريم أحمد',    '01044444444', 'mariam@gmail.com',      'customer', '15 شارع النيل، المعادي، القاهرة', 'email',  TRUE,  TRUE),
    -- Customer via Google OAuth (profile_complete=TRUE means phone was collected after OAuth)
    ('u1000000-0000-0000-0000-000000000005', 'كريم محمود',   '01055555555', 'karim@gmail.com',       'customer', '7 شارع التحرير، الدقي، الجيزة',   'google', TRUE,  TRUE),
    -- Customer via Google OAuth — profile NOT yet complete (phone pending)
    ('u1000000-0000-0000-0000-000000000006', 'نور خالد',     NULL,          'nour@gmail.com',        'customer', NULL,                              'google', FALSE, TRUE);


-- ─────────────────────────────────────────────
-- CHATBOT INSIGHTS
-- ─────────────────────────────────────────────
INSERT INTO chatbot_insights (user_id, favourite_items, default_address, last_seen) VALUES
    ('u1000000-0000-0000-0000-000000000004',
     ARRAY['m1000000-0000-0000-0000-000000000004', 'm1000000-0000-0000-0000-000000000001']::UUID[],
     '15 شارع النيل، المعادي، القاهرة',
     NOW() - INTERVAL '2 days'),
    ('u1000000-0000-0000-0000-000000000005',
     ARRAY['m1000000-0000-0000-0000-000000000007', 'm1000000-0000-0000-0000-000000000015']::UUID[],
     '7 شارع التحرير، الدقي، الجيزة',
     NOW() - INTERVAL '5 days');


-- ─────────────────────────────────────────────
-- SAMPLE ORDERS
-- ─────────────────────────────────────────────
INSERT INTO orders (id, source, type, status, customer_id, owner_name, delivery_address, notes, total_price, created_at) VALUES
    ('o1000000-0000-0000-0000-000000000001', 'online',  'delivery', 'completed', 'u1000000-0000-0000-0000-000000000004', NULL, '15 شارع النيل، المعادي، القاهرة', NULL,  155, NOW() - INTERVAL '1 day'),
    ('o1000000-0000-0000-0000-000000000002', 'online',  'takeaway', 'preparing', 'u1000000-0000-0000-0000-000000000005', NULL, NULL,                                 NULL,  220, NOW() - INTERVAL '30 minutes'),
    ('o1000000-0000-0000-0000-000000000003', 'onsite',  'dine-in',  'ready',     NULL,                                   NULL, NULL,                                 NULL,  185, NOW() - INTERVAL '15 minutes'),
    ('o1000000-0000-0000-0000-000000000004', 'onsite',  'takeaway', 'pending',   NULL,                                   'علي محمد', NULL,                           'بدون بصل', 55,  NOW() - INTERVAL '5 minutes');

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES
    -- Order 1 (online delivery - مريم)
    ('o1000000-0000-0000-0000-000000000001', 'm1000000-0000-0000-0000-000000000004', 1, 120, NULL),
    ('o1000000-0000-0000-0000-000000000001', 'm1000000-0000-0000-0000-000000000001', 1, 35,  NULL),
    -- Order 2 (online takeaway - كريم)
    ('o1000000-0000-0000-0000-000000000002', 'm1000000-0000-0000-0000-000000000007', 1, 220, NULL),
    -- Order 3 (onsite dine-in)
    ('o1000000-0000-0000-0000-000000000003', 'm1000000-0000-0000-0000-000000000005', 1, 110, NULL),
    ('o1000000-0000-0000-0000-000000000003', 'm1000000-0000-0000-0000-000000000015', 1, 30,  NULL),
    ('o1000000-0000-0000-0000-000000000003', 'm1000000-0000-0000-0000-000000000013', 1, 35,  NULL),
    ('o1000000-0000-0000-0000-000000000003', 'm1000000-0000-0000-0000-000000000016', 1, 10,  NULL),
    -- Order 4 (onsite takeaway - علي)
    ('o1000000-0000-0000-0000-000000000004', 'm1000000-0000-0000-0000-000000000011', 1, 55,  'بدون بصل');


-- ============================================================
--  USEFUL VIEWS  (used by API routes)
-- ============================================================

-- Full menu with category name
CREATE OR REPLACE VIEW v_menu AS
SELECT
    m.id,
    m.name_ar,
    m.name_en,
    c.name_ar  AS category_ar,
    c.name_en  AS category_en,
    m.price,
    m.photo_url,
    m.is_available,
    m.created_at
FROM menu_items m
JOIN categories c ON c.id = m.category_id;

-- Item ingredients enriched
CREATE OR REPLACE VIEW v_item_ingredients AS
SELECT
    mii.menu_item_id,
    i.id          AS ingredient_id,
    i.name_ar,
    i.name_en,
    mii.quantity,
    i.unit
FROM menu_item_ingredients mii
JOIN ingredients i ON i.id = mii.ingredient_id;

-- Item allergens enriched
CREATE OR REPLACE VIEW v_item_allergens AS
SELECT
    mia.menu_item_id,
    a.id      AS allergen_id,
    a.name_ar,
    a.name_en
FROM menu_item_allergens mia
JOIN allergens a ON a.id = mia.allergen_id;

-- Cashier orders view (full detail)
CREATE OR REPLACE VIEW v_orders AS
SELECT
    o.id,
    o.source,
    o.type,
    o.status,
    o.owner_name,
    o.delivery_address,
    o.notes,
    o.total_price,
    o.created_at,
    o.updated_at,
    u.name  AS customer_name,
    u.phone AS customer_phone,
    json_agg(json_build_object(
        'menu_item_id', oi.menu_item_id,
        'name_ar',      mi.name_ar,
        'name_en',      mi.name_en,
        'quantity',     oi.quantity,
        'unit_price',   oi.unit_price,
        'notes',        oi.notes
    )) AS items
FROM orders o
LEFT JOIN users      u  ON u.id  = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
GROUP BY o.id, u.name, u.phone;

-- Low stock alerts view
CREATE OR REPLACE VIEW v_low_stock AS
SELECT
    id,
    name_ar,
    name_en,
    stock_quantity,
    unit,
    low_stock_threshold,
    CASE
        WHEN stock_quantity = 0                        THEN 'out_of_stock'
        WHEN stock_quantity <= low_stock_threshold     THEN 'low'
        ELSE 'ok'
    END AS alert_level
FROM ingredients
WHERE stock_quantity <= low_stock_threshold;