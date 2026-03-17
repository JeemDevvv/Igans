require('dotenv').config({ path: './config/config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const RestaurantSettings = require('../models/RestaurantSettings');
const QRCode = require('qrcode');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  await User.deleteMany({});
  await Category.deleteMany({});
  await MenuItem.deleteMany({});
  await Table.deleteMany({});
  await RestaurantSettings.deleteMany({});

  // Settings
  await RestaurantSettings.create({
    restaurantName: 'La Maison Restaurant',
    latitude: 14.5995,
    longitude: 120.9842,
    allowedRadiusMeters: 500,
    address: '123 Bonifacio Ave, Manila, Philippines',
    phone: '+63 912 345 6789',
    openHours: '10:00 AM – 10:00 PM',
    currency: '₱'
  });
  console.log('✅ Settings seeded');

  // Users
  const pass = await bcrypt.hash('password123', 12);
  await User.insertMany([
    { name: 'Admin User', email: 'admin@restaurant.com', password: pass, role: 'admin' },
    { name: 'Kitchen Staff', email: 'kitchen@restaurant.com', password: pass, role: 'kitchen' },
    { name: 'Floor Staff', email: 'staff@restaurant.com', password: pass, role: 'staff' },
    { name: 'John Customer', email: 'customer@restaurant.com', password: pass, role: 'customer' }
  ]);
  console.log('✅ Users seeded');

  // Categories
  const cats = await Category.insertMany([
    { name: 'Main Course', icon: '🍛', sortOrder: 1 },
    { name: 'Appetizers', icon: '🥗', sortOrder: 2 },
    { name: 'Pasta & Noodles', icon: '🍝', sortOrder: 3 },
    { name: 'Grilled & BBQ', icon: '🔥', sortOrder: 4 },
    { name: 'Seafood', icon: '🦐', sortOrder: 5 },
    { name: 'Desserts', icon: '🍰', sortOrder: 6 },
    { name: 'Drinks', icon: '🥤', sortOrder: 7 },
    { name: 'Snacks', icon: '🍟', sortOrder: 8 }
  ]);
  const catMap = {};
  cats.forEach(c => { catMap[c.name] = c._id; });
  console.log('✅ Categories seeded');

  // Menu Items
  const menuItems = [
    // Main Course
    { name: 'Chicken Adobo', description: 'Classic Filipino braised chicken in soy sauce, vinegar, and garlic', category: catMap['Main Course'], price: 180, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400', available: true, tags: ['chicken', 'filipino'], isFeatured: true, isBestSeller: true, orderCount: 245 },
    { name: 'Beef Kare-Kare', description: 'Braised oxtail and vegetables in rich peanut sauce', category: catMap['Main Course'], price: 320, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', available: true, tags: ['beef', 'peanut', 'filipino'], isBestSeller: true, orderCount: 189 },
    { name: 'Spicy Pork Sinigang', description: 'Sour tamarind broth with pork ribs and fresh vegetables', category: catMap['Main Course'], price: 250, image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', available: true, tags: ['pork', 'spicy', 'sour', 'soup', 'filipino'], isFeatured: true, orderCount: 156 },
    { name: 'Crispy Pata', description: 'Deep-fried pork knuckle, golden and crispy outside, tender inside', category: catMap['Main Course'], price: 450, image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400', available: true, tags: ['pork', 'crispy', 'fried'], orderCount: 98 },
    { name: 'Lechon Kawali', description: 'Crispy deep-fried pork belly served with liver sauce', category: catMap['Main Course'], price: 280, image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400', available: true, tags: ['pork', 'crispy', 'fried', 'affordable'], orderCount: 134 },
    // Appetizers
    { name: 'Lumpia Shanghai', description: 'Crispy mini spring rolls filled with seasoned ground pork', category: catMap['Appetizers'], price: 120, image: 'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=400', available: true, tags: ['pork', 'crispy', 'snack', 'affordable'], isBestSeller: true, orderCount: 310 },
    { name: 'Tokwa\'t Baboy', description: 'Crispy fried tofu and pork ears in vinegar-soy dipping sauce', category: catMap['Appetizers'], price: 150, image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400', available: true, tags: ['tofu', 'pork', 'affordable'], orderCount: 88 },
    { name: 'Sisig Platter', description: 'Sizzling chopped pork face with onions, chili, and calamansi', category: catMap['Appetizers'], price: 220, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', available: true, tags: ['pork', 'spicy', 'sizzling'], isFeatured: true, orderCount: 201 },
    // Pasta & Noodles
    { name: 'Pancit Canton', description: 'Stir-fried thick noodles with vegetables, pork, and shrimp', category: catMap['Pasta & Noodles'], price: 160, image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400', available: true, tags: ['noodles', 'seafood', 'affordable'], isBestSeller: true, orderCount: 178 },
    { name: 'Palabok', description: 'Rice noodles topped with shrimp sauce, chicharon, and boiled eggs', category: catMap['Pasta & Noodles'], price: 170, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400', available: true, tags: ['noodles', 'seafood', 'shrimp'], orderCount: 123 },
    { name: 'Spaghetti Filipino Style', description: 'Sweet-style spaghetti with hotdog slices and special meat sauce', category: catMap['Pasta & Noodles'], price: 140, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', available: true, tags: ['pasta', 'sweet', 'affordable'], orderCount: 95 },
    // Grilled & BBQ
    { name: 'Inihaw na Liempo', description: 'Grilled marinated pork belly with dipping sauce and atchara', category: catMap['Grilled & BBQ'], price: 260, image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', available: true, tags: ['pork', 'grilled', 'bbq'], isFeatured: true, isBestSeller: true, orderCount: 267 },
    { name: 'BBQ Chicken Inasal', description: 'Visayan-style grilled chicken marinated in lemongrass and spices', category: catMap['Grilled & BBQ'], price: 230, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400', available: true, tags: ['chicken', 'grilled', 'bbq'], isBestSeller: true, orderCount: 234 },
    { name: 'Pork BBQ Skewers', description: 'Sweet marinated pork on bamboo skewers, grilled to perfection', category: catMap['Grilled & BBQ'], price: 50, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', available: true, tags: ['pork', 'bbq', 'skewer', 'affordable'], orderCount: 412 },
    // Seafood
    { name: 'Grilled Bangus', description: 'Marinated milkfish stuffed with tomatoes and onions, char-grilled', category: catMap['Seafood'], price: 280, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', available: true, tags: ['fish', 'seafood', 'grilled', 'healthy'], isFeatured: true, orderCount: 143 },
    { name: 'Garlic Butter Shrimp', description: 'Jumbo shrimp sautéed in garlic butter with parsley', category: catMap['Seafood'], price: 350, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', available: true, tags: ['shrimp', 'seafood', 'garlic'], isBestSeller: true, orderCount: 167 },
    { name: 'Spicy Tuna Kinilaw', description: 'Fresh tuna cured in vinegar with chili, ginger, and coconut milk', category: catMap['Seafood'], price: 300, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', available: true, tags: ['fish', 'seafood', 'spicy', 'raw'], orderCount: 89 },
    // Desserts
    { name: 'Halo-Halo Supreme', description: 'Classic Filipino shaved ice dessert with mixed sweet toppings and ube ice cream', category: catMap['Desserts'], price: 150, image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', available: true, tags: ['cold', 'sweet', 'dessert', 'affordable'], isBestSeller: true, orderCount: 298 },
    { name: 'Leche Flan', description: 'Silky smooth Filipino caramel custard', category: catMap['Desserts'], price: 90, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', available: true, tags: ['sweet', 'custard', 'dessert', 'affordable'], orderCount: 187 },
    { name: 'Ube Cheesecake', description: 'Creamy purple yam cheesecake with graham cracker crust', category: catMap['Desserts'], price: 180, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', available: true, tags: ['sweet', 'ube', 'dessert'], isFeatured: true, orderCount: 134 },
    // Drinks
    { name: 'Fresh Buko Juice', description: 'Cold fresh coconut water straight from the buko', category: catMap['Drinks'], price: 80, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400', available: true, tags: ['cold', 'healthy', 'drink', 'affordable'], isBestSeller: true, orderCount: 356 },
    { name: 'Calamansi Lemonade', description: 'Refreshing local citrus lemonade with a hint of honey', category: catMap['Drinks'], price: 90, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', available: true, tags: ['cold', 'sour', 'drink', 'affordable'], orderCount: 223 },
    { name: 'Iced Café de Pinas', description: 'Cold brewed local Philippine coffee over ice with sweet cream', category: catMap['Drinks'], price: 120, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', available: true, tags: ['coffee', 'cold', 'drink'], orderCount: 189 },
    { name: 'Mango Shake', description: 'Creamy blend of fresh Philippine Carabao mangoes and milk', category: catMap['Drinks'], price: 130, image: 'https://images.unsplash.com/photo-1560508180-03f285f67ded?w=400', available: true, tags: ['mango', 'cold', 'sweet', 'drink'], isFeatured: true, orderCount: 278 },
    // Snacks
    { name: 'Cheese Fries', description: 'Crispy golden fries topped with melted cheese sauce and bacon bits', category: catMap['Snacks'], price: 110, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', available: true, tags: ['crispy', 'cheese', 'snack', 'affordable'], orderCount: 245 },
    { name: 'Buffalo Wings', description: 'Crispy chicken wings tossed in spicy buffalo sauce with blue cheese dip', category: catMap['Snacks'], price: 200, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', available: true, tags: ['chicken', 'spicy', 'crispy', 'snack'], isBestSeller: true, orderCount: 312 }
  ];
  await MenuItem.insertMany(menuItems);
  console.log('✅ Menu items seeded (', menuItems.length, 'items)');

  // Tables with QR codes
  for (let i = 1; i <= 10; i++) {
    const url = `${BASE_URL}/verify.html?table=${i}`;
    const qrCodeImage = await QRCode.toDataURL(url, { width: 250, margin: 2 });
    await Table.create({ tableNumber: i, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6, qrCodeValue: url, qrCodeImage });
  }
  console.log('✅ Tables seeded (10 tables with QR codes)');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Login credentials:');
  console.log('   Admin:   admin@restaurant.com / password123');
  console.log('   Kitchen: kitchen@restaurant.com / password123');
  console.log('   Staff:   staff@restaurant.com / password123');
  console.log('   Customer:customer@restaurant.com / password123');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
