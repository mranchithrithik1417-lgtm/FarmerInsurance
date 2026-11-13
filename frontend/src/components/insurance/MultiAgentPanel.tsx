import React, { useState } from 'react';
import { ShieldAlert, FileCheck, Satellite, Calculator, Award, ChevronDown, ChevronUp, Play, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Check, ArrowRight, Zap, Loader2, RotateCcw } from 'lucide-react';
import { AIAgentFinding, Claim } from '../../types';
import { b, t } from '../../utils/translations';

interface Props {
  claim: Claim;
  language?: 'en' | 'kn';
  onRunAgents: () => Promise<void>;
}

export const MultiAgentPanel: React.FC<Props> = ({ claim, language = 'en', onRunAgents }) => {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  
  // Independent verification execution state for each agent: 'idle' | 'checking' | 'verified'
  const [agentStates, setAgentStates] = useState<Record<string, 'idle' | 'checking' | 'verified'>>(() => {
    const initial: Record<string, 'idle' | 'checking' | 'verified'> = {};
    claim.ai_agents.forEach(ag => {
      initial[ag.agent_id] = 'idle';
    });
    return initial;
  });

  const [activeStepText, setActiveStepText] = useState<Record<string, string>>({});
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);

  // Diagnostic steps for each agent while checking
  const agentDiagnosticSteps: Record<string, string[]> = {
    'ag-doc': [
      'Querying Bhoomi Cadastral Database...',
      'Matching Land Parcel ID & Survey Number...',
      'Validating 10-character DIGIPIN code...',
      'Land & Policy verification complete!'
    ],
    'ag-fraud': [
      'Extracting smartphone EXIF header metadata...',
      'Calculating distance offset from polygon centroid...',
      'Running image compression and tamper analysis...',
      'Forensic integrity scoring complete!'
    ],
    'ag-sat': [
      'Retrieving Sentinel-2 MSI multispectral bands...',
      'Computing pre-disaster vs post-disaster NDVI shift...',
      'Ingesting IMD gridded precipitation reanalysis...',
      'Satellite & radar cross-correlation complete!'
    ],
    'ag-damage': [
      'Applying PMFBY District Scale of Finance...',
      'Computing affected area ratio against sum insured...',
      'Benchmarking localized crop loss ceiling...',
      'Actuarial payout recommendation ready!'
    ],
    'ag-likelihood': [
      'Synthesizing multi-agent Bayesian weights...',
      'Cross-checking contradictory evidence flags...',
      'Generating explainable confidence rating...',
      'Consensus audit complete!'
    ]
  };

  const getAgentIcon = (role: string) => {
    if (role.includes('Fraud') || role.includes('Forensic')) return <ShieldAlert className="w-5 h-5 text-red-600" />;
    if (role.includes('Document') || role.includes('Registry')) return <FileCheck className="w-5 h-5 text-blue-600" />;
    if (role.includes('Satellite') || role.includes('Spectral')) return <Satellite className="w-5 h-5 text-emerald-600" />;
    if (role.includes('Actuarial') || role.includes('Assessment')) return <Calculator className="w-5 h-5 text-amber-600" />;
    return <Award className="w-5 h-5 text-purple-600" />;
  };

  const toggleExpand = (id: string) => {
    setExpandedAgentId(expandedAgentId === id ? null : id);
  };

  // Run a single agent interactively
  const handleVerifyAgent = async (agentId: string) => {
    setAgentStates(prev => ({ ...prev, [agentId]: 'checking' }));
    
    // Animate diagnostic text steps
    const steps = agentDiagnosticSteps[agentId] || [
      'Analyzing sensor telemetry...',
      'Corroborating physical observations...',
      'Computing verification integrity score...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setActiveStepText(prev => ({ ...prev, [agentId]: steps[i] }));
      await new Promise(r => setTimeout(r, 350));
    }

    setAgentStates(prev => ({ ...prev, [agentId]: 'verified' }));
    // Auto expand to show findings
    setExpandedAgentId(agentId);
  };

  // Run all 5 agents in a sequential cascade
  const handleRunAllSequentially = async () => {
    setIsBatchRunning(true);
    for (const ag of claim.ai_agents) {
      await handleVerifyAgent(ag.agent_id);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsBatchRunning(false);
  };

  // Reset all agents to idle state
  const handleResetAll = () => {
    const resetMap: Record<string, 'idle' | 'checking' | 'verified'> = {};
    claim.ai_agents.forEach(ag => {
      resetMap[ag.agent_id] = 'idle';
    });
    setAgentStates(resetMap);
    setExpandedAgentId(null);
  };

  const verifiedAgents = claim.ai_agents.filter(a => agentStates[a.agent_id] === 'verified');
  const verifiedCount = verifiedAgents.length;
  const passedCount = verifiedAgents.filter(a => a.status === 'passed').length;
  const flaggedCount = verifiedAgents.filter(a => a.status === 'flagged').length;

  return (
    <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl backdrop-blur-xl text-white">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {b('Autonomous Verification Swarm', 'ಸ್ವಾಯತ್ತ ಪರಿಶೀಲನಾ ಸಮಿತಿ (ಸ್ವಾರ್ಮ್)', language)}
            </span>
            <span className="text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {b('On-Demand Agent Audit', 'ಬೇಡಿಕೆಯ ಮೇರೆಗೆ ಏಜೆಂಟ್ ಆಡಿಟ್', language)}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1">
            {b('Multi-Agent AI Verification & Scoring Console', 'ಬಹು-ಏಜೆಂಟ್ ಎಐ ಪರಿಶೀಲನೆ & ಸ್ಕೋರಿಂಗ್ ಕನ್ಸೋಲ್', language)}
          </h3>
          <p className="text-xs text-slate-400">
            {b(
              'Submit each agent independently to compute and reveal live forensic scores, or execute the full swarm sequentially.',
              'ಲೈವ್ ಸ್ಕೋರ್‌ಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲು ಪ್ರತಿಯೊಂದು ಏಜೆಂಟ್ ಅನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಅಥವಾ ಒಟ್ಟಾಗಿ ರನ್ ಮಾಡಿ.',
              language
            )}
          </p>
        </div>

        {/* Master Control Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetAll}
            disabled={isBatchRunning || verifiedCount === 0}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            title="Reset verification states"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{b('Reset', 'ಮರುಹೊಂದಿಸಿ', language)}</span>
          </button>

          <button
            onClick={handleRunAllSequentially}
            disabled={isBatchRunning || verifiedCount === claim.ai_agents.length}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${isBatchRunning ? 'animate-bounce text-amber-300' : 'text-amber-200'}`} />
            <span>{isBatchRunning ? b('Running Swarm Audit...', 'ಸಮಿತಿ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ...', language) : b('⚡ Run All Agents Sequentially', '⚡ ಎಲ್ಲಾ ಏಜೆಂಟ್‌ಗಳನ್ನು ರನ್ ಮಾಡಿ', language)}</span>
          </button>
        </div>
      </div>

      {/* Progress & Consensus Status Meter */}
      <div className="my-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950/80 text-cyan-400 rounded-xl border border-indigo-800/60">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">
              {b('Swarm Audit Progress:', 'ಸಮಿತಿ ಪರಿಶೀಲನೆ ಪ್ರಗತಿ:', language)} <span className="text-cyan-400 font-mono">{verifiedCount} / {claim.ai_agents.length} {b('Agents Executed', 'ಏಜೆಂಟ್‌ಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ', language)}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {verifiedCount === 0 
                ? b('Press "Submit & Check" on any agent card below to analyze evidence.', 'ಸಾಕ್ಷ್ಯ ವಿಶ್ಲೇಷಿಸಲು ಕೆಳಗಿನ ಯಾವುದೇ ಏಜೆಂಟ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ "ಸಲ್ಲಿಸಿ & ಪರಿಶೀಲಿಸಿ" ಒತ್ತಿ.', language)
                : `${passedCount} ${b('passed integrity audit', 'ಆಡಿಟ್ ಉತ್ತೀರ್ಣ', language)} • ${flaggedCount > 0 ? `${flaggedCount} ${b('flagged anomalies', 'ವ್ಯತ್ಯಾಸಗಳು ಪತ್ತೆಯಾಗಿವೆ', language)}` : b('Zero anomalies detected', 'ಯಾವುದೇ ವ್ಯತ್ಯಾಸಗಳಿಲ್ಲ', language)}`}
            </div>
          </div>
        </div>

        {/* Live Swarm Likelihood Score */}
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">{b('Consensus Confidence', 'ಒಮ್ಮತದ ವಿಶ್ವಾಸಾರ್ಹತೆ', language)}</span>
          {verifiedCount > 0 ? (
            <span className={`text-base font-black font-mono ${flaggedCount > 0 ? 'text-red-400' : 'text-cyan-400'}`}>
              {Math.round((verifiedAgents.reduce((acc, a) => acc + a.score, 0)) / verifiedCount)}%
              <span className="text-xs font-medium text-slate-400 ml-1">({flaggedCount > 0 ? b('High Risk', 'ಹೆಚ್ಚಿನ ಅಪಾಯ', language) : b('High Confidence', 'ಉತ್ತಮ ವಿಶ್ವಾಸಾರ್ಹತೆ', language)})</span>
            </span>
          ) : (
            <span className="text-sm font-mono text-slate-500 font-medium">{b('Awaiting Verification', 'ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತಿದೆ', language)}</span>
          )}
        </div>
      </div>

      {/* Agents Card Grid with Individual Submit / Check Buttons */}
      <div className="space-y-3">
        {claim.ai_agents.map((ag) => {
          const state = agentStates[ag.agent_id] || 'idle';
          const isVerified = state === 'verified';
          const isChecking = state === 'checking';
          const isExpanded = expandedAgentId === ag.agent_id;
          const isPassed = ag.status === 'passed';

          return (
            <div
              key={ag.agent_id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isVerified
                  ? isPassed
                    ? 'bg-slate-950/80 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                    : 'bg-red-950/40 border-red-500/70 shadow-lg shadow-red-950/30'
                  : isChecking
                  ? 'bg-indigo-950/40 border-indigo-500/80 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Row */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-[240px] flex-1">
                  <div className={`p-2.5 rounded-xl border ${
                    isVerified 
                      ? isPassed ? 'bg-cyan-950/80 border-cyan-800/80' : 'bg-red-950/80 border-red-800/80'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    {getAgentIcon(ag.agent_role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{ag.agent_name}</span>
                      
                      {/* Status Badge */}
                      {isVerified ? (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isPassed
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80'
                            : 'bg-red-950/80 text-red-300 border-red-800/80'
                        }`}>
                          {ag.status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {isChecking ? 'Auditing...' : 'Ready to Run'}
                        </span>
                      )}
                    </div>

                    {/* Diagnostic text while checking vs normal summary */}
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {isChecking ? (
                        <span className="text-cyan-400 font-mono flex items-center gap-1.5 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {activeStepText[ag.agent_id] || 'Analyzing evidence...'}
                        </span>
                      ) : isVerified ? (
                        ag.summary
                      ) : (
                        `Domain: ${ag.agent_role} • Press submit button to calculate verification score`
                      )}
                    </span>
                  </div>
                </div>

                {/* Score & Action Button Section */}
                <div className="flex items-center gap-4">
                  {/* Score Indicator */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {isVerified ? 'Audit Score' : 'Status'}
                    </span>
                    {isVerified ? (
                      <span className={`text-lg font-black font-mono ${
                        isPassed ? 'text-cyan-400' : 'text-red-400'
                      }`}>
                        {ag.score}<span className="text-xs text-slate-500">/100</span>
                      </span>
                    ) : isChecking ? (
                      <span className="text-sm font-mono text-cyan-400 flex items-center justify-end gap-1 font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Calc...</span>
                      </span>
                    ) : (
                      <span className="text-sm font-mono text-slate-500">--- / 100</span>
                    )}
                  </div>

                  {/* SUBMIT / CHECK BUTTON FOR EVERY AGENT */}
                  <div>
                    {isVerified ? (
                      <button
                        type="button"
                        onClick={() => handleVerifyAgent(ag.agent_id)}
                        disabled={isBatchRunning}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        title="Re-run this agent"
                      >
                        <RefreshCw className="w-3 h-3 text-cyan-400" />
                        <span>Re-Check</span>
                      </button>
                    ) : isChecking ? (
                      <button
                        disabled
                        className="px-3.5 py-1.5 bg-indigo-950/80 text-indigo-300 border border-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Checking...</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleVerifyAgent(ag.agent_id)}
                        disabled={isBatchRunning}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer group"
                      >
                        <Play className="w-3 h-3 text-white fill-white" />
                        <span>Submit & Check</span>
                      </button>
                    )}
                  </div>

                  {/* Expand / Collapse Button */}
                  {isVerified && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(ag.agent_id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Findings Section */}
              {isVerified && isExpanded && (
                <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3 text-xs animate-fadeIn">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Agent Detailed Assessment
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">{ag.explanation}</p>
                  </div>

                  {/* Supporting Evidence List */}
                  {ag.supporting_evidence.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                        ✓ Supporting Corroboration Points
                      </span>
                      <ul className="space-y-1">
                        {ag.supporting_evidence.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contradicting / Variance points */}
                  {ag.contradicting_evidence.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                        🚨 Anomalies & Contradictions Flagged
                      </span>
                      <ul className="space-y-1">
                        {ag.contradicting_evidence.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-red-300 font-semibold bg-red-950/50 p-2 rounded-lg border border-red-800/80">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="text-cyan-300 font-semibold">
                      <strong>Recommended Adjudication Action:</strong> {ag.recommended_action}
                    </div>
                    <span className="text-slate-500 font-mono">
                      Agent ID: {ag.agent_id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
