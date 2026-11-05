# PasokTani Backend — Feature Mapping from Starbhak Kompasdesa

## Overview
Starbhak Kompasdesa is a Next.js fullstack marketplace. This document maps legacy features to PasokTani REST API backend categories: **KEEP** (migrate), **IMPROVE** (enhance), **DROP** (not needed).

---

## Feature Mapping Table

| Fitur Lama | Kategori | Implementasi Baru | Keterangan |
|---|---|---|---|
| **Authentication** | KEEP | Auth Module | JWT + password hashing + role check |
| **Registration** | KEEP | Auth Module | Email validation + pending status |
| **Login** | KEEP | Auth Module | Email/password + token generation |
| **Role Management** (admin/petani/pembeli) | KEEP | Auth Module | Enum-based, 3-tier RBAC |
| **User Verification** | KEEP | Admin Module | 2-step: account + commodity verification |
| **Account Suspension** | KEEP | Admin Module | Reversible status change + audit |
| **Password Reset** | KEEP | Auth Module | Email + verification code flow |
| **User Management** | KEEP | Admin Module | Full CRUD + search + status filters |
| **Farmer Profile Management** | KEEP | Farmer Module | Bio, farm experience, area, method, village |
| **Buyer Profile Management** | KEEP | Buyer Module | Preference tracking, business type |
| **Profile Upgrade (pembeli→petani)** | KEEP | Farmer Module | Role promotion + verification queue |
| **Product CRUD** | KEEP | Product Module | Full lifecycle + stock mgmt |
| **Product Images** | KEEP | Product Module | Multi-image JSON + primary image |
| **Stock Management** | KEEP | Product Module | Numeric updates + auto status (sold_out) |
| **Product Categorization** | KEEP | Category Module | Taxonomy + commodity count stats |
| **Product Publishing** | KEEP | Product Module | isPublished gate + status combo (published ∧ (available\|verified)) |
| **Order Creation** | KEEP | Order Module | Stock reservation + fee calc (2.5% service) |
| **Order Status Workflow** | KEEP | Order Module | pending→confirmed→processing→shipped→completed\|cancelled |
| **Delivery Methods** | KEEP | Order Module | Pickup (no fee) + Expedition (25k) |
| **Delivery Address Handling** | KEEP | Order Module | Full address capture (street/city/district/postal) |
| **Payment Integration (Midtrans)** | KEEP | Payment Module | Webhook sync + status auto-update |
| **Payment Methods** | KEEP | Payment Module | bank_transfer, virtual_account, ewallet, qris, cod |
| **Chat System** | KEEP | Chat Module | Real-time rooms + message history |
| **Negotiation (offer/counter/accept)** | KEEP | Negotiation Module | Dual-acceptance required → auto order |
| **Negotiation Price Constraints** | KEEP | Negotiation Module | minPrice, maxPrice, fixedPrice validation |
| **Minimum Weight for Negotiation** | KEEP | Negotiation Module | minWeightForNego check |
| **Review & Rating** | KEEP | Review Module | Post-completion feedback + aggregation |
| **Farmer Rating Aggregation** | KEEP | Review Module | AVG(rating) across all reviews |
| **Product Rating Aggregation** | KEEP | Review Module | AVG(rating) per commodity |
| **Wishlist** | KEEP | Wishlist Module | Save for later + transaction type tracking (nego\|fixed) |
| **Notifications** | KEEP | Notification Module | Event-driven alerts + read/unread toggle |
| **Dashboard (Farmer)** | KEEP | Dashboard Module | Summary stats (products, orders, sales, revenue) |
| **Dashboard (Admin)** | KEEP | Dashboard Module | Platform-wide KPIs + user/order/payment counts |
| **Reports (Finance)** | KEEP | Reports Module | Revenue, transactions, payment status |
| **Reports (Stock)** | KEEP | Reports Module | Stock levels, pergerakan, low-stock alerts |
| **Reports (Rating)** | KEEP | Reports Module | Farmer + product rating distribution |
| **Audit Logging** | KEEP | Admin Module | Admin actions → admin_activity_log |
| **Category Management** | KEEP | Category Module | Admin CRUD (restrict delete if in use) |
| **Contact/Inquiry Form** | KEEP | Contact Module | Public non-auth form + admin inbox |
| **Fee Settings** | KEEP | Admin Module | Category-based fee % configuration |
| **Search & Recommendation** | KEEP | Search Module | Product search + farmer discovery |
| **Public Farmer Browsing** | KEEP | Search Module | Farmer list + rating + commodity count |
| **Achievement System** | IMPROVE | Achievement Module | Trigger-based badges (first sale, n transactions, n rating) |
| **Farmer Notes/Journal** | IMPROVE | Notes Module | Farming journal with category + tags + location/weather |
| **Sales Targets** | IMPROVE | Target Module | Farmer goal setting + progress tracking |
| **Harvest Management** | IMPROVE | Harvest Module | Preorder + harvest estimate + availability tracking |
| **Chatbot (AI Assistant)** | DROP | - | Resource-intensive, LLM dependency, can phase 2 |
| **Chatbot KB Articles** | DROP | - | Associated with chatbot |
| **Preorder System** (legacy orders_commodity table) | IMPROVE | Preorder Module | Distinct from purchase orders + status workflow |
| **Help Ticket System** | KEEP | Support Module | User-submitted tickets + admin response |
| **File Upload (Cloudinary)** | KEEP | Upload Service | Abstract service layer for image storage |
| **Email Notifications** | KEEP | Email Service | Nodemailer integration for order/review alerts |
| **Admin Activity Log** | KEEP | Admin Module | Audit trail table + queries |

---

## Business Rules Summary

### Authentication & Authorization
- **3 Roles:** Admin (platform), Petani (farmer/seller), Pembeli (buyer/customer)
- **User Status:** pending → verified | rejected | suspended
- **Verification:** 2-step process (account verification + commodity verification for farmers)
- **Password:** bcrypt hashing, 6+ chars minimum
- **Tokens:** JWT (httpOnly cookie), stateless

### Products & Inventory
- **Status Workflow:** pending (awaiting admin) → verified → available | rejected | sold_out
- **Publication:** Only public if `isPublished=true` AND status ∈ {available, verified}
- **Stock:** Numeric (fractional allowed), auto-transitions to sold_out if ≤0
- **Pricing:** Fixed price OR negotiation range (minPrice, maxPrice) with optional minimum weight
- **Quality Grades:** Product quality field (e.g., A, B, C)
- **Location:** String location field for geographic filtering

### Orders & Payments
- **Order Code:** KD-(YYMMDD)-(6-char random) format
- **Status Workflow:** pending → confirmed → processing → shipped → completed | cancelled
- **Fees:** Service fee = 2.5% of subtotal; Delivery fee = 0 (pickup) | 25,000 (expedition)
- **Payment Methods:** bank_transfer, virtual_account, ewallet, qris, cod
- **Stock Reservation:** Atomic with order creation (no double-booking)
- **Midtrans Webhook:** Syncs payment status changes; auto-confirms order on payment success

### Negotiation & Chat
- **Workflow:** Buyer initiates offer → Farmer counter-offers | accepts | rejects → Dual acceptance → Auto order creation
- **Price Validation:** Offer price must be within product minPrice..maxPrice (or match fixedPrice)
- **Minimum Quantity:** Negotiation requires qty ≥ minWeightForNego (if set)
- **Chat Rooms:** Triple key (buyerId, farmerId, commodityId); one room per buyer-farmer-product combo
- **Message Types:** text, offer, counter_offer, accept, reject, system
- **Order from Negotiation:** Pickup method only (no expedition fee); payment method = agreed price

### Reviews & Ratings
- **Eligibility:** Only post-completion (order.status = completed)
- **Aggregation:** AVG(rating) stored on commodity.rating + farmer rating level
- **One Review Per Order:** Idempotent (no duplicates)
- **Notification:** Farmer receives notification on new review

### Notifications
- **Trigger Events:** Register, verify/reject, upgrade, order create, payment, review, suspension
- **Types:** info, system, commodity, order, review, chat
- **Linking:** relatedRoomId (chat context), relatedOfferId (negotiation context)

### Farmer Features
- **Dashboard:** Total products, active/sold out, total orders, pending orders, total sales, revenue, top products, recent activity
- **Reports (Finance):** Revenue, transactions, payment status, date filters, period summaries
- **Reports (Stock):** Current stock, low-stock alerts, history of changes, transaction-based movement
- **Reports (Rating):** Store rating, product ratings, review count, rating distribution, buyer feedback
- **Achievements:** Badge system triggered by milestones (first sale, n transactions, n rating threshold)
- **Notes:** Farming journal per commodity or general, with category + tags + location + weather
- **Targets:** Monthly/custom sales goals + progress tracking
- **Preorders:** Distinct from regular orders; tracks buyers waiting for harvest + status

### Admin Features
- **Dashboard:** Users count, farmers, buyers, commodities, active orders, total payments, revenue
- **Verification:** 2-step approval (user account + per-commodity) with mandatory rejection reasons
- **Audit Log:** Every admin action logged (verify, suspend, update user/commodity, fee changes)
- **Fee Settings:** Category-based service fee % configuration
- **User Management:** Full CRUD, status changes, role assignment, suspension/restore
- **Commodity Moderation:** Approve/reject with reason; view flagged/rejected items
- **Payment Monitoring:** Search/filter orders by payment status/method
- **Contact Inbox:** Manage inquiry messages from public

---

## Database Tables (Core)

```
users_table
├── id (PK)
├── username, fullName, email (unique), password (bcrypt)
├── role (enum: admin|petani|pembeli)
├── status (enum: pending|verified|rejected|suspended)
├── phone, address, bio, farmingExperience, farmArea, farmingMethod, village
├── businessType, preferredCommodity, demandScale
├── fotoProfile, createdAt

categories_table
├── id (PK)
├── name (unique), description, icon
├── createdAt

commodities_table
├── id (PK)
├── farmerId (FK users)
├── categoryId (FK categories)
├── name, description, price, minPrice, maxPrice, fixedPrice
├── stock, unit, quality, location
├── isPublished, status (enum: pending|verified|rejected|available|sold_out)
├── minWeightForNego, harvestEstimate
├── image (FK ImageUpload), images (JSON), videoUrl
├── rating (AVG), reviewCount
├── rejectedReason, reviewedAt, reviewedBy (FK users)
├── createdAt

orders_table
├── id (PK)
├── orderCode (unique), buyerId (FK), farmerId (FK), commodityId (FK), negotiationId (FK)
├── quantity, unitPrice, subtotal, serviceFee, deliveryFee, totalPrice
├── deliveryMethod (enum: pickup|expedition)
├── deliveryAddress, recipientName, recipientPhone
├── addressStreet, addressCity, addressProvince, addressDistrict, addressPostalCode, addressNotes
├── status (enum: pending|confirmed|processing|shipped|completed|cancelled)
├── notes, createdAt, updatedAt

payments_table
├── id (PK)
├── orderId (FK), buyerId (FK)
├── method (enum: bank_transfer|virtual_account|ewallet|qris|cod)
├── amount, fee, status (enum: pending|paid|failed|refunded)
├── referenceCode, paidAt, createdAt

reviews_table
├── id (PK)
├── orderId (FK), buyerId (FK), farmerId (FK), commodityId (FK)
├── rating (1-5), comment, createdAt

chat_rooms_table
├── id (PK)
├── buyerId (FK), farmerId (FK), commodityId (FK)
├── status (enum: active|closed)
├── buyerPinned, farmerPinned
├── lastMessage, lastMessageAt, createdAt

chat_messages_table
├── id (PK)
├── roomId (FK), senderId (FK users)
├── type (enum: text|offer|counter_offer|accept|reject|system)
├── content, offerPrice, offerQuantity
├── isRead, isEdited, isDeleted, replyToId
├── createdAt

negotiation_offers_table
├── id (PK)
├── roomId (FK), commodityId (FK), buyerId (FK), farmerId (FK)
├── price, quantity, unit
├── status (enum: pending|counter_offer|accepted|rejected|expired|cancelled)
├── buyerAccepted, farmerAccepted, acceptedAt, createdAt

wishlist_items_table
├── id (PK)
├── userId (FK), commodityId (FK)
├── transactionType (enum: nego|fixed_price)
├── weight, price, createdAt

notifications_table
├── id (PK)
├── userId (FK)
├── title, message, type (enum: info|system|commodity|order|review|chat)
├── isRead, relatedRoomId, relatedOfferId, createdAt

contact_messages_table
├── id (PK)
├── name, email, whatsapp, subject, message
├── status (enum: unread|read), createdAt, updatedAt

admin_activity_log_table
├── id (PK)
├── adminId (FK users)
├── action, entityType, entityId, reason, metadata (JSON)
├── createdAt

... (achievement, notes, target, harvest, ImageUpload, verificationCode, etc.)
```

---

## Phase-wise Implementation Plan

### PHASE 1: CORE SETUP
- [ ] Express.js + TypeScript + Prisma
- [ ] Database migration (PostgreSQL schema)
- [ ] JWT auth middleware
- [ ] Error handling + validation layer
- [ ] Types/DTOs

### PHASE 2: AUTH & USERS
- [ ] Register/login/logout endpoints
- [ ] Password reset flow
- [ ] Role-based middleware
- [ ] User profile CRUD

### PHASE 3: PRODUCTS & CATEGORIES
- [ ] Category CRUD
- [ ] Product CRUD (farmer-owned)
- [ ] Stock management
- [ ] Product images (Cloudinary)
- [ ] Public product listing + search

### PHASE 4: ORDERS & PAYMENTS
- [ ] Order creation + stock reservation
- [ ] Midtrans integration + webhook
- [ ] Order status workflow
- [ ] Delivery address handling

### PHASE 5: CHAT & NEGOTIATION
- [ ] Chat room management
- [ ] Message send/fetch
- [ ] Offer/counter-offer flow
- [ ] Auto-order on dual acceptance

### PHASE 6: REVIEWS & RATINGS
- [ ] Post-order review creation
- [ ] Rating aggregation (commodity + farmer)
- [ ] Review listing

### PHASE 7: FARMER FEATURES
- [ ] Dashboard stats
- [ ] Reports (finance, stock, rating)
- [ ] Achievements
- [ ] Notes/Journal
- [ ] Targets
- [ ] Preorder management

### PHASE 8: ADMIN FEATURES
- [ ] Admin dashboard
- [ ] User verification workflow
- [ ] Commodity verification
- [ ] Audit logging
- [ ] Fee settings
- [ ] Contact inbox

### PHASE 9: SECONDARY FEATURES
- [ ] Wishlist
- [ ] Notifications
- [ ] Help/Support tickets
- [ ] Search + recommendation

### PHASE 10: QA & DEPLOYMENT
- [ ] Integration testing
- [ ] Load testing
- [ ] Documentation (OpenAPI/Swagger)
- [ ] Git commit + push to develop

---

## API Endpoint Skeleton

```
/api/v1/auth
  POST /register
  POST /login
  POST /logout
  POST /refresh-token
  POST /forgot-password
  POST /reset-password
  GET /me

/api/v1/users
  GET /:id
  PATCH /:id
  GET /me/profile

/api/v1/farmers
  GET (search/browse)
  GET /:id
  GET /me/dashboard
  GET /me/reports/finance
  GET /me/reports/stock
  GET /me/reports/rating
  PATCH /me/profile
  GET /me/achievements
  GET /me/notes
  POST /me/notes
  GET /me/targets
  POST /me/targets
  GET /me/preorders

/api/v1/products
  GET (search/filter)
  GET /:id
  POST (farmer create)
  PATCH /:id (farmer update)
  DELETE /:id (farmer delete)
  GET /me/products (farmer's products)
  PATCH /:id/stock (farmer update stock)
  PATCH /:id/publish (toggle publication)

/api/v1/categories
  GET
  POST (admin)
  PATCH /:id (admin)
  DELETE /:id (admin)

/api/v1/orders
  POST (create)
  GET (list buyer/farmer)
  GET /:id (detail)
  PATCH /:id/status (update status)

/api/v1/payments
  POST /callback/midtrans (webhook)
  GET /orders/:orderId (payment status)

/api/v1/chat
  GET /rooms (user's chat rooms)
  GET /rooms/:roomId (detail)
  GET /rooms/:roomId/messages (history)
  POST /rooms/:roomId/messages (send)
  POST /rooms/:roomId/pin (toggle pin)
  POST /rooms/:roomId/close

/api/v1/negotiation
  POST /rooms/:roomId/offer (send offer)
  PATCH /offers/:offerId/status (accept/reject)
  GET /rooms/:roomId/offer (current pending offer)

/api/v1/reviews
  POST /orders/:orderId (create review)
  GET /farmers/:farmerId (farmer reviews)
  GET /commodities/:commodityId (product reviews)

/api/v1/wishlist
  GET
  POST (add)
  DELETE /:itemId (remove)
  POST /:itemId/toggle

/api/v1/notifications
  GET
  PATCH /mark-read
  DELETE /:id

/api/v1/admin
  GET /dashboard
  GET /users (search/filter)
  GET /users/:id
  PATCH /users/:id/status (verify/suspend)
  GET /commodities (pending list)
  PATCH /commodities/:id/verify
  GET /audit-logs
  GET /contact-messages
  PATCH /contact-messages/:id/mark-read
  GET /fee-settings
  POST /fee-settings
  PATCH /fee-settings/:id

/api/v1/contact
  POST (public inquiry)

/api/v1/search
  GET (search products/farmers)

/api/v1/support
  POST /tickets (create)
  GET /tickets (user list)
  GET /tickets/:id (detail)
```

---

## Decisions & Assumptions

1. **No Real-time WebSocket:** Chat is REST polling initially. SSE/WebSocket added only if required.
2. **Preorder:** Separate from orders; tracked distinctly with different status workflow.
3. **Aggregations:** Rating computed on-demand or batch; no separate materialized view initially.
4. **Audit Logging:** Best-effort (non-blocking); failures logged but don't block main action.
5. **Email:** Nodemailer integration for verification + order/review notifications.
6. **Image Upload:** Cloudinary service; REST endpoint returns URLs.
7. **Payment:** Midtrans webhook handles async status updates; polling fallback if webhook fails.
8. **Admin Verification:** Always 2-step (user account + commodity); both required before farmer can sell.

---

## Files & Documentation

- `ARCHITECTURE.md` — Detailed system design + data flow
- `DATABASE-DESIGN.md` — Schema + migration strategy
- `API-DOCUMENTATION.md` — Full endpoint specs (OpenAPI)
- `MIGRATION-NOTES.md` — Data migration from old system
- `README.md` — Setup + deployment guide

---

**Status:** Ready for PHASE 1 backend initialization.
