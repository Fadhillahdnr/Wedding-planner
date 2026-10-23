# Database
users(role) · packages→package_features · vendor_categories→vendors · portfolio_projects · faqs · media_assets(polymorphic mediable) · consultation_leads · events→tasks, budget_items · bookings→booking_status_histories · saved_vendors.
Uang: `decimal(14,2)` + `currency` (IDR). Status disimpan sebagai string yang divalidasi enum PHP. Index pada kolom status/slug/city. Migrasi di `database/migrations`.
