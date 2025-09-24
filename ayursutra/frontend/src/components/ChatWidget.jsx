import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../services/api';

const bubbleStyle = {
  maxWidth: '80%',
  padding: '10px 12px',
  borderRadius: '12px',
  margin: '6px 0',
  lineHeight: 1.35,
  fontSize: 14
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AyurSutra assistant. How can I help you today?" }
  ]);
  // Voice states
  const [recognizing, setRecognizing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [lang, setLang] = useState('en-IN'); // 'en-IN' | 'hi-IN' | 'te-IN'
  const toggleTts = () => {
    setTtsEnabled((v) => {
      const next = !v;
      if (!next && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch {}
      }
      return next;
    });
  };
  const listRef = useRef(null);
  const recognitionRef = useRef(null);
  const hasSR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Initialize/refresh SpeechRecognition when language changes
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    // stop previous session
    try { recognitionRef.current?.stop?.(); } catch {}
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.onstart = () => setRecognizing(true);
    recognition.onend = () => setRecognizing(false);
    recognition.onerror = () => setRecognizing(false);
    recognition.onresult = (event) => {
      let combined = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      setInput(combined.trim());
    };
    recognitionRef.current = recognition;
    return () => recognition.stop?.();
  }, [lang]);

  const startStopMic = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert('Voice input is not supported in this browser.');
    if (recognizing) rec.stop();
    else rec.start();
  };

  // Speak helper
  const speak = (text) => {
    if (!ttsEnabled) return;
    if (!('speechSynthesis' in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(String(text));
      utter.lang = lang;
      utter.rate = 1;
      utter.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (_) {
      // no-op
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMsgs = [...messages, { role: 'user', content: text }];
    setMessages(nextMsgs);
    setInput('');
    setLoading(true);
    try {
      const { data } = await chatbotAPI.sendMessage({
        message: text,
        history: nextMsgs.slice(-6), // send small context window
        language: lang
      });
      const reply = data?.reply || "I'm here to help.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Floating toggle button when closed
  if (!open) {
    const hasUnread = messages.length > 1; // simple heuristic
    return (
      <button
        aria-label="Open chat"
        title="Chat with AyurSutra Assistant"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          borderRadius: 16,
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 12px 28px rgba(2, 132, 199, 0.35)',
          cursor: 'pointer',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 120ms ease, box-shadow 120ms ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 16px 32px rgba(2, 132, 199, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(2, 132, 199, 0.35)';
        }}
      >
        {/* Chat bubble icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10.5C7 10.2239 7.22386 10 7.5 10H16.5C16.7761 10 17 10.2239 17 10.5C17 10.7761 16.7761 11 16.5 11H7.5C7.22386 11 7 10.7761 7 10.5Z" fill="white"/>
          <path d="M7 7.5C7 7.22386 7.22386 7 7.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H7.5C7.22386 8 7 7.77614 7 7.5Z" fill="white"/>
          <path d="M4 4.75C4 3.23122 5.23122 2 6.75 2H17.25C18.7688 2 20 3.23122 20 4.75V13.25C20 14.7688 18.7688 16 17.25 16H10.3L6.334 19.223C5.82773 19.6355 5.1 19.2773 5.1 18.6295V16H6.75C5.23122 16 4 14.7688 4 13.25V4.75Z" fill="white" fillOpacity="0.9"/>
        </svg>
        {hasUnread && (
          <span
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 10,
              height: 10,
              borderRadius: '9999px',
              background: '#ef4444',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.9)'
            }}
            aria-hidden="true"
          />
        )}
      </button>
    );
  }

  // Opened chat window
  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        width: 360,
        height: 520,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
          color: 'white',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10.5C7 10.2239 7.22386 10 7.5 10H16.5C16.7761 10 17 10.2239 17 10.5C17 10.7761 16.7761 11 16.5 11H7.5C7.22386 11 7 10.7761 7 10.5Z" fill="white"/>
              <path d="M7 7.5C7 7.22386 7.22386 7 7.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H7.5C7.22386 8 7 7.77614 7 7.5Z" fill="white"/>
              <path d="M4 4.75C4 3.23122 5.23122 2 6.75 2H17.25C18.7688 2 20 3.23122 20 4.75V13.25C20 14.7688 18.7688 16 17.25 16H10.3L6.334 19.223C5.82773 19.6355 5.1 19.2773 5.1 18.6295V16H6.75C5.23122 16 4 14.7688 4 13.25V4.75Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>AyurSutra Assistant</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Typically replies in a minute</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language selector */}
          <select
            aria-label="Select language"
            title="Select language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '6px 8px',
              fontSize: 12,
              cursor: 'pointer'
            }}
         >
            <option value="en-IN" style={{ color: '#111827' }}>English</option>
            <option value="hi-IN" style={{ color: '#111827' }}>हिन्दी</option>
            <option value="te-IN" style={{ color: '#111827' }}>తెలుగు</option>
          </select>
          {/* TTS toggle */}
          <button
            onClick={toggleTts}
            title={ttsEnabled ? 'Disable voice playback' : 'Enable voice playback'}
            aria-label="Toggle voice playback"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {/* speaker icon */}
            {ttsEnabled ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9H7L12 5V19L7 15H3V9Z" fill="white"/>
                <path d="M16 8C17.6569 9.65685 17.6569 14.3431 16 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 5.5C21.5376 8.53757 21.5376 15.4624 18.5 18.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9H7L12 5V19L7 15H3V9Z" fill="white" opacity="0.7"/>
                <path d="M16 8C17.6569 9.65685 17.6569 14.3431 16 16" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <line x1="20" y1="4" x2="14" y2="20" stroke="white" strokeWidth="2"/>
              </svg>
            )}
          </button>
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: 16,
              cursor: 'pointer'
            }}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
          background: '#f8fafc'
        }}
      >
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                ...bubbleStyle,
                background: m.role === 'user' ? '#0ea5e9' : '#e5e7eb',
                color: m.role === 'user' ? 'white' : '#111827'
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>Assistant is typing…</div>
        )}
      </div>

      <div style={{ padding: 10, borderTop: '1px solid #e5e7eb', background: 'white' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message..."
            rows={2}
            style={{
              flex: 1,
              resize: 'none',
              padding: 8,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14
            }}
          />
          {/* Microphone button */}
          <button
            onClick={startStopMic}
            title={!hasSR ? 'Voice input not supported in this browser' : (recognizing ? 'Stop recording' : 'Speak')}
            aria-label="Voice input"
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: !hasSR ? '#f3f4f6' : (recognizing ? '#fee2e2' : 'white'),
              color: !hasSR ? '#9ca3af' : (recognizing ? '#b91c1c' : '#111827'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !hasSR ? 'not-allowed' : 'pointer'
            }}
            disabled={!hasSR}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14C13.6569 14 15 12.6569 15 11V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V11C9 12.6569 10.3431 14 12 14Z" fill="currentColor"/>
              <path d="M5 11C5 14.3137 7.68629 17 11 17H13C16.3137 17 19 14.3137 19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={send}
            disabled={loading}
            style={{
              background: loading ? '#93c5fd' : '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
