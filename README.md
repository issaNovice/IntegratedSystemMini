DVD Rental Web App (Sakila)


Prerequisites:
- Node.js LTS
- MySQL with Sakila schema installed

Setup
1) Backend
   - cd backend
   - Create .env with:
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=your_user
     DB_PASSWORD=your_password
     DB_NAME=sakila
     PORT=4000
   - npm install (already done if generated)
   - npm run dev

2) Frontend
   - cd frontend
   - npm install
   - npm run dev
   - Vite dev server proxies /api to http://localhost:4000

Features 
- Browse films with search, rating and category filters, and pagination
- Film details with categories, cast, and availability count
- Customer dashboard to view rentals by customer
- Rent endpoint to create rentals (requires inventory_id, use dashboard/custom flow)


