const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

const root = path.join(__dirname, "public");
const dataRoot = __dirname;
const port = Number(process.env.PORT || 5173);
const allowedFiles = new Set(["/", "/index.html", "/styles.css", "/app.js", "/meritlens-demo.png"]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8"
};

function performanceScore(employee) {
  return Math.round(employee.goals * 0.35 + employee.impact * 0.35 + employee.collaboration * 0.18 + employee.growth * 0.12 - employee.risk * 0.08);
}

function readinessScore(employee) {
  return Math.max(0, Math.min(100, Math.round(employee.impact * 0.36 + employee.growth * 0.32 + employee.collaboration * 0.22 - employee.risk * 0.1)));
}

function hasPromptInjection(text) {
  return /ignore|previous instructions|mark me|system prompt|developer message/i.test(text);
}

function maskName(text, employee) {
  return String(text).replaceAll(employee.name.split(" ")[0], "[employee]");
}

function flattenSignals(employee) {
  return Object.entries(employee.systems).flatMap(([source, records]) =>
    records.map((record) => ({ source, record }))
  );
}

function runAgentPipeline(employee) {
  const signals = flattenSignals(employee);
  const score = performanceScore(employee);
  const readiness = readinessScore(employee);
  const injection = hasPromptInjection(employee.selfReview);
  const level = score >= 85 ? "exceeds expectations" : score >= 72 ? "meets expectations" : "needs focused support";

  const evidence = [
    ...employee.highlights.map((item) => ({
      type: "good",
      title: "Verified positive signal",
      detail: maskName(item, employee),
      source: "Evidence Agent"
    })),
    ...employee.concerns.map((item) => ({
      type: employee.risk > 50 ? "bad" : "warn",
      title: "Review attention needed",
      detail: maskName(item, employee),
      source: "Evidence Agent"
    })),
    {
      type: "good",
      title: "Live backend analysis",
      detail: `Ingestion Agent normalized ${signals.length} synthetic HRIS, Jira, GitHub, Salesforce, Slack, or review signals.`,
      source: "Ingestion Agent"
    }
  ];

  const fairness = [
    {
      type: employee.risk > 55 ? "warn" : "good",
      title: "Calibration check",
      detail: employee.risk > 55
        ? "Fairness Agent recommends separating individual performance gaps from workload and system blockers."
        : "Fairness Agent found evidence coverage consistent with the selected rating band."
    },
    {
      type: "good",
      title: "Protected data policy",
      detail: "No age, medical, gender, family, salary, or protected-class fields are used for scoring."
    }
  ];

  const security = [
    {
      type: injection ? "bad" : "good",
      title: "Prompt-injection scan",
      detail: injection
        ? "Self-review contains instruction-like text. Security Agent quarantines it and excludes it from scoring."
        : "No instruction override patterns found in employee-entered text."
    },
    {
      type: "good",
      title: "PII minimization",
      detail: "Backend masks names in evidence snippets and returns only review-safe fields."
    },
    {
      type: "good",
      title: "Audit event",
      detail: `Analysis run ${cryptoRandomId()} recorded for manager review.`
    }
  ];

  const coaching = [
    {
      type: readiness > 80 ? "good" : "warn",
      title: "Next-quarter goal",
      detail: readiness > 80
        ? "Assign broader cross-team ownership with measurable adoption criteria."
        : "Create a narrower 30-60-90 day plan with weekly manager check-ins."
    },
    {
      type: employee.risk > 50 ? "warn" : "good",
      title: "Manager coaching prompt",
      detail: employee.risk > 50
        ? "Ask what work should be removed before adding new goals. Look for systemic blockers, not only individual performance gaps."
        : "Use specific examples from verified evidence and avoid personality-based language."
    }
  ];

  return {
    source: "backend",
    generatedAt: new Date().toISOString(),
    employeeId: employee.id,
    score,
    readiness,
    promptInjection: injection,
    evidence,
    fairness,
    security,
    coaching,
    reviewDraft: `Overall calibration: ${level}.\n\n${employee.name} delivered measurable business value with a performance index of ${score}. The strongest evidence is ${employee.highlights[0].toLowerCase()} The next review conversation should focus on ${employee.concerns[0].toLowerCase()}\n\nRecommended manager action: approve the evidence set, edit tone for company culture, then share a growth plan. MeritLens does not finalize compensation or termination decisions without human approval.`
  };
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function loadEmployees() {
  const file = await fs.readFile(path.join(dataRoot, "data", "employees.json"), "utf8");
  return JSON.parse(file);
}

function sendJson(response, status, payload) {
  response.writeHead(status, securityHeaders("application/json; charset=utf-8"));
  response.end(JSON.stringify(payload, null, 2));
}

function securityHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"
  };
}

async function serveStatic(requestPath, response) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  if (!allowedFiles.has(safePath)) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  const filePath = path.join(root, safePath);
  const extension = path.extname(filePath);
  const body = await fs.readFile(filePath);
  response.writeHead(200, securityHeaders(mimeTypes[extension] || "application/octet-stream"));
  response.end(body);
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    if (url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, service: "MeritLens Agent API" });
      return;
    }

    if (url.pathname === "/api/employees") {
      const employees = await loadEmployees();
      sendJson(response, 200, {
        employees: employees.map(({ selfReview, managerNotes, systems, ...employee }) => employee)
      });
      return;
    }

    const analyzeMatch = url.pathname.match(/^\/api\/analyze\/([a-z0-9-]+)$/i);
    if (analyzeMatch) {
      const employees = await loadEmployees();
      const employee = employees.find((item) => item.id === analyzeMatch[1]);
      if (!employee) {
        sendJson(response, 404, { error: "Employee not found" });
        return;
      }

      sendJson(response, 200, runAgentPipeline(employee));
      return;
    }

    await serveStatic(url.pathname, response);
  } catch (error) {
    sendJson(response, 500, { error: "Internal server error" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`MeritLens running at http://localhost:${port}`);
  console.log("Agent API available at /api/analyze/:employeeId");
});
