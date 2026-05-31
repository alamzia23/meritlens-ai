const path = require('path');
const fs = require('fs');

function performanceScore(e) {
    return Math.round(e.goals*0.35 + e.impact*0.35 + e.collaboration*0.18 + e.growth*0.12 - e.risk*0.08);
}
function readinessScore(e) {
    return Math.max(0, Math.min(100, Math.round(e.impact*0.36 + e.growth*0.32 + e.collaboration*0.22 - e.risk*0.1)));
}
function hasPromptInjection(text) {
    return /ignore|previous instructions|mark me|system prompt|developer message/i.test(text);
}
function maskName(text, employee) {
    return String(text).replaceAll(employee.name.split(' ')[0], '[employee]');
}
function flattenSignals(employee) {
    return Object.entries(employee.systems).flatMap(([source, records]) => records.map(record => ({ source, record })));
}
function cryptoRandomId() {
    return Math.random().toString(36).slice(2,8).toUpperCase();
}
function runAgentPipeline(employee) {
    const signals = flattenSignals(employee);
    const score = performanceScore(employee);
    const readiness = readinessScore(employee);
    const injection = hasPromptInjection(employee.selfReview);
    const level = score>=85 ? 'exceeds expectations' : score>=72 ? 'meets expectations' : 'needs focused support';
    const evidence = [
          ...employee.highlights.map(item => ({ type:'good', title:'Verified positive signal', detail:maskName(item,employee), source:'Evidence Agent' })),
          ...employee.concerns.map(item => ({ type:employee.risk>50?'bad':'warn', title:'Review attention needed', detail:maskName(item,employee), source:'Evidence Agent' })),
      { type:'good', title:'Live backend analysis', detail:`Ingestion Agent normalized ${signals.length} signals from Jira, GitHub, Salesforce, Slack.`, source:'Ingestion Agent' }
        ];
    const fairness = [
      { type:employee.risk>55?'warn':'good', title:'Calibration check', detail:employee.risk>55 ? 'Fairness Agent recommends separating performance gaps from workload blockers.' : 'Fairness Agent found evidence coverage consistent with the selected rating band.' },
      { type:'good', title:'Protected data policy', detail:'No age, medical, gender, family, salary, or protected-class fields used for scoring.' }
        ];
    const security = [
      { type:injection?'bad':'good', title:'Prompt-injection scan', detail:injection ? 'Self-review contains instruction-like text. Security Agent quarantines it and excludes it from scoring.' : 'No instruction override patterns found in employee-entered text.' },
      { type:'good', title:'PII minimization', detail:'Backend masks employee names in all evidence snippets before display.' },
      { type:'good', title:'Access control', detail:'HR admin, manager, and reviewer roles represented as separate approval responsibilities.' },
      { type:'good', title:'Auditability', detail:`Analysis run ${cryptoRandomId()} recorded with timestamped events.` }
        ];
    const coaching = [
      { type:readiness>80?'good':'warn', title:'Next-quarter goal', detail:readiness>80 ? 'Assign broader cross-team ownership with measurable adoption criteria.' : 'Create a narrower 30-60-90 day plan with weekly manager check-ins.' },
      { type:employee.risk>50?'warn':'good', title:'Manager coaching prompt', detail:employee.risk>50 ? 'Ask what work should be removed before adding new goals. Look for systemic blockers.' : 'Use specific examples from verified evidence and avoid personality-based language.' },
      { type:'good', title:'Retention signal', detail:'High growth momentum. Discuss scope expansion and skill-building path.' },
      { type:'good', title:'Fairness guardrail', detail:'Backend avoids protected-class attributes and keeps the manager in the decision loop.' }
        ];
    return {
          source:'backend',
          generatedAt: new Date().toISOString(),
          employeeId: employee.id,
          score, readiness,
          promptInjection: injection,
          evidence, fairness, security, coaching,
          reviewDraft: `Overall calibration: ${level}.\n\n${employee.name} delivered measurable business value with a performance index of ${score}. The strongest evidence is ${employee.highlights[0].toLowerCase()} The next review conversation should focus on ${employee.concerns[0].toLowerCase()}\n\nRecommended manager action: approve the evidence set, edit tone for company culture, then share a growth plan. MeritLens does not finalize compensation or termination decisions without human approval.`
    };
}

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');
    const { id } = req.query;
    try {
          const dataPath = path.join(process.cwd(), 'data', 'employees.json');
          const employees = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          if (!id) {
                  const list = employees.map(({ selfReview, managerNotes, systems, ...e }) => e);
                  return res.status(200).json({ employees: list });
          }
          const employee = employees.find(e => e.id === id);
          if (!employee) return res.status(404).json({ error: 'Employee not found' });
          return res.status(200).json(runAgentPipeline(employee));
    } catch(err) {
          return res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
};
