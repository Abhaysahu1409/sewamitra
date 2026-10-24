import { useState, useRef, useEffect } from 'react';
import { Mic, X, Volume2, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const ASSISTANT_RESPONSES: Record<string, string> = {
  plumber: 'I can help you find a plumber nearby. Would you like me to search for verified plumbers in your area?',
  electrician: 'Looking for an electrician? I can show you verified electrical workers near you. Shall I search now?',
  clean: 'I found several cleaning professionals available today. You can book individual or group cleaning services.',
  book: 'To book a service, just say the service type and your preferred time. For example: "Book a plumber tomorrow at 10 AM".',
  price: 'Service prices vary by worker and typically range from ₹200 to ₹800 per hour. You can filter by budget in the search page.',
  hello: 'Hello! I am Sewamitra\'s voice assistant. I can help you find workers, book services, check booking status, and more. What do you need help with?',
  default: 'I can help you find workers for plumbing, electrical, cleaning, carpentry, painting, gardening, and driving. Just tell me what service you need!',
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste')) return ASSISTANT_RESPONSES.hello;
  if (lower.includes('plumb')) return ASSISTANT_RESPONSES.plumber;
  if (lower.includes('electric')) return ASSISTANT_RESPONSES.electrician;
  if (lower.includes('clean')) return ASSISTANT_RESPONSES.clean;
  if (lower.includes('book')) return ASSISTANT_RESPONSES.book;
  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) return ASSISTANT_RESPONSES.price;
  return ASSISTANT_RESPONSES.default;
}

export function VoiceAssistant() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [supported, setSupported] = useState(false);
  const recRef = useRef<unknown>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (SR) {
      setSupported(true);
      const rec = new (SR as new () => {
        continuous: boolean; interimResults: boolean; lang: string;
        onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
        onend: () => void; onerror: () => void; start: () => void; stop: () => void;
      })();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-IN';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    const resp = getResponse(text);
    const aiMsg: Message = { role: 'assistant', text: resp };
    setMessages((m) => [...m, userMsg, aiMsg]);
    speak(resp);
    setInput('');
  };

  const startListening = () => {
    const rec = recRef.current as { start: () => void; stop: () => void } | null;
    if (rec && !listening) {
      setListening(true);
      rec.start();
    } else if (rec && listening) {
      rec.stop();
      setListening(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          if (messages.length === 0) {
            setMessages([{ role: 'assistant', text: ASSISTANT_RESPONSES.hello }]);
          }
        }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl shadow-teal-500/40 transition-transform hover:scale-110 active:scale-95"
        aria-label={t('voiceAssistant')}
      >
        <Mic size={24} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="h-3 w-3 rounded-full bg-teal-500" />
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <div>
            <p className="text-sm font-bold">Sewa Voice Assistant</p>
            <p className="text-[10px] text-teal-100">AI-powered · Multilingual</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-lg p-1 transition hover:bg-white/20">
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.text}
              {m.role === 'assistant' && (
                <button onClick={() => speak(m.text)} className="ml-2 inline-flex align-middle text-slate-500 hover:text-teal-600">
                  <Volume2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type or speak..."
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          {supported && (
            <button
              onClick={startListening}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Mic size={18} />
            </button>
          )}
          <button
            onClick={() => sendMessage(input)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700"
          >
            <Sparkles size={18} />
          </button>
        </div>
        {listening && <p className="mt-2 text-center text-xs text-rose-500">Listening...</p>}
      </div>
    </div>
  );
}
