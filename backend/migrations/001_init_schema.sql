-- PasokTani Database Schema

-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'FARMER', 'BUYER');
CREATE TYPE user_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');
CREATE TYPE commodity_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'AVAILABLE', 'SOLD_OUT');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED');
CREATE TYPE delivery_method AS ENUM ('PICKUP', 'EXPEDITION');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'EWALLET', 'QRIS', 'COD');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE chat_message_type AS ENUM ('TEXT', 'OFFER', 'COUNTER_OFFER', 'ACCEPT', 'REJECT', 'SYSTEM');
CREATE TYPE negotiation_status AS ENUM ('PENDING', 'COUNTER_OFFER', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');
CREATE TYPE chat_room_status AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE wishlist_transaction_type AS ENUM ('NEGO', 'FIXED_PRICE');
CREATE TYPE contact_message_status AS ENUM ('UNREAD', 'READ');
CREATE TYPE business_type AS ENUM ('DISTRIBUTOR', 'UMKM', 'RESTORAN', 'KOPERASI', 'NONE');
CREATE TYPE demand_scale AS ENUM ('SKALA_KECIL', 'SKALA_MENENGAH', 'SKALA_BESAR', 'NONE');

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role user_role DEFAULT 'BUYER',
  status user_status DEFAULT 'PENDING',
  business_type business_type DEFAULT 'NONE',
  demand_scale demand_scale DEFAULT 'NONE',
  preferred_commodity VARCHAR(150),
  foto_profile TEXT,
  address TEXT,
  bio TEXT,
  farming_experience VARCHAR(50),
  farm_area VARCHAR(50),
  farming_method VARCHAR(100),
  village VARCHAR(100),
  rejected_reason TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Categories Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commodities Table
CREATE TABLE commodities (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  min_price DECIMAL(12, 2),
  max_price DECIMAL(12, 2),
  fixed_price DECIMAL(12, 2),
  stock DECIMAL(12, 2) NOT NULL,
  unit VARCHAR(30) DEFAULT 'kg',
  quality VARCHAR(50) DEFAULT 'A',
  location VARCHAR(150) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  status commodity_status DEFAULT 'PENDING',
  min_weight_for_nego DECIMAL(12, 2),
  harvest_estimate TIMESTAMP,
  image TEXT,
  images JSONB DEFAULT '[]',
  video_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  rejected_reason TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commodities_farmer ON commodities(farmer_id);
CREATE INDEX idx_commodities_category ON commodities(category_id);
CREATE INDEX idx_commodities_status ON commodities(status);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_code VARCHAR(30) UNIQUE NOT NULL,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  commodity_id INT NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  negotiation_id INT,
  quantity DECIMAL(12, 2) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(14, 2) NOT NULL,
  service_fee DECIMAL(14, 2) DEFAULT 0,
  delivery_fee DECIMAL(14, 2) DEFAULT 0,
  total_price DECIMAL(14, 2) NOT NULL,
  delivery_method delivery_method DEFAULT 'PICKUP',
  delivery_address TEXT,
  recipient_name VARCHAR(100),
  recipient_phone VARCHAR(20),
  address_street TEXT,
  address_province VARCHAR(100),
  address_city VARCHAR(100),
  address_district VARCHAR(100),
  address_postal_code VARCHAR(10),
  address_notes TEXT,
  status order_status DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Payments Table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  method payment_method DEFAULT 'BANK_TRANSFER',
  amount DECIMAL(14, 2) NOT NULL,
  fee DECIMAL(14, 2) DEFAULT 0,
  status payment_status DEFAULT 'PENDING',
  reference_code VARCHAR(50),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);

-- Reviews Table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  order_id INT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity_id INT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_farmer ON reviews(farmer_id);
CREATE INDEX idx_reviews_commodity ON reviews(commodity_id);

-- Chat Rooms Table
CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity_id INT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  status chat_room_status DEFAULT 'ACTIVE',
  buyer_pinned BOOLEAN DEFAULT FALSE,
  farmer_pinned BOOLEAN DEFAULT FALSE,
  last_message TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_rooms_buyer ON chat_rooms(buyer_id);
CREATE INDEX idx_chat_rooms_farmer ON chat_rooms(farmer_id);
CREATE INDEX idx_chat_rooms_commodity ON chat_rooms(commodity_id);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type chat_message_type DEFAULT 'TEXT',
  content TEXT NOT NULL,
  offer_price DECIMAL(12, 2),
  offer_quantity DECIMAL(12, 2),
  is_read BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  reply_to_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);

-- Negotiation Offers Table
CREATE TABLE negotiation_offers (
  id SERIAL PRIMARY KEY,
  room_id INT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  commodity_id INT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price DECIMAL(12, 2) NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  unit VARCHAR(30) DEFAULT 'kg',
  status negotiation_status DEFAULT 'PENDING',
  buyer_accepted BOOLEAN DEFAULT FALSE,
  farmer_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_negotiation_room ON negotiation_offers(room_id);
CREATE INDEX idx_negotiation_buyer ON negotiation_offers(buyer_id);
CREATE INDEX idx_negotiation_farmer ON negotiation_offers(farmer_id);

-- Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  related_room_id INT REFERENCES chat_rooms(id),
  related_offer_id INT REFERENCES negotiation_offers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Wishlist Items Table
CREATE TABLE wishlist_items (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity_id INT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  transaction_type wishlist_transaction_type DEFAULT 'FIXED_PRICE',
  weight DECIMAL(12, 2),
  price DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, commodity_id)
);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_commodity ON wishlist_items(commodity_id);

-- Admin Activity Log Table
CREATE TABLE admin_activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  whatsapp VARCHAR(30),
  subject VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status contact_message_status DEFAULT 'UNREAD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);

-- Farmer Achievements Table
CREATE TABLE farmer_achievements (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT,
  attained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farmer Notes Table
CREATE TABLE farmer_notes (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity_id INT REFERENCES commodities(id),
  title VARCHAR(200),
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'lainnya',
  note_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(200),
  weather VARCHAR(100),
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farmer_notes_farmer ON farmer_notes(farmer_id);
CREATE INDEX idx_farmer_notes_commodity ON farmer_notes(commodity_id);

-- Sales Targets Table
CREATE TABLE sales_targets (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_amount DECIMAL(14, 2) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_targets_farmer ON sales_targets(farmer_id);

-- Preorders Table
CREATE TABLE preorders (
  id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity_id INT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  quantity DECIMAL(12, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  harvest_estimate TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'open',
  reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
