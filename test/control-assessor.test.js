const test = require("node:test");
const assert = require("node:assert/strict");

const { NISTComplianceFramework } = require("../dist/index.js");

function sampleControl(overrides = {}) {
  return {
    id: "AC-1",
    family: "ac",
    title: "Access Control Policy",
    description: "Document an access control policy.",
    implemented: false,
    evidence: [],
    ...overrides,
  };
}

test("empty framework reports zero percent without NaN", () => {
  const framework = new NISTComplianceFramework();
  const report = framework.generateComplianceReport(1234);
  assert.equal(report.timestamp, 1234);
  assert.equal(report.totalControls, 0);
  assert.equal(report.implementedControls, 0);
  assert.equal(report.compliancePercentage, 0);
  assert.deepEqual(report.findings, []);
});

test("registered controls are validated and normalized", () => {
  const framework = new NISTComplianceFramework();
  framework.registerControl(sampleControl());
  const control = framework.getControl("ac-1");
  assert.equal(control.id, "AC-1");
  assert.equal(control.family, "AC");
  assert.throws(() => framework.registerControl(sampleControl()), /already registered/);
  assert.throws(() => framework.registerControl(sampleControl({ id: "bad" })), /control id/);
});

test("implementation requires evidence and updates deterministic report", () => {
  const framework = new NISTComplianceFramework();
  framework.registerControl(sampleControl());
  framework.registerControl(sampleControl({ id: "IA-2", family: "IA", title: "Identification", description: "Identify users." }));
  assert.throws(() => framework.implementControl("AC-1", ["  "]), /evidence/);
  framework.implementControl("AC-1", ["ticket-123", "ticket-123", "policy/access-control.md"]);

  const report = framework.generateComplianceReport(42);
  assert.equal(report.compliancePercentage, 50);
  assert.equal(report.implementedControls, 1);
  assert.equal(report.totalControls, 2);
  assert.deepEqual(report.controls[0].evidence, ["ticket-123", "policy/access-control.md"]);
  assert.equal(report.findings.length, 1);
  assert.match(report.findings[0], /IA-2/);
});

test("unknown controls fail closed and audit trail is structured", () => {
  const framework = new NISTComplianceFramework();
  framework.registerControl(sampleControl());
  assert.throws(() => framework.implementControl("SC-7", ["evidence"]), /unknown control/);
  framework.implementControl("AC-1", ["evidence-1"]);
  const trail = framework.getAuditTrail();
  assert.equal(trail.length, 2);
  assert.equal(trail[0].action, "control.registered");
  assert.equal(trail[1].action, "control.implemented");
});
