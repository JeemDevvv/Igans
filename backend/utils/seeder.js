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
    { name: 'Admin User', username: 'admin', email: 'admin@restaurant.com', password: pass, role: 'admin' },
    { name: 'Kitchen Staff', username: 'kitchen', email: 'kitchen@restaurant.com', password: pass, role: 'kitchen' },
    { name: 'Floor Staff', username: 'staff', email: 'staff@restaurant.com', password: pass, role: 'staff' },
    { name: 'John Customer', username: 'customer', email: 'customer@restaurant.com', password: pass, role: 'customer' }
  ]);
  console.log('Users seeded');

  const cats = await Category.insertMany([
    { name: 'Silog Meals', icon: '🍳', sortOrder: 1 },
    { name: 'Sizzling Meals', icon: '🔥', sortOrder: 2 },
    { name: 'Beef Pares', icon: '🥩', sortOrder: 3 },
    { name: 'Noodles', icon: '🍜', sortOrder: 4 },
    { name: 'Luto sa Gulay', icon: '🥬', sortOrder: 5 },
    { name: 'Pork', icon: '🐷', sortOrder: 6 },
    { name: 'Beef', icon: '🥩', sortOrder: 7 },
    { name: 'Seafood', icon: '🦐', sortOrder: 8 }
  ]);
  const catMap = {};
  cats.forEach(c => { catMap[c.name] = c._id; });
  console.log('✅ Categories seeded');

  const menuItems = [
    // Silog Meals
    { name: 'Tocilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 118, available: true, tags: ['silog', 'tocino'], orderCount: 0 },
    { name: 'HotSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 118, available: true, tags: ['silog', 'hotdog'], orderCount: 0 },
    { name: 'HamSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 118, available: true, tags: ['silog', 'ham'], orderCount: 0 },
    { name: 'LongSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 118, available: true, tags: ['silog', 'longganisa'], orderCount: 0 },
    { name: 'BaconSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 118, available: true, tags: ['silog', 'bacon'], orderCount: 0 },
    { name: 'SpamSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 118, available: true, tags: ['silog', 'spam'], orderCount: 0 },
    { name: 'SisigSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 138, available: true, tags: ['silog', 'sisig'], orderCount: 0 },
    { name: 'PorkSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 138, available: true, tags: ['silog', 'pork'], orderCount: 0 },
    { name: 'Lechon Kawali Silog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 138, available: true, tags: ['silog', 'lechon kawali'], orderCount: 0 },
    { name: 'HungarianSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 138, available: true, tags: ['silog', 'hungarian sausage'], orderCount: 0 },
    { name: 'ChickSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 148, available: true, tags: ['silog', 'chicken'], orderCount: 0 },
    { name: 'TapSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 148, available: true, tags: ['silog', 'tapa'], orderCount: 0 },
    { name: 'BangSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 148, available: true, tags: ['silog', 'bangus'], orderCount: 0 },
    { name: 'LiempoSilog', description: 'Served with Fried Rice, Sunny Sideup Egg, tomato and cucumber', category: catMap['Silog Meals'], price: 148, available: true, tags: ['silog', 'liempo'], orderCount: 0 },

    // Sizzling Meals
    { name: 'Hungarian Sausage', description: 'Served with Plain Rice, buttered veggies and gravy', category: catMap['Sizzling Meals'], price: 128, available: true, tags: ['sizzling', 'sausage'], orderCount: 0 },
    { name: 'Burger Steak', description: 'Served with Plain Rice, buttered veggies and gravy', category: catMap['Sizzling Meals'], price: 128, available: true, tags: ['sizzling', 'burger steak'], orderCount: 0 },
    { name: 'Porkchop Steak', description: 'Served with Plain Rice, buttered veggies and gravy', category: catMap['Sizzling Meals'], price: 128, available: true, tags: ['sizzling', 'porkchop'], orderCount: 0 },
    { name: 'Liempo Steak', description: 'Served with Plain Rice, buttered veggies and gravy', category: catMap['Sizzling Meals'], price: 128, available: true, tags: ['sizzling', 'liempo'], orderCount: 0 },
    { name: 'Pork Sisig w/ Egg (no gravy)', description: 'Served with Plain Rice, buttered veggies', category: catMap['Sizzling Meals'], price: 138, available: true, tags: ['sizzling', 'sisig', 'egg'], orderCount: 0 },
    { name: 'Chicken Quarterleg', description: 'Served with Plain Rice, buttered veggies and gravy', category: catMap['Sizzling Meals'], price: 158, available: true, tags: ['sizzling', 'chicken'], orderCount: 0 },

    // Beef Pares
    { name: 'Beef Pares', description: 'Served with Garlic Rice', category: catMap['Beef Pares'], price: 138, available: true, tags: ['beef', 'pares'], orderCount: 0 },

    // Noodles
    { name: 'Bihon Con Lechon', description: 'Good for 2-3 pax', category: catMap['Noodles'], price: 180, available: true, tags: ['noodles', 'bihon', 'lechon'], orderCount: 0 },
    { name: 'Canton Con Lechon', description: 'Good for 2-3 pax', category: catMap['Noodles'], price: 200, available: true, tags: ['noodles', 'canton', 'lechon'], orderCount: 0 },
    { name: 'Mix Con Lechon', description: 'Good for 2-3 pax', category: catMap['Noodles'], price: 200, available: true, tags: ['noodles', 'mix', 'lechon'], orderCount: 0 },
    { name: 'Pancit Bihon Con Sisig', description: 'Good for 2-3 pax', category: catMap['Noodles'], price: 230, available: true, tags: ['noodles', 'bihon', 'sisig'], orderCount: 0 },

    // Luto sa Gulay
    { name: 'Chopsuey Con Lechon', description: 'Good for 2-3 pax', category: catMap['Luto sa Gulay'], price: 230, available: true, tags: ['vegetables', 'chopsuey', 'lechon'], orderCount: 0 },
    { name: 'Pinakbet Con Lechon', description: 'Good for 2-3 pax', category: catMap['Luto sa Gulay'], price: 230, available: true, tags: ['vegetables', 'pinakbet', 'lechon'], orderCount: 0 },
    { name: 'Laing Con Lechon', description: 'Good for 2-3 pax', category: catMap['Luto sa Gulay'], price: 230, available: true, tags: ['vegetables', 'laing', 'lechon'], orderCount: 0 },

    // Pork
    { name: 'Fried Lumpiang Shanghai (10pcs)', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Pork'], price: 199, available: true, tags: ['pork', 'lumpia'], orderCount: 0 },
    { name: 'Sizzling Sisig w/ Egg', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Pork'], price: 199, available: true, tags: ['pork', 'sisig', 'sizzling'], orderCount: 0 },
    { name: 'Kilawing Lechon Kawali', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Pork'], price: 269, available: true, tags: ['pork', 'lechon kawali', 'kilawin'], orderCount: 0 },
    { name: 'Sinigang na Tadyang ng Baboy', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Pork'], price: 299, available: true, tags: ['pork', 'sinigang', 'tadyang'], orderCount: 0 },
    { name: 'Bagnet Kare-Kare', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Pork'], price: 320, available: true, tags: ['pork', 'kare-kare', 'bagnet'], orderCount: 0 },
    { name: 'Crispy Pata', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Pork'], price: 600, available: true, tags: ['pork', 'crispy pata'], orderCount: 0 },

    // Beef
    { name: 'Sinigang na Bulalo', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Beef'], price: 320, available: true, tags: ['beef', 'sinigang', 'bulalo'], orderCount: 0 },
    { name: 'Nilagang Bulalo', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Beef'], price: 320, available: true, tags: ['beef', 'nilaga', 'bulalo'], orderCount: 0 },
    { name: 'Sizzling Bulalo', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Beef'], price: 320, available: true, tags: ['beef', 'sizzling', 'bulalo'], orderCount: 0 },
    { name: 'Kare-Kareng Bulalo', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Beef'], price: 350, available: true, tags: ['beef', 'kare-kare', 'bulalo'], orderCount: 0 },

    // Seafood
    { name: 'Sizzling Pinaputok na Tilapia', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Seafood'], price: 199, available: true, tags: ['seafood', 'tilapia', 'sizzling'], orderCount: 0 },
    { name: 'Sizzling Pinaputok na Bangus', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Seafood'], price: 230, available: true, tags: ['seafood', 'bangus', 'sizzling'], orderCount: 0 },
    { name: 'Fried Daing Boneless Bangus', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Seafood'], price: 230, available: true, tags: ['seafood', 'bangus', 'daing'], orderCount: 0 },
    { name: 'Sinigang na Miso Ulo ng Salmon', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Seafood'], price: 250, available: true, tags: ['seafood', 'salmon', 'sinigang'], orderCount: 0 },
    { name: 'Sinigang na Hipon', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Seafood'], price: 320, available: true, tags: ['seafood', 'shrimp', 'sinigang'], orderCount: 0 },
    { name: 'Sizzling fried Pampano', description: 'Ala Carte Orders. Good for 2-3 pax', category: catMap['Seafood'], price: 360, available: true, tags: ['seafood', 'pampano', 'sizzling'], orderCount: 0 }
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
  console.log('   Admin:   admin / password123');
  console.log('   Kitchen: kitchen / password123');
  console.log('   Staff:   staff / password123');
  console.log('   Customer:customer / password123');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
