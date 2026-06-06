import { useState, useRef, useEffect } from 'react';

const styles = {
  app: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '600', color: '#1a1a1a' },
  subtitle: { fontSize: '13px', color: '#888', marginTop: '4px' },
  chatBox: { border: '1px solid #e5e5e5', borderRadius: '12px', padding: '16px', height: '420px', overflowY: 'auto', marginBottom: '12px', background: '#fafafa' },
  bubble: (role) => ({ display: 'flex', justifyContent: role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }),
  msg: (role) => ({ maxWidth: '78%', padding: '10px 14px', borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: role === 'user' ? '#1a1a1a' : '#fff', color: role === 'user' ? '#fff' : '#1a1a1a', fontSize: '14px', lineHeight: '1.5', border: role === 'bot' ? '1px solid #e5e5e5' : 'none' }),
  inputRow: { display: 'flex', gap: '8px' },
  input: { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '14px', outline: 'none' },
  btn: { padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  typing: { color: '#aaa', fontSize: '13px', padding: '4px 0' },
  suggestions: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  chip: { padding: '5px 12px', border: '1px solid #e5e5e5', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#555' },
};

const SUGGESTIONS = [
  'What is check-in time?', 'Do you allow pets?',
  'Is breakfast included?', 'What rooms are available?'
];

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! Welcome to The Grand Hotel 🏨 How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5001/rag-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'bot', text: data.reply || 'Sorry, something went wrong.' }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Network error. Is the backend running?' }]);
    }
    setLoading(false);
  };

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.title}>The Grand Hotel</div>
        <div style={styles.subtitle}>AI Concierge — available 24/7</div>
      </div>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={styles.bubble(m.role)}>
            <div style={styles.msg(m.role)}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={styles.typing}>Typing...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={styles.suggestions}>
        {SUGGESTIONS.map(s => <button key={s} style={styles.chip} onClick={() => sendMessage(s)}>{s}</button>)}
      </div>
      <div style={styles.inputRow}>
        <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask anything about the hotel..." />
        <button style={styles.btn} onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  );
}