# Igan's Budbod House - Presentation Guide

## Presentation Structure (45-60 minutes)

---

### 1. Opening & Introduction (5-7 minutes)

#### Welcome & Greeting
- Good morning/afternoon everyone!
- Thank you for joining our final presentation for Igan's Budbud House Restaurant Management System.

#### Team Introduction
- Introduce yourself and your team members (if any)
- Briefly mention your roles in the project

#### Project Overview
- **What is Igan's Budbud House?**
  - A QR-code based restaurant ordering system
  - Designed to improve efficiency, reduce order errors, and enhance customer experience
  - Built for Igan's Budbud House, a local restaurant specializing in authentic Filipino cuisine

---

### 2. Problem Statement (3-5 minutes)

#### Challenges Faced by Traditional Restaurants
- Long wait times for customers to place orders
- Manual order taking leading to errors
- Difficulty managing tables and order status
- Lack of real-time updates for kitchen and staff
- Inefficient menu management

#### How Our System Solves These Problems
- QR code ordering for customers (self-service)
- Digital order management with real-time status tracking
- Separate dashboards for Staff, Kitchen, and Admin
- Easy menu management (add, edit, delete items)
- Analytics and sales reports

---

### 3. System Architecture & Technology Stack (5-7 minutes)

#### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas (cloud database)
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code Generation**: qrcode library

#### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Customer     │  │ Staff/Kitchen│  │ Admin Dashboard  │ │
│  │ Interface    │  │ Dashboards   │  │ (Menu, Reports,  │ │
│  │ (QR Ordering)│  │              │  │ Users, Tables)   │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  REST API Routes:                                      │ │
│  │  • /api/auth     - Authentication & Login             │ │
│  │  • /api/menu     - Menu Items & Categories            │ │
│  │  • /api/orders   - Order Management                   │ │
│  │  • /api/tables   - Table Management & QR Codes       │ │
│  │  • /api/admin    - Admin Functions                    │ │
│  │  • /api/reviews  - Customer Reviews                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ Users        │ │ Menu Items   │ │ Orders           │ │
│  │ Categories   │ │ Tables       │ │ Reviews          │ │
│  └──────────────┘ └──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Core Features & Demo (20-25 minutes)

#### 4.1 Customer Experience (QR Ordering)
- **Scan QR Code**: Customers scan QR code on their table
- **Order Type Selection**: Choose Dine-in, Take-out, or Delivery
- **Browse Menu**: View all menu items by category
- **Add to Cart**: Select items, customize quantities
- **Place Order**: Submit order to kitchen
- **Order Status Tracking**: Real-time updates (Pending → Preparing → Ready → Served)

#### 4.2 Staff Dashboard
- **View All Orders**: See all active orders
- **Update Order Status**: Mark orders as "Served"
- **Table Management**: View table statuses
- **Customer Verification**: Verify customers at tables

#### 4.3 Kitchen Dashboard
- **View Orders**: See incoming orders in real-time
- **Update Status**: Mark orders as "Preparing" → "Ready"
- **Order Details**: See items, quantities, and special instructions

#### 4.4 Admin Dashboard
- **Menu Management**:
  - Add new menu items
  - Edit existing items (name, price, description, category)
  - Delete items
  - Manage categories
- **User Management**:
  - Add new users (Staff, Kitchen, Admin)
  - Edit user roles
  - Delete users
- **Table Management**:
  - Add/Edit tables
  - Generate QR codes for tables
- **Reports & Analytics**:
  - View sales reports
  - See order history
  - Track best-selling items
- **Reviews**: View customer feedback

---

### 5. Live Demo Preparation (Critical!)

#### Before the Presentation
1. **Make sure the server is running**: `npm start` in the project root
2. **Test all features** beforehand:
   - Login as admin, staff, kitchen, and customer
   - Place a test order
   - Update order status from kitchen and staff
   - Verify menu management works
3. **Have these tabs ready in your browser**:
   - Tab 1: Admin Dashboard (http://localhost:5000/admin/dashboard.html)
   - Tab 2: Staff Dashboard (http://localhost:5000/staff.html)
   - Tab 3: Kitchen Dashboard (http://localhost:5000/kitchen.html)
   - Tab 4: Customer Menu (http://localhost:5000/index.html)
4. **Login credentials ready**:
   - Admin: admin@restaurant.com / password123
   - Staff: staff@restaurant.com / password123
   - Kitchen: kitchen@restaurant.com / password123
   - Customer: customer@restaurant.com / password123

#### Demo Flow
1. **Start with Admin Dashboard**: Show menu management
2. **Customer Ordering**: Place a new order as a customer
3. **Kitchen View**: Show how kitchen sees the order and updates status
4. **Staff View**: Show staff marking order as served
5. **Customer Status**: Show customer seeing real-time updates

---

### 6. Key Features to Highlight

- ✅ **QR Code Based Ordering**: No need for staff to take orders manually
- ✅ **Real-time Order Tracking**: Everyone sees the same up-to-date information
- ✅ **Role-based Access**: Different dashboards for Admin, Staff, Kitchen
- ✅ **Cloud Database**: MongoDB Atlas - accessible from anywhere
- ✅ **Responsive Design**: Works on mobile phones, tablets, and desktops
- ✅ **Menu Management**: Easy to update prices, add new items
- ✅ **Sales Analytics**: Track performance and best sellers

---

### 7. Challenges & Learnings (5 minutes)

#### Challenges We Faced
- **MongoDB Connection Issues**: Initially had trouble connecting to Atlas, solved by whitelisting IP and using correct connection string
- **QR Code Generation**: Ensuring QR codes work on all devices
- **Real-time Updates**: Making sure order statuses update instantly across all dashboards
- **User Authentication**: Implementing secure JWT-based login

#### What We Learned
- Full-stack development workflow
- Working with REST APIs
- Database design with MongoDB
- User experience considerations
- Project management and teamwork

---

### 8. Future Enhancements (3-5 minutes)

#### Short-term (1-3 months)
- 📱 Mobile app for iOS and Android
- 💳 Online payment integration (GCash, PayMaya, credit cards)
- 🔔 Push notifications for order status updates
- 📊 More detailed analytics and reports

#### Long-term (6-12 months)
- 🤖 AI-powered menu recommendations
- 🌐 Multi-location support (multiple branches)
- 📱 Customer loyalty program
- 📦 Inventory management system

---

### 9. Q&A Session (10-15 minutes)

#### Anticipated Questions and Answers

**Q: How secure is the system?**
A: We use JWT (JSON Web Tokens) for authentication, password hashing with bcrypt, and role-based access control to ensure data security.

**Q: What if the internet goes down?**
A: Currently, the system requires internet as it uses MongoDB Atlas. For future versions, we could implement offline-first capabilities with local caching.

**Q: Can multiple users access the system at the same time?**
A: Yes! The system is designed for concurrent use. Multiple staff, kitchen personnel, and customers can use it simultaneously.

**Q: How easy is it to update the menu?**
A: Very easy! The admin dashboard has a simple interface where you can add, edit, or delete menu items in just a few clicks.

**Q: How much does it cost to maintain?**
A: MongoDB Atlas has a free tier for development. For production, costs are minimal compared to traditional POS systems.

---

### 10. Closing (2-3 minutes)

#### Thank You
- Thank you all for your time and attention
- Special thanks to our advisor/mentor (if applicable)
- Thank you to Igan's Budbod House for the opportunity

#### Final Note
- This system is ready for deployment
- We believe it will significantly improve operations at Igan's Budbud House
- We're open to feedback and suggestions

---

## Presentation Tips & Checklist

### Day Before Presentation
- [ ] Test the system thoroughly
- [ ] Charge your laptop
- [ ] Prepare backup slides (in case demo fails)
- [ ] Check internet connection
- [ ] Practice your demo flow multiple times
- [ ] Prepare speaking notes

### Day of Presentation
- [ ] Arrive early (10-15 minutes)
- [ ] Set up your laptop and test the system
- [ ] Make sure server is running
- [ ] Check audio and video (for Google Meet)
- [ ] Have a glass of water nearby
- [ ] Take deep breaths and relax!

### During Presentation
- Speak clearly and confidently
- Maintain eye contact with the audience
- Don't rush - take your time
- If you make a mistake, laugh it off and continue
- Engage the audience - ask questions
- Be enthusiastic about your project!

---

## Quick Reference Links

- **Local Server**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin/dashboard.html
- **Staff Dashboard**: http://localhost:5000/staff.html
- **Kitchen Dashboard**: http://localhost:5000/kitchen.html
- **Customer Menu**: http://localhost:5000/index.html
- **Login Page**: http://localhost:5000/login.html

---

## Explanation of Admin Dashboard and Reports & Analytics Graphs

### Admin Dashboard Graphs
1. **7-Day Revenue (Bar Chart)**
   - **Purpose**: Shows daily revenue for the last 7 days
   - **Relevance**: Helps the restaurant track daily sales trends, see which days are busiest, and identify patterns in customer spending
   - **How to use**: Compare revenue across days to see if weekends are busier, or if there are slow days that need promotion

2. **Top Menu Items (Doughnut Chart)**
   - **Purpose**: Displays the 5 most ordered menu items
   - **Relevance**: Shows which items are popular, helping the restaurant decide which items to keep, promote, or possibly remove if not selling
   - **How to use**: Identify best-sellers to highlight on the menu or create special offers around them

3. **Order Status Overview (Progress Bars)**
   - **Purpose**: Shows the current count of orders in each status (Pending, Preparing, Ready, Served, Cancelled)
   - **Relevance**: Helps admin quickly see how busy the kitchen is, if there are any bottlenecks, and how many orders are waiting to be served
   - **How to use**: Monitor in real-time to ensure orders are being processed efficiently

### Reports & Analytics Graphs
1. **Monthly Sales (Bar Chart) – Current Year**
   - **Purpose**: Shows total revenue for each month of the current year
   - **Relevance**: Tracks long-term sales trends, helps with budgeting and forecasting, and identifies seasonal patterns
   - **How to use**: See which months have the highest sales, plan for busy seasons, and set sales goals

2. **Order Volume (Line Chart) – Monthly**
   - **Purpose**: Shows the number of orders per month for the current year
   - **Relevance**: Tracks how many orders the restaurant receives each month, which helps with staffing and inventory planning
   - **How to use**: Compare order volume to revenue to see if average order value is increasing or decreasing

3. **Quarterly Performance (Bar Chart)**
   - **Purpose**: Shows total revenue broken down by quarter (Q1, Q2, Q3, Q4)
   - **Relevance**: Provides a high-level view of annual performance, making it easy to see how the restaurant is doing overall
   - **How to use**: Present to stakeholders or use for annual planning

4. **Order Status Breakdown (Doughnut Chart)**
   - **Purpose**: Shows the percentage of orders in each status across all time
   - **Relevance**: Helps identify any long-term issues, like if too many orders are being cancelled
   - **How to use**: Analyze to improve order processing and reduce cancellations

5. **Top 5 Most Ordered Items (Horizontal Bar Chart) + Leaderboard Table**
   - **Purpose**: Detailed view of the 5 most ordered menu items of all time, with a visual bar chart and a table showing exact order counts
   - **Relevance**: Helps with menu planning, inventory management, and marketing decisions
   - **How to use**: Keep popular items in stock, create combo meals with best-sellers, and consider adding similar items

---

## How to Reset Dashboard Stats (Today's Orders, Today's Revenue, etc.)

The dashboard stats (Today's Orders, Today's Revenue) are automatically calculated based on orders from today (midnight to current time). They **reset automatically every day at midnight**.

However, if you want to manually reset them for testing purposes:

1. **Option 1: Delete Today's Orders (Temporary)**
   - Go to the Admin Orders page
   - Delete any orders placed today
   - The dashboard will update automatically (click "Refresh" if needed)

2. **Option 2: Re-seed the Database (Complete Reset)**
   - This will reset ALL data (orders, users, menu, etc.) to the initial state
   - In the backend directory, run:
     ```bash
     npm run seed
     ```
   - This will delete all existing data and repopulate with sample data
   - **WARNING**: Only do this for testing! This will delete all real orders and data!

---

Good luck with your presentation! You've got this! 🎉
