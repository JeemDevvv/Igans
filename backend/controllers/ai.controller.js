const MenuItem = require('../models/MenuItem');
const ChatLog = require('../models/ChatLog');
const Groq = require('groq-sdk');

// ── Shared Utilities for Fallback ──────────────────────────────────────────────
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

// ── Main Recommendation Handler (GROQ) ──────────────────────────────────────────
exports.recommend = async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ success: false, msg: 'Message required' });

  let reply = "";
  let success = false;

  try {
    // 1. Try Groq AI First
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey.startsWith('gsk_')) {
      const groq = new Groq({ apiKey });
      
      const menu = await MenuItem.find({ available: true }).limit(15);
      const menuContext = menu.map(i => `- ${i.name} (₱${i.price}): ${i.description}`).join('\n');

      // Fetch last few messages for context to prevent repetitive greetings
      let historyMessages = [];
      if (sessionId) {
        const log = await ChatLog.findOne({ sessionId });
        if (log && log.messages) {
          historyMessages = log.messages.slice(-6).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }));
        }
      }

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are the friendly AI for "Igan's Budbod House".
            Help customers choose from this menu:
            ${menuContext}
            
            Instructions:
            - Keep it friendly, short, and appetizing. Respond in Taglish or English.
            - COMMAND RULE: Only include [COMMAND:ADD_TO_CART:ITEM_NAME] if the user is CLEARLY and EXPLICITLY asking to purchase or add the item (e.g., "order", "add to cart", "bilhin ko yan", "paki add").
            - DO NOT include the command if the user is just asking for information, calories, or an introduction.
            - DO NOT repeat the command if the user is just saying "Yes", "Sige", or confirming a previous action.
            - NEVER include more than one command tag in a single response.
            - If the user says "No", "None", "Ayoko na", or "Ayoko yan", STOP offering food immediately and acknowledge.
            - Do NOT be pushy. Suggest max 1-2 items only when highly relevant.`
          },
          ...historyMessages,
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 350,
      });

      const fullReply = chatCompletion.choices[0]?.message?.content || "";
      
      // Parse command if exists
      let action = null;
      let finalReply = fullReply;
      
      // Use global regex to find ALL commands but only process the first one
      const allMatches = [...fullReply.matchAll(/\[COMMAND:(.+?):(.+?)\]/g)];
      if (allMatches.length > 0) {
        // Take only the first command
        const firstMatch = allMatches[0];
        action = { type: firstMatch[1], payload: firstMatch[2] };
        
        // Remove ALL [COMMAND:...] tags from the reply before showing to user/saving to history
        finalReply = fullReply.replace(/\[COMMAND:.+?\]/g, '').trim();
      }

      reply = finalReply;
      res.json({ success: true, reply, action });
      success = true;
    } else {
      console.warn("AI Warning: GROQ_API_KEY is missing or invalid in environment.");
    }
  } catch (err) {
    console.error(`AI Error (Groq API): ${err.message}`);
  }

  // 2. FALLBACK: Use local logic if Groq fails
  if (!success) {
    const intent = parseIntent(message);
    const allAvailableItems = await MenuItem.find({ available: true });
    
    // Simple name matching for fallback ordering
    let action = null;
    const lowerMsg = message.toLowerCase();
    const matchedItem = allAvailableItems.find(i => 
      lowerMsg.includes(i.name.toLowerCase()) || 
      (i.description && lowerMsg.includes(i.description.toLowerCase()))
    );

    // Use regex for more specific keyword matching in fallback
    const buyRegex = /\b(order|add|bilhin|paki|pabili|take)\b/i;
    if (matchedItem && buyRegex.test(lowerMsg)) {
      action = { type: 'ADD_TO_CART', payload: matchedItem.name };
      reply = `I've added **${matchedItem.name}** to your cart! 🛒 Is there anything else you'd like to try?`;
    } else {
      reply = formatFallbackResponse(allAvailableItems.slice(0, 3), intent, message);
    }
    
    res.json({ success: true, reply, action });
  }

  // 3. Save chat log (using final clean reply)
  if (sessionId && reply) {
    try {
      let log = await ChatLog.findOne({ sessionId });
      if (!log) log = new ChatLog({ sessionId, messages: [] });
      log.messages.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
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
