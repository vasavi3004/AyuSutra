const express = require('express');
const router = express.Router();
const axios = require('axios');

// Simple, safe rule-based responder as a fallback when no LLM key is configured
function ruleBasedReply(message = '') {
  const m = message.toLowerCase();
  if (!m || m.trim().length === 0) {
    return "Hello! I'm your AyurSutra assistant. Ask me about booking, rescheduling, treatments, or contact info.";
  }
  if (m.includes('book') || m.includes('appointment')) {
    return 'To book an appointment, go to Patient > Book Appointment and choose your date, time, and treatment.';
  }
  if (m.includes('reschedule') || m.includes('change')) {
    return 'You can reschedule from your dashboard. Select the appointment and choose Reschedule to pick a new slot.';
  }
  if (m.includes('cancel')) {
    return 'To cancel an appointment, open it from your dashboard and choose Cancel. Note that cancellation policies may apply.';
  }
  if (m.includes('contact') || m.includes('help') || m.includes('support')) {
    return 'For support, use the Help section or email support@ayursutra.example.';
  }
  if (m.includes('panchakarma') || m.includes('treatment') || m.includes('abhyanga') || m.includes('shirodhara')) {
    return 'AyurSutra offers Panchakarma and related therapies like Abhyanga and Shirodhara. For details, visit Treatments in the app.';
  }
  return "I'm here to help with appointments and treatments. Could you please clarify your question?";
}

// POST /api/chatbot/message
router.post('/message', async (req, res) => {
  try {
    const { message, history } = req.body || {};

    // If OpenAI key present, attempt to use it. Otherwise fallback to rule-based reply.
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({ success: true, reply: ruleBasedReply(message) });
    }

    // Minimal OpenAI Chat Completions call (compatible with OpenAI API)
    const sysPrompt = "You are AyurSutra's helpful assistant focused on scheduling and Ayurveda basics. Keep answers concise and safe.";
    const messages = [
      { role: 'system', content: sysPrompt },
      ...(Array.isArray(history) ? history : []).filter(m => m && m.role && m.content),
      { role: 'user', content: String(message || '') }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.2,
        max_tokens: 256
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        timeout: 15000
      }
    );

    const reply = response?.data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.json({ success: true, reply: ruleBasedReply(message) });
    }
    return res.json({ success: true, reply });
  } catch (err) {
    console.error('Chatbot error:', err?.message || err);
    // Never leak internal errors to the client; provide a safe response
    return res.status(200).json({ success: true, reply: ruleBasedReply() });
  }
});

module.exports = router;
