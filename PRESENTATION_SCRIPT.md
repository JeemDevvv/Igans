# Igan's Budbod House - Presentation Script

---

## [Speaker 1]


**Good morning/afternoon everyone!** Thank you so much for joining our final presentation today. We're really excited to show you what we've been working on for the past few months.

First, let me introduce our team. I'm [Your Name], and with me today are [Team Member 2 Name], [Team Member 3 Name], and [Team Member 4 Name]. Together, we've developed a restaurant management system specifically for Igan's Budbud House.

---

## [Speaker 2]

So, why did we develop this system? Well, as students who love eating out, we've all experienced the frustrations of traditional restaurant ordering. You know, waiting forever just to get a menu, then waiting again to place your order, and sometimes even getting the wrong food because of manual errors.

The traditional ordering process in restaurants is really outdated. Let me tell you about the problems we identified:

First, **long wait times for customers to place orders**. Customers have to flag down a server, which can take ages when the restaurant is busy.

Second, **manual order taking leads to errors**. Servers write down orders on paper, and sometimes they mishear or miswrite items, leading to wrong orders and unhappy customers.

Third, **difficulty managing tables and order status**. It's hard for staff to keep track of which tables have ordered, which orders are being prepared, and which are ready to serve.

Fourth, **lack of real-time updates for kitchen and staff**. The kitchen doesn't know when new orders come in unless a server brings the ticket, and staff don't know when orders are ready unless the kitchen tells them.

And fifth, **inefficient menu management**. If the restaurant wants to change prices or add new items, they have to reprint all the menus, which is time-consuming and expensive.

---

## [Speaker 1]

To solve all these problems, we developed a QR code and location-based ordering system with AI food recommendation for Igan's Budbud House!

Here's how our system solves these issues:

First, **QR code ordering for customers with self-service**. Customers just scan the QR code on their table, browse the menu, and place their order directly from their phone—no need to wait for a server!

Second, **digital order management with real-time status tracking**. Every order is in the system, and everyone can see the status updated instantly.

Third, **separate dashboards for Staff, Kitchen, and Admin**. Each role has their own view with the information they need.

Fourth, **easy menu management—add, edit, delete items in just a few clicks**. No more reprinting menus!

And fifth, **analytics and sales reports** so the restaurant can see what's selling well and make data-driven decisions.

---

## [Speaker 3]

Now let's talk about the system features!

First, the **Customer Experience**: Customers scan the QR code, select their order type—dine-in, take-out, or delivery—browse the menu by category, add items to their cart, and place the order. Then they can track the status in real-time: Pending, Preparing, Ready, and Served.

Next, the **Staff Dashboard**: Staff can see all active orders, update the status to "Served" when food is delivered, manage tables, and verify customers.

Then the **Kitchen Dashboard**: The kitchen sees incoming orders in real-time, updates the status from Pending to Preparing to Ready, and sees all the order details—items, quantities, any special instructions.

And finally, the **Admin Dashboard**: This is where the magic happens! Admin can manage the menu—add new items, edit prices, delete items. They can manage users—add staff, kitchen, or other admins. They can manage tables and generate QR codes. They can view sales reports and analytics, and see customer reviews.

---

## [Speaker 4]

Now let's talk about the technology stack we used to develop this system!

For the **Frontend**, we used plain old HTML5, CSS3, and Vanilla JavaScript—no fancy frameworks, just simple, clean code that works everywhere.

For the **Backend**, we used Node.js with Express.js—it's fast, lightweight, and perfect for building REST APIs.

For the **Database**, we used MongoDB Atlas, which is a cloud database—so it's accessible from anywhere, and we don't have to worry about maintaining a local server.

For **Authentication**, we used JWT, or JSON Web Tokens—secure, stateless authentication that works great for web apps.

And for **QR Code Generation**, we used the qrcode library for Node.js—super easy to use and generates scannable QR codes for every table.

---

## [Speaker 1]

Okay, now let's move on to the live demo! This is the part we're most excited about—showing you the system in action!

*(Proceed with the live demo as planned)*

---

## [Speaker 2]

Great! Now, before we open it up for questions, let's talk about some possible questions you might have.

First question we get a lot: **"How about the admin forgot the password? How can the admin recover the account if you don't have a forget password on your login page?"**

That's a great question! Right now, our system doesn't have a "forgot password" feature because we wanted to keep the initial version simple. But for the production version, we definitely plan to add password recovery via email. In the meantime, if an admin forgets their password, another admin can reset it for them through the admin dashboard, or we can reset it directly in the database.

Another common question: **"How secure is the system?"**

We take security very seriously! We use JWT for authentication, we hash passwords with bcrypt (which is a very secure hashing algorithm), and we have role-based access control—so each user only has access to the features they need.

**"What if the internet goes down?"**

Right now, the system does require internet because we use MongoDB Atlas, a cloud database. But for future versions, we're planning to add offline-first capabilities with local caching, so the system can still work even if the internet goes down temporarily.

**"Can multiple users access the system at the same time?"**

Absolutely! The system is designed for concurrent use—multiple staff, kitchen personnel, and customers can all use it at the same time without any issues.

**"How easy is it to update the menu?"**

Super easy! The admin dashboard has a really simple interface—you can add, edit, or delete menu items in just a few clicks. No technical knowledge required!

And **"How much does it cost to maintain?"**

MongoDB Atlas has a free tier for development, which is what we're using now. For production, the costs are minimal—way cheaper than traditional POS systems.

---

## [Speaker 3]

Okay, now we're ready for your questions! Feel free to ask us anything about the system, the development process, or our future plans.

*(Q&A Session)*

---

## [Speaker 4]

Thank you all so much for your time and attention today! We really appreciate you listening to our presentation.

We want to give a special thank you to our advisor/mentor [Name], who guided us through this project. And of course, thank you to Igan's Budbud House for giving us this opportunity to build something that could actually help their business.

We believe this system is ready for deployment, and we really think it will make a big difference in the daily operations of Igan's Budbud House—reducing wait times, minimizing errors, and making the whole experience better for both customers and staff.

We're always open to feedback and suggestions, so if you have any ideas for how we can improve the system, we'd love to hear them!

Thank you again, and have a great rest of your day!
