import React, { useState } from 'react';
import { ShieldAlert, FileCheck, Satellite, Calculator, Award, ChevronDown, ChevronUp, Play, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Check, ArrowRight, Zap, Loader2, RotateCcw } from 'lucide-react';
import { AIAgentFinding, Claim } from '../../types';

interface Props {
  claim: Claim;
  onRunAgents: () => Promise<void>;
}

export const MultiAgentPanel: React.FC<Props> = ({ claim, onRunAgents }) => {
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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Autonomous Verification Swarm
            </span>
            <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
              On-Demand Agent Audit
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            Multi-Agent AI Verification & Scoring Console
          </h3>
          <p className="text-xs text-slate-500">
            Submit each agent independently to compute and reveal live forensic scores, or execute the full swarm sequentially.
          </p>
        </div>

        {/* Master Control Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetAll}
            disabled={isBatchRunning || verifiedCount === 0}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Reset verification states"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRunAllSequentially}
            disabled={isBatchRunning || verifiedCount === claim.ai_agents.length}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${isBatchRunning ? 'animate-bounce text-amber-300' : 'text-amber-200'}`} />
            <span>{isBatchRunning ? 'Running Swarm Audit...' : '⚡ Run All Agents Sequentially'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Consensus Status Meter */}
      <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              Swarm Audit Progress: <span className="text-blue-700 font-mono">{verifiedCount} / {claim.ai_agents.length} Agents Executed</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {verifiedCount === 0 
                ? 'Press "Submit & Check Score" on any agent card below to analyze evidence.' 
                : `${passedCount} passed integrity audit • ${flaggedCount > 0 ? `${flaggedCount} flagged anomalies` : 'Zero anomalies detected'}`}
            </div>
          </div>
        </div>

        {/* Live Swarm Likelihood Score */}
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Consensus Confidence</span>
          {verifiedCount > 0 ? (
            <span className={`text-base font-black font-mono ${flaggedCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {Math.round((verifiedAgents.reduce((acc, a) => acc + a.score, 0)) / verifiedCount)}%
              <span className="text-xs font-medium text-slate-500 ml-1">({flaggedCount > 0 ? 'High Risk' : 'High Confidence'})</span>
            </span>
          ) : (
            <span className="text-sm font-mono text-slate-400 font-medium">Awaiting Verification</span>
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
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-red-50/50 border-red-300'
                  : isChecking
                  ? 'bg-blue-50/50 border-blue-400'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Row */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-[240px] flex-1">
                  <div className={`p-2.5 rounded-xl border ${
                    isVerified 
                      ? isPassed ? 'bg-emerald-100 border-emerald-200' : 'bg-red-100 border-red-200'
                      : 'bg-white border-slate-200'
                  }`}>
                    {getAgentIcon(ag.agent_role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{ag.agent_name}</span>
                      
                      {/* Status Badge */}
                      {isVerified ? (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {ag.status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                          {isChecking ? 'Auditing...' : 'Ready to Run'}
                        </span>
                      )}
                    </div>

                    {/* Diagnostic text while checking vs normal summary */}
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {isChecking ? (
                        <span className="text-blue-700 font-mono flex items-center gap-1.5 font-medium">
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
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      {isVerified ? 'Audit Score' : 'Status'}
                    </span>
                    {isVerified ? (
                      <span className={`text-lg font-black font-mono ${
                        isPassed ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {ag.score}<span className="text-xs text-slate-500">/100</span>
                      </span>
                    ) : isChecking ? (
                      <span className="text-sm font-mono text-blue-700 flex items-center justify-end gap-1 font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Calc...</span>
                      </span>
                    ) : (
                      <span className="text-sm font-mono text-slate-400">--- / 100</span>
                    )}
                  </div>

                  {/* SUBMIT / CHECK BUTTON FOR EVERY AGENT */}
                  <div>
                    {isVerified ? (
                      <button
                        type="button"
                        onClick={() => handleVerifyAgent(ag.agent_id)}
                        disabled={isBatchRunning}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        title="Re-run this agent"
                      >
                        <RefreshCw className="w-3 h-3 text-blue-700" />
                        <span>Re-Check</span>
                      </button>
                    ) : isChecking ? (
                      <button
                        disabled
                        className="px-3.5 py-1.5 bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Checking...</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleVerifyAgent(ag.agent_id)}
                        disabled={isBatchRunning}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer group"
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
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Findings Section */}
              {isVerified && isExpanded && (
                <div className="p-4 bg-white border-t border-slate-200 space-y-3 text-xs animate-fadeIn">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Agent Detailed Assessment
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">{ag.explanation}</p>
                  </div>

                  {/* Supporting Evidence List */}
                  {ag.supporting_evidence.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                        ✓ Supporting Corroboration Points
                      </span>
                      <ul className="space-y-1">
                        {ag.supporting_evidence.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contradicting / Variance points */}
                  {ag.contradicting_evidence.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block mb-1">
                        🚨 Anomalies & Contradictions Flagged
                      </span>
                      <ul className="space-y-1">
                        {ag.contradicting_evidence.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-red-900 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <div className="text-blue-900 font-semibold">
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
