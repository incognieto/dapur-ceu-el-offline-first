CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'staf_produksi', 'pelanggan')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(160) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN ('kue_basah', 'kue_kering', 'bolu')),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    available BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(160) NOT NULL,
    unit VARCHAR(24) NOT NULL,
    stock_current NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (stock_current >= 0),
    stock_minimum NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (stock_minimum >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity_per_unit NUMERIC(12,3) NOT NULL CHECK (quantity_per_unit > 0),
    unit VARCHAR(24) NOT NULL,
    UNIQUE(product_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(120) NOT NULL,
    customer_contact VARCHAR(80),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('satuan', 'bulk')),
    needed_at DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'menunggu_konfirmasi'
        CHECK (status IN ('menunggu_konfirmasi', 'dikonfirmasi', 'diproses', 'siap_diambil', 'selesai', 'dibatalkan')),
    note TEXT,
    stock_estimation JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    item_note TEXT
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('masuk', 'keluar', 'koreksi')),
    quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    reference_type VARCHAR(32),
    reference_id UUID,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_role VARCHAR(32) NOT NULL,
    recipient_name VARCHAR(120),
    type VARCHAR(40) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient ON stock_movements(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(recipient_role, read);

INSERT INTO users (username, role, password_hash)
VALUES
    ('bulela', 'admin', '8dfa73229b0a7db00d98abaf8c187e14d3f27f805be4a3c26027c94593122c6f'), -- password: password123
    ('dede', 'staf_produksi', '8dfa73229b0a7db00d98abaf8c187e14d3f27f805be4a3c26027c94593122c6f'),
    ('rina', 'pelanggan', '8dfa73229b0a7db00d98abaf8c187e14d3f27f805be4a3c26027c94593122c6f')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, category, price, available, image_url)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Bolu Pandan', 'bolu', 55000, true, '/assets/bolu_pandan.jpg'),
    ('22222222-2222-2222-2222-222222222222', 'Kue Lapis', 'kue_basah', 3500, true, '/assets/kue_lapis.jpg'),
    ('33333333-3333-3333-3333-333333333333', 'Nastar Toples', 'kue_kering', 85000, true, '/assets/nastar_toples.jpg'),
    ('44444444-4444-4444-4444-444444444444', 'Kastengel', 'kue_kering', 90000, true, '/assets/kastengel.jpg'),
    ('55555555-5555-5555-5555-555555555555', 'Putri Salju', 'kue_kering', 80000, true, '/assets/putri_salju.jpg'),
    ('66666666-6666-6666-6666-666666666666', 'Kue Sus', 'kue_basah', 4500, true, '/assets/kue_sus.jpg'),
    ('77777777-7777-7777-7777-777777777777', 'Risoles', 'kue_basah', 4000, true, '/assets/risoles.jpg'),
    ('88888888-8888-8888-8888-888888888888', 'Lemper Ayam', 'kue_basah', 4500, true, '/assets/lemper_ayam.jpg'),
    ('99999999-9999-9999-9999-999999999999', 'Bolu Pisang', 'bolu', 50000, true, '/assets/bolu_pisang.jpg'),
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Bolu Coklat', 'bolu', 60000, true, '/assets/bolu_coklat.jpg'),
    ('bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'Brownies Kukus', 'bolu', 65000, true, '/assets/brownies_kukus.jpg'),
    ('cccccccc-1111-1111-1111-cccccccccccc', 'Kue Lumpur', 'kue_basah', 3500, true, '/assets/kue_lumpur.jpg'),
    ('dddddddd-1111-1111-1111-dddddddddddd', 'Lidah Kucing', 'kue_kering', 75000, true, '/assets/lidah_kucing.jpg'),
    ('eeeeeeee-1111-1111-1111-eeeeeeeeeeee', 'Pastel Sayur', 'kue_basah', 3500, true, '/assets/pastel_sayur.jpg'),
    ('ffffffff-1111-1111-1111-ffffffffffff', 'Sagu Keju', 'kue_kering', 85000, true, '/assets/sagu_keju.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ingredients (id, name, unit, stock_current, stock_minimum)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tepung Terigu', 'gram', 12000, 2500),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gula Pasir', 'gram', 8000, 2000),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Telur', 'butir', 200, 30),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mentega', 'gram', 5000, 1500),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Santan', 'ml', 4000, 1000),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Coklat Bubuk', 'gram', 2000, 500),
    ('11111111-aaaa-aaaa-aaaa-111111111111', 'Keju Edam', 'gram', 3000, 500),
    ('22222222-aaaa-aaaa-aaaa-222222222222', 'Kacang Mete', 'gram', 2000, 500),
    ('33333333-aaaa-aaaa-aaaa-333333333333', 'Pisang', 'buah', 100, 20),
    ('44444444-aaaa-aaaa-aaaa-444444444444', 'Daging Ayam', 'gram', 5000, 1000),
    ('55555555-aaaa-aaaa-aaaa-555555555555', 'Wortel', 'gram', 3000, 1000),
    ('66666666-aaaa-aaaa-aaaa-666666666666', 'Susu Cair', 'ml', 5000, 1000),
    ('77777777-aaaa-aaaa-aaaa-777777777777', 'Tepung Sagu', 'gram', 4000, 1000),
    ('88888888-aaaa-aaaa-aaaa-888888888888', 'Daun Pisang', 'lembar', 500, 100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recipes (product_id, ingredient_id, quantity_per_unit, unit)
VALUES
    -- Bolu Pandan
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 250, 'gram'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 180, 'gram'),
    ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 'butir'),
    -- Kue Lapis
    ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 35, 'gram'),
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 20, 'gram'),
    ('22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 30, 'ml'),
    -- Nastar Toples
    ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 450, 'gram'),
    ('33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 300, 'gram'),
    ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 'butir'),
    -- Kastengel
    ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 400, 'gram'),
    ('44444444-4444-4444-4444-444444444444', '11111111-aaaa-aaaa-aaaa-111111111111', 200, 'gram'),
    ('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 250, 'gram'),
    -- Putri Salju
    ('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 350, 'gram'),
    ('55555555-5555-5555-5555-555555555555', '22222222-aaaa-aaaa-aaaa-222222222222', 150, 'gram'),
    ('55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 200, 'gram'),
    -- Kue Sus
    ('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 20, 'gram'),
    ('66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'butir'),
    ('66666666-6666-6666-6666-666666666666', '66666666-aaaa-aaaa-aaaa-666666666666', 30, 'ml'),
    -- Risoles
    ('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 15, 'gram'),
    ('77777777-7777-7777-7777-777777777777', '55555555-aaaa-aaaa-aaaa-555555555555', 20, 'gram'),
    ('77777777-7777-7777-7777-777777777777', '44444444-aaaa-aaaa-aaaa-444444444444', 25, 'gram'),
    -- Lemper Ayam
    ('88888888-8888-8888-8888-888888888888', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 30, 'ml'),
    ('88888888-8888-8888-8888-888888888888', '44444444-aaaa-aaaa-aaaa-444444444444', 35, 'gram'),
    ('88888888-8888-8888-8888-888888888888', '88888888-aaaa-aaaa-aaaa-888888888888', 1, 'lembar'),
    -- Bolu Pisang
    ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 200, 'gram'),
    ('99999999-9999-9999-9999-999999999999', '33333333-aaaa-aaaa-aaaa-333333333333', 3, 'buah'),
    ('99999999-9999-9999-9999-999999999999', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 'butir'),
    -- Bolu Coklat
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 200, 'gram'),
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 40, 'gram'),
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 'butir'),
    -- Brownies Kukus
    ('bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 150, 'gram'),
    ('bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 60, 'gram'),
    ('bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 5, 'butir'),
    -- Kue Lumpur
    ('cccccccc-1111-1111-1111-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 20, 'gram'),
    ('cccccccc-1111-1111-1111-cccccccccccc', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 40, 'ml'),
    ('cccccccc-1111-1111-1111-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 15, 'gram'),
    -- Lidah Kucing
    ('dddddddd-1111-1111-1111-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 300, 'gram'),
    ('dddddddd-1111-1111-1111-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 250, 'gram'),
    ('dddddddd-1111-1111-1111-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 'butir'),
    -- Pastel Sayur
    ('eeeeeeee-1111-1111-1111-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 25, 'gram'),
    ('eeeeeeee-1111-1111-1111-eeeeeeeeeeee', '55555555-aaaa-aaaa-aaaa-555555555555', 20, 'gram'),
    ('eeeeeeee-1111-1111-1111-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'gram'),
    -- Sagu Keju
    ('ffffffff-1111-1111-1111-ffffffffffff', '77777777-aaaa-aaaa-aaaa-777777777777', 400, 'gram'),
    ('ffffffff-1111-1111-1111-ffffffffffff', '11111111-aaaa-aaaa-aaaa-111111111111', 150, 'gram'),
    ('ffffffff-1111-1111-1111-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 200, 'gram')
ON CONFLICT (product_id, ingredient_id) DO NOTHING;

