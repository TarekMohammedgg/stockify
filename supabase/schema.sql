-- ============================================================
--  STOCKIFY -- Supabase PostgreSQL Schema (canonical)
--
--  Source of truth for the live Supabase project.
--  Mirrors docs/SUPABASE_SCHEMA.md (PRD Section 7).
--  Idempotent: safe to re-run; uses IF NOT EXISTS / OR REPLACE.
-- ============================================================

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'cashier', 'delivery', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('dine-in', 'takeaway', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_source AS ENUM ('online', 'onsite');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'on_delivery', 'complete', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE stock_unit AS ENUM ('kg', 'liter', 'piece', 'gram', 'ml');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─────────────────────────────────────────────
-- TABLE: users (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name             TEXT        NOT NULL,
    phone            TEXT        UNIQUE,
    email            TEXT        UNIQUE,
    role             user_role   NOT NULL DEFAULT 'customer',
    address          TEXT,
    auth_provider    TEXT        NOT NULL DEFAULT 'email',
    profile_complete BOOLEAN     NOT NULL DEFAULT FALSE,
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TABLE: categories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar    TEXT NOT NULL,
    name_en    TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0
);


-- ─────────────────────────────────────────────
-- TABLE: allergens
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allergens (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL
);


-- ─────────────────────────────────────────────
-- TABLE: ingredients
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingredients (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar             TEXT        NOT NULL,
    name_en             TEXT        NOT NULL,
    stock_quantity      NUMERIC     NOT NULL DEFAULT 0,
    unit                stock_unit  NOT NULL DEFAULT 'piece',
    low_stock_threshold NUMERIC     NOT NULL DEFAULT 5,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TABLE: menu_items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar      TEXT        NOT NULL,
    name_en      TEXT        NOT NULL,
    category_id  UUID        REFERENCES categories(id) ON DELETE SET NULL,
    price        NUMERIC     NOT NULL,
    photo_url    TEXT,
    is_available BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TABLE: menu_item_ingredients (junction)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    menu_item_id  UUID    NOT NULL REFERENCES menu_items(id)  ON DELETE CASCADE,
    ingredient_id UUID    NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity      NUMERIC NOT NULL DEFAULT 1,
    PRIMARY KEY (menu_item_id, ingredient_id)
);


-- ─────────────────────────────────────────────
-- TABLE: menu_item_allergens (junction)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_item_allergens (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    allergen_id  UUID NOT NULL REFERENCES allergens(id)  ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);


-- ─────────────────────────────────────────────
-- TABLE: orders
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    source           order_source NOT NULL DEFAULT 'online',
    type             order_type   NOT NULL,
    status           order_status NOT NULL DEFAULT 'pending',
    customer_id      UUID         REFERENCES users(id) ON DELETE SET NULL,
    owner_name       TEXT,
    delivery_address TEXT,
    notes            TEXT,
    customer_phone   TEXT,
    total_price      NUMERIC      NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- TABLE: order_items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id     UUID    NOT NULL REFERENCES orders(id)     ON DELETE CASCADE,
    menu_item_id UUID    REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity     INT     NOT NULL DEFAULT 1,
    unit_price   NUMERIC NOT NULL,
    notes        TEXT
);


-- ─────────────────────────────────────────────
-- TABLE: cart_items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id UUID        NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, menu_item_id)
);


-- ─────────────────────────────────────────────
-- TABLE: chatbot_insights
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chatbot_insights (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    favourite_items UUID[]      DEFAULT '{}',
    default_address TEXT,
    last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  VIEWS (used by API routes)
-- ============================================================

CREATE OR REPLACE VIEW v_menu AS
SELECT
    m.id,
    m.name_ar,
    m.name_en,
    c.name_ar AS category_ar,
    c.name_en AS category_en,
    m.price,
    m.photo_url,
    m.is_available,
    m.created_at
FROM menu_items m
JOIN categories c ON c.id = m.category_id;


CREATE OR REPLACE VIEW v_item_ingredients AS
SELECT
    mii.menu_item_id,
    i.id AS ingredient_id,
    i.name_ar,
    i.name_en,
    mii.quantity,
    i.unit
FROM menu_item_ingredients mii
JOIN ingredients i ON i.id = mii.ingredient_id;


CREATE OR REPLACE VIEW v_item_allergens AS
SELECT
    mia.menu_item_id,
    a.id AS allergen_id,
    a.name_ar,
    a.name_en
FROM menu_item_allergens mia
JOIN allergens a ON a.id = mia.allergen_id;


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
    COALESCE(u.phone, o.customer_phone) AS customer_phone,
    COALESCE(
        json_agg(
            json_build_object(
                'menu_item_id', oi.menu_item_id,
                'name_ar',      mi.name_ar,
                'name_en',      mi.name_en,
                'quantity',     oi.quantity,
                'unit_price',   oi.unit_price,
                'notes',        oi.notes
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
    ) AS items
FROM orders o
LEFT JOIN users       u  ON u.id  = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items  mi ON mi.id = oi.menu_item_id
GROUP BY o.id, u.name, u.phone;


CREATE OR REPLACE VIEW v_low_stock AS
SELECT
    id,
    name_ar,
    name_en,
    stock_quantity,
    unit,
    low_stock_threshold,
    CASE
        WHEN stock_quantity = 0                    THEN 'out_of_stock'
        WHEN stock_quantity <= low_stock_threshold THEN 'low'
        ELSE 'ok'
    END AS alert_level
FROM ingredients
WHERE stock_quantity <= low_stock_threshold;


-- ============================================================
--  RLS -- enable on all tables.
--  Policies are maintained in dedicated migrations
--  (see migration `stockify_rls_policies`).
-- ============================================================
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergens              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_ingredients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_allergens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_insights       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items             ENABLE ROW LEVEL SECURITY;
