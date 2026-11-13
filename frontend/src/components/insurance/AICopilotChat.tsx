import React, { useState } from 'react';
import { Bot, Send, Sparkles, HelpCircle, CheckCircle2, MessageSquare, CornerDownRight } from 'lucide-react';
import { Claim } from '../../types';
import { askCopilot } from '../../services/api';

interface Props {
  claim: Claim;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  groundedFacts?: string[];
}

export const AICopilotChat: React.FC<Props> = ({ claim }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello Officer. I am your AI Claim Intelligence Copilot for claim **${claim.claim_number}** (Farmer: ${claim.farmer.name}). I am grounded directly in this claim's Sentinel-2 NDVI telemetry, Open-Meteo rainfall records, Bhoomi cadastral records, and photographic EXIF sensors. How can I assist your review?`,
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
    'Why is this claim considered high priority?',
    'Explain the NDVI difference and satellite evidence.',
    'Is the rainfall consistent with the reported flood?',
    'What are the possible inconsistencies or fraud risks?',
    'How was the indicative claim payout calculated?'
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
    <div className="bg-white rounded-3xl border border-slate-200/90 flex flex-col h-[520px] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Reviewer Copilot
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded-full border border-emerald-200">
                Grounded in Claim Data
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Context: {claim.claim_number} • {claim.farmer.name}</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="p-2.5 bg-slate-50/70 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
        <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap pl-1">Ask Copilot:</span>
        {suggestedQuestions.slice(0, 3).map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 rounded-lg whitespace-nowrap text-[11px] transition border border-slate-200 cursor-pointer shadow-2xs"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Grounded facts badge */}
                {m.groundedFacts && m.groundedFacts.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-600">
                    <span className="font-bold text-emerald-700 block mb-1">Grounded telemetry cross-checks:</span>
                    <ul className="space-y-0.5">
                      {m.groundedFacts.map((f, i) => (
                        <li key={i} className="flex items-center gap-1 font-mono text-slate-600">
                          <span className="text-emerald-600">›</span> {f}
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
          <div className="flex items-center gap-2 text-xs text-emerald-700 italic pl-10">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            Copilot synthesizing telemetry...
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask copilot about NDVI, rainfall anomaly, fraud checks..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
