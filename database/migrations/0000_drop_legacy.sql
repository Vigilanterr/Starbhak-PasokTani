-- Removes the legacy Express schema (backend/migrations/001, 002). Never touches neon_auth.
DROP TABLE IF EXISTS
  support_tickets, preorders, sales_targets, farmer_notes, farmer_achievements,
  contact_messages, admin_activity_logs, wishlist_items, notifications,
  negotiation_offers, chat_messages, chat_rooms, reviews, payments, orders,
  commodities, categories, users
CASCADE;

DROP TYPE IF EXISTS
  user_role, user_status, commodity_status, order_status, delivery_method,
  payment_method, payment_status, chat_message_type, negotiation_status,
  chat_room_status, wishlist_transaction_type, contact_message_status,
  business_type, demand_scale;
