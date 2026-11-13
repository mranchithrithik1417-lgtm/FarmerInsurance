import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { Claim } from '../../types';
import { askCopilot } from '../../services/api';
import { b, t } from '../../utils/translations';

interface Props {
  claim: Claim;
  language?: 'en' | 'kn';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  groundedFacts?: string[];
}

export const AICopilotChat: React.FC<Props> = ({ claim, language = 'en' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: language === 'kn'
        ? `ನಮಸ್ಕಾರ ಅಧಿಕಾರಿಗಳೇ. ನಾನು ಕ್ಲೇಮ್ **${claim.claim_number}** (ರೈತರು: ${claim.farmer.name}) ಗಾಗಿ ನಿಮ್ಮ ಎಐ ಬೆಳೆ ವಿಮಾ ತೀರ್ಪು ಕೋಪೈಲಟ್. ಸೆಂಟಿನೆಲ್-2 NDVI, ಓಪನ್-ಮೀಟಿಯೋ ಮಳೆ ದತ್ತಾಂಶ ಮತ್ತು ಭೂಮಿ ದಾಖಲೆಗಳ ಆಧಾರದ ಮೇಲೆ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.`
        : `Hello Officer. I am your AI Claim Intelligence Copilot for claim **${claim.claim_number}** (Farmer: ${claim.farmer.name}). I am grounded directly in this claim's Sentinel-2 NDVI telemetry, Open-Meteo rainfall records, Bhoomi cadastral records, and photographic EXIF sensors. How can I assist your review?`,
      groundedFacts: [
        `Crop: ${claim.crop.crop_name} (${claim.crop.growth_stage})`,
        `NDVI Delta: ${claim.satellite.ndvi_diff} (-${claim.satellite.vegetation_drop_pct}%)`,
        `Rainfall: ${claim.weather.rainfall_disaster_day_mm} mm (${claim.weather.anomaly_ratio}x baseline)`
      ]
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const suggestedQuestions = [
    language === 'kn' ? 'ಈ ಕ್ಲೇಮ್ ಏಕೆ ಹೆಚ್ಚಿನ ಆದ್ಯತೆಯದ್ದಾಗಿದೆ?' : 'Why is this claim considered high priority?',
    language === 'kn' ? 'NDVI ವ್ಯತ್ಯಾಸ ಮತ್ತು ಉಪಗ್ರಹ ಪುರಾವೆಯನ್ನು ವಿವರಿಸಿ.' : 'Explain the NDVI difference and satellite evidence.',
    language === 'kn' ? 'ವರದಿ ಮಾಡಿದ ಪ್ರವಾಹಕ್ಕೆ ಮಳೆ ಸ್ಥಿರವಾಗಿದೆಯೇ?' : 'Is the rainfall consistent with the reported flood?',
    language === 'kn' ? 'ಯಾವುದಾದರೂ ವಂಚನೆ ಅಥವಾ ವಿರೋಧಾಭಾಸಗಳಿವೆಯೇ?' : 'What are the possible inconsistencies or fraud risks?',
    language === 'kn' ? 'ಅಂದಾಜು ಪರಿಹಾರವನ್ನು ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ?' : 'How was the indicative claim payout calculated?'
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await askCopilot(claim.id, text);
      const botMsg: Message = {
        role: 'assistant',
        content: resp.answer,
        groundedFacts: resp.grounded_facts
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Apologies, unable to process the copilot inquiry at this moment.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-3xl border border-slate-800 flex flex-col h-[520px] shadow-2xl overflow-hidden backdrop-blur-xl text-white">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-950/80 text-cyan-400 rounded-xl border border-indigo-800/60">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {b('AI Reviewer Copilot', 'ಎಐ ವಿಮರ್ಶಕ ಕೋಪೈಲಟ್', language)}
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-800/60 font-bold">
                {b('Grounded in Claim Data', 'ಕ್ಲೇಮ್ ದತ್ತಾಂಶ ಆಧಾರಿತ', language)}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">{b('Context:', 'ಸಂದರ್ಭ:', language)} {claim.claim_number} • {claim.farmer.name}</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="p-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
        <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap pl-1">{b('Ask Copilot:', 'ಕೋಪೈಲಟ್ ಅನ್ನು ಕೇಳಿ:', language)}</span>
        {suggestedQuestions.slice(0, 3).map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg whitespace-nowrap text-[11px] transition border border-slate-700/80 font-medium cursor-pointer shadow-sm"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-cyan-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-line font-medium">{m.content}</div>

                {/* Grounded facts badge */}
                {m.groundedFacts && m.groundedFacts.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400">
                    <span className="font-bold text-cyan-400 block mb-1">Grounded telemetry cross-checks:</span>
                    <ul className="space-y-0.5">
                      {m.groundedFacts.map((f, i) => (
                        <li key={i} className="flex items-center gap-1 font-mono text-slate-300">
                          <span className="text-cyan-400 font-bold">›</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium italic pl-10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {b('Copilot synthesizing telemetry...', 'ಕೋಪೈಲಟ್ ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...', language)}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={b("Ask copilot about NDVI, rainfall anomaly, fraud checks...", 'NDVI, ಮಳೆ ವ್ಯತ್ಯಾಸ ಅಥವಾ ವಂಚನೆ ತಪಾಸಣೆ ಬಗ್ಗೆ ಕೇಳಿ...', language)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs outline-none focus:bg-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl transition cursor-pointer shadow-md shadow-cyan-950/50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
