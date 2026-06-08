const MenuItem = require('../models/MenuItem');
const ChatLog = require('../models/ChatLog');
const Groq = require('groq-sdk');
const isGreeting = (msg) => {
  const m = msg.toLowerCase().trim();
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'kumusta', 'kamusta', 'yo', 'sup'];
  return greetings.some(g => m === g || m.startsWith(g + ' '));
};
const parseIntent = (msg) => {
  const m = msg.toLowerCase();
  const intent = {};
  if (/spicy|maanghang|hot/i.test(m)) intent.spicy = true;
  if (/cheap|affordable|budget|mura|sulit/i.test(m)) intent.affordable = true;
  if (/drink|juice|shake|cold/i.test(m)) intent.categoryHint = 'drinks';
  if (/rice|meal|lunch|dinner|busog/i.test(m)) intent.categoryHint = 'main course';
  if (/chicken|manok/i.test(m)) intent.chicken = true;
  if (/beef|pork|meat/i.test(m)) intent.meat = true;
  return intent;
};
const formatFallbackResponse = (items, intent, message) => {
  if (isGreeting(message)) {
    return "Hello! I'm your Igans AI Assistant. I can help you find the best Budbod meals! What are you craving today? 🍛";
  }
  if (items.length === 0) {
    return "I couldn't find a perfect match, but you should definitely try our signature Budbod meals! They're our best sellers! 🍽️";
  }
  const list = items.slice(0, 3).map(i => `🍴 **${i.name}** — ₱${i.price}\n   ${i.description || 'A delicious choice!'}`).join('\n\n');
  return "I'm having a bit of trouble connecting to my cloud brain, but here are some top recommendations from our menu: \n\n" + list;
};
exports.recommend = async (req, res) => {
  const { message, sessionId, cart, cartTotal } = req.body;
  console.log("AI Request received:", { message, cart, cartTotal });
  if (!message) return res.status(400).json({ success: false, msg: 'Message required' });
  let reply = "";
  let success = false;
  let log = null;
  let lastAddedItem = null;
  const lowerMsg = message.toLowerCase();
  const isCartRelated =
    /(my|the|cart|my cart|the cart)/i.test(lowerMsg) ||
    /(how much (is|are|total)|what(')?s? the total|total (cost|price)|how many (items|orders)|what(')?s? in (my|the) cart|ano (nasa|sa) (cart|aking cart)|meron (ba)? sa (cart|aking cart)|ilan (nasa|sa) (cart|aking cart))/i.test(lowerMsg);
  if (isCartRelated && cart && cart.length > 0) {
    const cartList = cart.map(item => `- ${item.name} (₱${item.price}) × ${item.quantity}`).join('\n');
    reply = `Here's what's in your cart:\n\n${cartList}\n\nTotal: **₱${parseFloat(cartTotal).toFixed(2)}** 😊`;
    res.json({ success: true, reply, action: null });
    if (sessionId) {
      try {
        if (!log) log = new ChatLog({ sessionId, messages: [] });
        log.messages.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
        await log.save();
      } catch (e) {}
    }
    return;
  } else if (isCartRelated && (!cart || cart.length === 0)) {
    reply = "Your cart is still empty! You haven't ordered anything yet. What can I help you with? Would you like to try our best-seller, Chicken Adobo, or something else?";
    res.json({ success: true, reply, action: null });
    if (sessionId) {
      try {
        if (!log) log = new ChatLog({ sessionId, messages: [] });
        log.messages.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
        await log.save();
      } catch (e) {}
    }
    return;
  }
  if (sessionId) {
    log = await ChatLog.findOne({ sessionId });
    if (log && log.lastAddedItem) {
      lastAddedItem = log.lastAddedItem;
    }
  }
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey.startsWith('gsk_')) {
      const groq = new Groq({ apiKey });
      const menu = await MenuItem.find({ available: true });
      const menuContext = menu.map(i => `- ${i.name} (₱${i.price}): ${i.description || 'Delicious Filipino dish'}`).join('\n');
      let historyMessages = [];
      if (log && log.messages) {
        historyMessages = log.messages.slice(-6).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));
      }
      let systemContent = `You are the friendly AI for "Igan's Budbod House".
      Help customers choose from this menu:
      ${menuContext}`;
      if (cart && cart.length > 0) {
        const cartList = cart.map(item => `- ${item.name} (₱${item.price}) × ${item.quantity}`).join('\n');
        systemContent += `\n\nCURRENT CUSTOMER CART:\n${cartList}\nTotal: ₱${parseFloat(cartTotal).toFixed(2)}`;
      }
      systemContent += `\n\nVERY IMPORTANT RULES:
            - Keep it friendly, short, and appetizing. Respond in Taglish or English.
            - ONLY use [COMMAND:ADD_TO_CART:ITEM_NAME] if the user is EXPLICITLY asking to ORDER/ADD an item (e.g., "I'll take that", "Order it", "Add to cart", "Bilhin ko yan", "Add mo").
            - NEVER use the command if the user is just: asking questions, saying "yes"/"sige" to confirm, saying "thank you"/"that's all", or just chatting.
            - NEVER repeat the command for the same item more than once.
            - If the user says "That's all", "Thank you", "Okay na", or similar, just respond warmly and don't offer anything else.
            - If you recommended an item and the user says "Yes, please", just respond positively WITHOUT using the ADD_TO_CART command.
            - NEVER include more than one command tag in a single response.
            - If the user asks about their cart, tell them exactly what's in it and the total.`;
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemContent
          },
          ...historyMessages,
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 300,
      });
      const fullReply = chatCompletion.choices[0]?.message?.content || "";
      let action = null;
      let finalReply = fullReply;
      const allMatches = [...fullReply.matchAll(/\[COMMAND:(.+?):(.+?)\]/g)];
      if (allMatches.length > 0) {
        const firstMatch = allMatches[0];
        const itemName = firstMatch[2].trim();
        if (lastAddedItem && lastAddedItem.toLowerCase() === itemName.toLowerCase()) {
          action = null;
        } else {
          action = { type: firstMatch[1], payload: itemName };
        }
        finalReply = fullReply.replace(/\[COMMAND:.+?\]/g, '').trim();
      }
      reply = finalReply;
      if (action && action.type === 'ADD_TO_CART') {
        lastAddedItem = action.payload;
      }
      res.json({ success: true, reply, action });
      success = true;
    } else {
      console.warn("AI Warning: GROQ_API_KEY is missing or invalid in environment.");
    }
  } catch (err) {
    console.error(`AI Error (Groq API): ${err.message}`);
  }
  if (!success) {
    const intent = parseIntent(message);
    const allAvailableItems = await MenuItem.find({ available: true });
    let action = null;
    const lowerMsg = message.toLowerCase();
    const matchedItem = allAvailableItems.find(i =>
      lowerMsg.includes(i.name.toLowerCase()) ||
      (i.description && lowerMsg.includes(i.description.toLowerCase()))
    );
    const buyRegex = /\b(order|add|bilhin|paki|pabili|take|i'll take|ill take)\b/i;
    const checkIfHaveRegex = /\b(do you have|meron ba|mayroon|have you got)\b/i;
    const confirmationRegex = /\b(yes|sige|okay|ok|sure|go ahead|please)\b/i;
    const doneRegex = /\b(thank you|thanks|that's all|thats all|okay na|tama na|salamat)\b/i;
    if (doneRegex.test(lowerMsg)) {
      reply = "You're welcome! Enjoy your meal! 🍽️";
      res.json({ success: true, reply, action: null });
    } else if (confirmationRegex.test(lowerMsg)) {
      reply = "Great! Let me know if you'd like anything else! 😊";
      res.json({ success: true, reply, action: null });
    } else if (checkIfHaveRegex.test(lowerMsg) && matchedItem) {
      reply = `Yes! We have **${matchedItem.name}**! It costs ₱${matchedItem.price}. ${matchedItem.description ? matchedItem.description : 'Would you like to try it?'} 🍹`;
      res.json({ success: true, reply, items: [matchedItem] });
    } else if (checkIfHaveRegex.test(lowerMsg) && !matchedItem) {
      reply = "Sorry, we don't have that on our menu. But we have a variety of delicious Filipino dishes to choose from! Would you like me to recommend something?";
      res.json({ success: true, reply, items: allAvailableItems.slice(0, 3) });
    } else if (matchedItem && buyRegex.test(lowerMsg)) {
      if (lastAddedItem && lastAddedItem.toLowerCase() === matchedItem.name.toLowerCase()) {
        reply = `${matchedItem.name} is already in your cart! 😊 Is there anything else you'd like?`;
        res.json({ success: true, reply, action: null });
      } else {
        action = { type: 'ADD_TO_CART', payload: matchedItem.name };
        lastAddedItem = matchedItem.name;
        reply = `I've added **${matchedItem.name}** to your cart! 🛒 Is there anything else you'd like to try?`;
        res.json({ success: true, reply, action });
      }
    } else {
      reply = formatFallbackResponse(allAvailableItems.slice(0, 3), intent, message);
      res.json({ success: true, reply, action: null });
    }
  }
  if (sessionId && reply) {
    try {
      if (!log) log = new ChatLog({ sessionId, messages: [] });
      log.messages.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
      if (lastAddedItem) {
        log.lastAddedItem = lastAddedItem;
      }
      await log.save();
    } catch (e) {}
  }
};
exports.getHistory = async (req, res) => {
  try {
    const log = await ChatLog.findOne({ sessionId: req.params.sessionId });
    res.json({ success: true, messages: log ? log.messages : [] });
  } catch (err) { res.status(500).json({ success: false, msg: err.message }); }
};