require('dotenv').config({ path: './config/config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const RestaurantSettings = require('../models/RestaurantSettings');
const generateQRCode = require('./customQrGenerator');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ENABLE_DB_SEED = process.env.ENABLE_DB_SEED === 'true';

async function seed() {
  if (!ENABLE_DB_SEED) {
    console.log('ENABLE_DB_SEED is not true. Skipping database seeding.');
    console.log('Set ENABLE_DB_SEED=true only when you want to seed the database.');
    process.exit(0);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined. Skipping database seeding.');
    console.error('Set MONGO_URI in environment variables or in backend/config/config.env before running the seeder.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  await User.deleteMany({});
  await Category.deleteMany({});
  await MenuItem.deleteMany({});
  await Table.deleteMany({});
  await RestaurantSettings.deleteMany({});

  // Settings
  await RestaurantSettings.create({
    restaurantName: 'Igans Budbod House',
    latitude: 14.5995,
    longitude: 120.9842,
    allowedRadiusMeters: 500,
    address: 'Antipolo Rizal, Philippines',
    phone: '+63 912 345 6789',
    openHours: '10:00 AM – 10:00 PM',
    currency: '₱'
  });
  console.log('Settings seeded');

  const pass = await bcrypt.hash('password123', 12);
  await User.insertMany([
    { name: 'Admin User', email: 'admin@restaurant.com', password: pass, role: 'admin' },
    { name: 'Kitchen Staff', email: 'kitchen@restaurant.com', password: pass, role: 'kitchen' },
    { name: 'Floor Staff', email: 'staff@restaurant.com', password: pass, role: 'staff' },
    { name: 'John Customer', email: 'customer@restaurant.com', password: pass, role: 'customer' }
  ]);
  console.log('Users seeded');

  const cats = await Category.insertMany([
    { name: 'Silog Meals', icon: '🍳', sortOrder: 1 },
    { name: 'Budbod Meals', icon: '🍚', sortOrder: 2 },
    { name: 'Sizzling', icon: '🔥', sortOrder: 3 },
    { name: 'Noodles', icon: '🍜', sortOrder: 4 },
    { name: 'Luto sa Gulay', icon: '🥬', sortOrder: 5 },
    { name: 'Pork', icon: '🐷', sortOrder: 6 },
    { name: 'Beef', icon: '🥩', sortOrder: 7 },
    { name: 'Extras', icon: '🍽️', sortOrder: 8 }
  ]);
  const catMap = {};
  cats.forEach(c => { catMap[c.name] = c._id; });
  console.log('✅ Categories seeded');

  const menuItems = [
    // Silog Meals
    { name: 'Longsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 129, available: true, tags: ['silog', 'longganisa'], orderCount: 0 },
    { name: 'Baconsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 129, available: true, tags: ['silog', 'bacon'], orderCount: 0 },
    { name: 'Hotsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 119, available: true, tags: ['silog', 'hotdog'], orderCount: 0 },
    { name: 'Hamsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 119, available: true, tags: ['silog', 'ham'], orderCount: 0 },
    { name: 'Tocilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 149, available: true, tags: ['silog', 'tocino'], orderCount: 0 },
    { name: 'Shanghaisilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 149, available: true, tags: ['silog', 'shanghai'], orderCount: 0 },
    { name: 'Hungariansilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'hungarian sausage'], orderCount: 0 },
    { name: 'Sisigsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'sisig'], orderCount: 0 },
    { name: 'Spamsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'spam'], orderCount: 0 },
    { name: 'Porksilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'pork'], orderCount: 0 },
    { name: 'Lechonkawalisilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'lechon kawali'], orderCount: 0 },
    { name: 'Chicksilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'chicken'], orderCount: 0 },
    { name: 'Tapsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'tapa'], orderCount: 0 },
    { name: 'Bangsilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'bangus'], orderCount: 0 },
    { name: 'Liemposilog', description: 'Served with Fried Rice, Sunny Side Up Egg and Cucumber', category: catMap['Silog Meals'], price: 159, available: true, tags: ['silog', 'liempo'], orderCount: 0 },

    // Budbod Meals
    { name: 'Shanghai Budbod', description: 'Rice Toppings | Fried Rice, Choice of Topping, Scrambled Egg, Budbod Sauce, Tomatoes and Toasted Garlic', category: catMap['Budbod Meals'], price: 159, available: true, tags: ['budbod', 'shanghai'], orderCount: 0 },
    { name: 'Spam Budbod', description: 'Rice Toppings | Fried Rice, Choice of Topping, Scrambled Egg, Budbod Sauce, Tomatoes and Toasted Garlic', category: catMap['Budbod Meals'], price: 159, available: true, tags: ['budbod', 'spam'], orderCount: 0 },
    { name: 'Lechon Kawali Budbod', description: 'Rice Toppings | Fried Rice, Choice of Topping, Scrambled Egg, Budbod Sauce, Tomatoes and Toasted Garlic', category: catMap['Budbod Meals'], price: 159, available: true, tags: ['budbod', 'lechon kawali'], orderCount: 0 },
    { name: 'Beef Budbod', description: 'Rice Toppings | Fried Rice, Choice of Topping, Scrambled Egg, Budbod Sauce, Tomatoes and Toasted Garlic', category: catMap['Budbod Meals'], price: 159, available: true, tags: ['budbod', 'beef'], orderCount: 0 },
    { name: 'Super Budbod', description: 'Rice Toppings | Fried Rice, Choice of Topping, Scrambled Egg, Budbod Sauce, Tomatoes and Toasted Garlic', category: catMap['Budbod Meals'], price: 189, available: true, tags: ['budbod', 'super'], orderCount: 0 },

    // Sizzling
    { name: 'Hungarian Sausage', description: 'Served with Plain Rice, Buttered Veggies and Gravy', category: catMap['Sizzling'], price: 149, available: true, tags: ['sizzling', 'hungarian sausage'], orderCount: 0 },
    { name: 'Porkchop Steak', description: 'Served with Plain Rice, Buttered Veggies and Gravy', category: catMap['Sizzling'], price: 159, available: true, tags: ['sizzling', 'porkchop'], orderCount: 0 },
    { name: 'Liempo Steak', description: 'Served with Plain Rice, Buttered Veggies and Gravy', category: catMap['Sizzling'], price: 159, available: true, tags: ['sizzling', 'liempo'], orderCount: 0 },
    { name: 'Chicken Quarter Leg', description: 'Served with Plain Rice, Buttered Veggies and Gravy', category: catMap['Sizzling'], price: 159, available: true, tags: ['sizzling', 'chicken'], orderCount: 0 },
    { name: 'Pork Sisig w/ Egg (No Gravy)', description: 'Served with Plain Rice, Buttered Veggies', category: catMap['Sizzling'], price: 159, available: true, tags: ['sizzling', 'sisig', 'egg'], orderCount: 0 },

    // Noodles
    { name: 'Bihon Con Lechon', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Noodles'], price: 230, available: true, tags: ['noodles', 'bihon', 'lechon'], orderCount: 0 },
    { name: 'Canton Con Lechon', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Noodles'], price: 250, available: true, tags: ['noodles', 'canton', 'lechon'], orderCount: 0 },
    { name: 'Mix Bihon Canton Con Lechon', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Noodles'], price: 250, available: true, tags: ['noodles', 'mix', 'lechon'], orderCount: 0 },
    { name: 'Bihon Con Sisig', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Noodles'], price: 260, available: true, tags: ['noodles', 'bihon', 'sisig'], orderCount: 0 },

    // Luto sa Gulay
    { name: 'Chopsuey Con Lechon', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Luto sa Gulay'], price: 280, available: true, tags: ['vegetables', 'chopsuey', 'lechon'], orderCount: 0 },
    { name: 'Pakbet Con Lechon', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Luto sa Gulay'], price: 280, available: true, tags: ['vegetables', 'pakbet', 'lechon'], orderCount: 0 },
    { name: 'Laing Con Lechon', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Luto sa Gulay'], price: 280, available: true, tags: ['vegetables', 'laing', 'lechon'], orderCount: 0 },
    { name: 'Tortang Talong', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Luto sa Gulay'], price: 160, available: true, tags: ['vegetables', 'tortang talong'], orderCount: 0 },

    // Pork
    { name: 'Fried Lumpiang Shanghai', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Pork'], price: 230, available: true, tags: ['pork', 'lumpia'], orderCount: 0 },
    { name: 'Sizzling Sisig with Egg', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Pork'], price: 280, available: true, tags: ['pork', 'sisig', 'sizzling'], orderCount: 0 },
    { name: 'Kilawing Lechon Kawali', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Pork'], price: 300, available: true, tags: ['pork', 'lechon kawali', 'kilawin'], orderCount: 0 },
    { name: 'Sinigang na Baboy', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Pork'], price: 350, available: true, tags: ['pork', 'sinigang'], orderCount: 0 },
    { name: 'Bagnet Kare-Kare', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Pork'], price: 350, available: true, tags: ['pork', 'kare-kare', 'bagnet'], orderCount: 0 },
    { name: 'Crispy Pata', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Pork'], price: 850, available: true, tags: ['pork', 'crispy pata'], orderCount: 0 },

    // Beef
    { name: 'Sinigang na Bulalo', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Beef'], price: 360, available: true, tags: ['beef', 'sinigang', 'bulalo'], orderCount: 0 },
    { name: 'Nilagang Bulalo', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Beef'], price: 360, available: true, tags: ['beef', 'nilaga', 'bulalo'], orderCount: 0 },
    { name: 'Kare-Kareng Bulalo', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Beef'], price: 380, available: true, tags: ['beef', 'kare-kare', 'bulalo'], orderCount: 0 },
    { name: 'Beef Kaldereta', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Beef'], price: 390, available: true, tags: ['beef', 'kaldereta'], orderCount: 0 },
    { name: 'Beef Kare-Kare (Laman, Tuwalya, Balat)', description: 'Ala Carte Orders. Good for 2-3 Pax', category: catMap['Beef'], price: 390, available: true, tags: ['beef', 'kare-kare'], orderCount: 0 },

    // Extras
    { name: 'Plain Rice', description: 'Extra plain rice', category: catMap['Extras'], price: 20, available: true, tags: ['extras', 'rice'], orderCount: 0 },
    { name: 'Garlic Rice', description: 'Extra garlic rice', category: catMap['Extras'], price: 25, available: true, tags: ['extras', 'garlic rice'], orderCount: 0 },
    { name: 'Fried Egg', description: 'Extra fried egg', category: catMap['Extras'], price: 20, available: true, tags: ['extras', 'egg'], orderCount: 0 }
  ];

  await MenuItem.insertMany(menuItems);
  console.log('Menu items seeded (', menuItems.length, 'items)');

  for (let i = 1; i <= 10; i++) {
    const url = `${BASE_URL}/verify.html?table=${i}`;
    const qrCodeImage = generateQRCode(url, 250);
    await Table.create({ tableNumber: i, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6, qrCodeValue: url, qrCodeImage });
  }
  console.log('Tables seeded (10 tables with QR codes)');

  console.log('\n Database seeded successfully!\n');
  console.log('📋 Login credentials:');
  console.log('   Admin:   admin@restaurant.com / password123');
  console.log('   Kitchen: kitchen@restaurant.com / password123');
  console.log('   Staff:   staff@restaurant.com / password123');
  console.log('   Customer:customer@restaurant.com / password123');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
