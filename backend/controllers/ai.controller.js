const MenuItem = require('../models/MenuItem');
const ChatLog = require('../models/ChatLog');

// Rule-based AI recommendation engine
const parseIntent = (msg) => {
  const m = msg.toLowerCase();
  const intent = {};
  if (/spicy|hot|chili|spice/i.test(m)) intent.spicy = true;
  if (/cheap|affordable|budget|inexpensive|low.?price/i.test(m)) intent.affordable = true;
  if (/expensive|premium|luxury|best/i.test(m)) intent.premium = true;
  if (/drink|beverage|juice|coffee|tea|soda/i.test(m)) intent.categoryHint = 'drinks';
  if (/snack|light|small|appetizer|starter/i.test(m)) intent.categoryHint = 'snacks';
  if (/dessert|sweet|cake|ice cream|pastry/i.test(m)) intent.categoryHint = 'desserts';
  if (/full.?meal|main|rice|pasta|heavy|lunch|dinner/i.test(m)) intent.categoryHint = 'main course';
  if (/vegan|vegetarian|plant.?based/i.test(m)) intent.vegan = true;
  if (/halal/i.test(m)) intent.halal = true;
  if (/seafood|fish|shrimp|crab/i.test(m)) intent.seafood = true;
  if (/chicken|poultry/i.test(m)) intent.chicken = true;
  if (/beef|steak|pork/i.test(m)) intent.meat = true;
  if (/popular|bestseller|best.?seller|trending/i.test(m)) intent.popular = true;
  if (/featured|special|today|recommend/i.test(m)) intent.featured = true;
  return intent;
};

const buildQuery = async (intent) => {
  const { Category } = require('../models/Category');
  let query = { available: true };
  const tags = [];
  if (intent.spicy) tags.push('spicy');
  if (intent.vegan) tags.push('vegan');
  if (intent.halal) tags.push('halal');
  if (intent.seafood) tags.push('seafood');
  if (intent.chicken) tags.push('chicken');
  if (intent.meat) tags.push('meat');
  if (tags.length > 0) query.tags = { $in: tags };
  if (intent.affordable) query.price = { $lte: 200 };
  if (intent.premium) query.price = { $gte: 300 };
  if (intent.popular) query.isBestSeller = true;
  if (intent.featured) query.isFeatured = true;
  if (intent.categoryHint) {
    const cat = await require('../models/Category').findOne({ name: { $regex: intent.categoryHint, $options: 'i' } });
    if (cat) query.category = cat._id;
  }
  return query;
};

const formatResponse = (items, intent) => {
  if (items.length === 0) {
    return "I couldn't find a perfect match, but here's what I suggest: try browsing our **Main Course** or **Featured** items — there's something for everyone! 🍽️";
  }
  const intros = [
    "Great choice of vibe! Here are my top picks for you:",
    "Based on what you're looking for, I'd recommend:",
    "You've got great taste! Check these out:",
    "Perfect! Here's what I think you'll love:"
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];
  const list = items.slice(0, 4).map(i =>
    `🍴 **${i.name}** — ₱${i.price}\n   ${i.description || 'A delicious choice!'}`
  ).join('\n\n');
  let tip = '';
  if (intent.spicy) tip = '\n\n🌶️ Tip: All these dishes have a spicy kick — perfect for heat lovers!';
  if (intent.affordable) tip = '\n\n💰 Tip: These are all budget-friendly options without sacrificing taste!';
  return `${intro}\n\n${list}${tip}`;
};

exports.recommend = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ success: false, msg: 'Message required' });

    const intent = parseIntent(message);
    const query = await buildQuery(intent);
    const items = await MenuItem.find(query).populate('category').limit(6);

    // If no results with strict query, fall back to general popular items
    const finalItems = items.length > 0 ? items : await MenuItem.find({ available: true, isBestSeller: true }).populate('category').limit(4);
    const reply = formatResponse(finalItems, intent);

    // Save chat log
    if (sessionId) {
      let log = await ChatLog.findOne({ sessionId });
      if (!log) log = new ChatLog({ sessionId, messages: [] });
      log.messages.push({ role: 'user', content: message });
      log.messages.push({ role: 'assistant', content: reply });
      await log.save();
    }

    res.json({ success: true, reply, items: finalItems });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const log = await ChatLog.findOne({ sessionId });
    res.json({ success: true, messages: log ? log.messages : [] });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
