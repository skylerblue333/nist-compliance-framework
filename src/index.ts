export interface SecurityControl {
  id: string;
  family: string;
  title: string;
  description: string;
  implemented: boolean;
  evidence: string[];
}

export interface ComplianceReport {
  timestamp: number;
  controls: SecurityControl[];
  compliancePercentage: number;
  implementedControls: number;
  totalControls: number;
  findings: string[];
}

export interface AuditEvent {
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
}

const CONTROL_ID = /^[A-Z]{2,3}-\d+(?:\.\d+)?$/;

function normalizeEvidence(evidence: string[]): string[] {
  return [...new Set(evidence.map((item) => item.trim()).filter(Boolean))];
}

function cloneControl(control: SecurityControl): SecurityControl {
  return { ...control, evidence: [...control.evidence] };
}

export class NISTComplianceFramework {
  private readonly controls = new Map<string, SecurityControl>();
  private readonly auditEvents: AuditEvent[] = [];

  registerControl(control: SecurityControl): void {
    const id = control.id.trim().toUpperCase();
    if (!CONTROL_ID.test(id)) throw new Error("control id must look like AC-1 or IA-2.1");
    if (!control.family.trim() || !control.title.trim() || !control.description.trim()) {
      throw new Error("control family, title, and description are required");
    }
    if (this.controls.has(id)) throw new Error(`control ${id} is already registered`);

    const normalized: SecurityControl = {
      ...control,
      id,
      family: control.family.trim().toUpperCase(),
      title: control.title.trim(),
      description: control.description.trim(),
      evidence: normalizeEvidence(control.evidence),
    };
    this.controls.set(id, normalized);
    this.recordAudit("control.registered", { controlId: id });
  }

  implementControl(controlId: string, evidence: string[]): void {
    const id = controlId.trim().toUpperCase();
    const control = this.controls.get(id);
    if (!control) throw new Error(`unknown control ${id}`);

    const normalized = normalizeEvidence(evidence);
    if (normalized.length === 0) throw new Error("at least one non-empty evidence reference is required");

    control.implemented = true;
    control.evidence = normalizeEvidence([...control.evidence, ...normalized]);
    this.recordAudit("control.implemented", { controlId: id, evidenceCount: normalized.length });
  }

  getControl(controlId: string): SecurityControl | undefined {
    const control = this.controls.get(controlId.trim().toUpperCase());
    return control ? cloneControl(control) : undefined;
  }

  generateComplianceReport(now = Date.now()): ComplianceReport {
    const controls = [...this.controls.values()].map(cloneControl).sort((a, b) => a.id.localeCompare(b.id));
    const implementedControls = controls.filter((control) => control.implemented).length;
    const totalControls = controls.length;
    const compliancePercentage = totalControls === 0 ? 0 : (implementedControls / totalControls) * 100;
    const findings = controls
      .filter((control) => !control.implemented)
      .map((control) => `Control ${control.id} (${control.title}) lacks implementation evidence`);

    return { timestamp: now, controls, compliancePercentage, implementedControls, totalControls, findings };
  }

  getAuditTrail(): AuditEvent[] {
    return this.auditEvents.map((event) => ({ ...event, details: { ...event.details } }));
  }

  private recordAudit(action: string, details: Record<string, unknown>): void {
    this.auditEvents.push({ timestamp: new Date().toISOString(), action, details: { ...details } });
  }
}

export default NISTComplianceFramework;
