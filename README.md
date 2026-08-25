# Control Evidence Assessor

A small TypeScript engineering library for registering security-control records, attaching implementation evidence references, and producing deterministic assessment summaries. It can be used as one input to a governance workflow, but it **does not certify NIST compliance** and is not a government authorization system.

## What it does

- validates and normalizes control identifiers such as `AC-1` and `IA-2.1`
- rejects duplicate control registration
- requires non-empty evidence references before marking a control implemented
- deduplicates evidence references
- produces deterministic control ordering and implementation percentages
- handles an empty control set as `0%` rather than `NaN`
- records structured in-memory audit events for control registration and implementation
- returns defensive copies so callers cannot mutate internal state accidentally

## What it does not do

This library does not ship the NIST SP 800-53 catalog, determine control applicability, assess control effectiveness, validate evidence, perform continuous monitoring, produce an authorization package, issue an ATO, or establish legal/regulatory compliance. A `100%` report means only that every control **registered by the caller** was marked implemented with at least one evidence reference.

## Usage

```ts
import { NISTComplianceFramework } from "@skycoin4444/control-evidence-assessor";

const assessor = new NISTComplianceFramework();
assessor.registerControl({
  id: "AC-1",
  family: "AC",
  title: "Access Control Policy",
  description: "Document the organization's access-control policy.",
  implemented: false,
  evidence: [],
});
assessor.implementControl("AC-1", ["policy/access-control.md", "ticket-123"]);

const report = assessor.generateComplianceReport();
```

## Verification

```bash
npm install
npm test
npm audit --audit-level=high
```

`npm test` performs a strict TypeScript build and Node's built-in test suite. CI runs build/tests plus dependency audit on `main`, product branches, and pull requests.

## SKYCOIN4444 integration boundary

The wider ecosystem can consume this as a neutral evidence-status library. Persisted evidence, identity/RBAC, evidence integrity, approval workflows, catalog/version management, external scanner ingestion, and audit-log durability should remain separate services or adapters.

## Status

**Classification:** ENGINEERING LAB / beta library.

Implementation and automated verification can be green without implying NIST compliance. Any real compliance assessment requires an authoritative control baseline, scope, qualified assessors, evidence review, risk decisions, and organization-specific governance.

## License

See `LICENSE`.
