# Security Policy

This repository is an engineering library for control/evidence status tracking. It does not itself establish regulatory compliance or authorization.

Report vulnerabilities privately through GitHub security reporting where available.

Security-sensitive integrations should treat evidence references and assessment decisions as untrusted input unless authenticated and validated by the surrounding system. Before production use, add durable audit storage, access control, evidence integrity/provenance, retention rules, catalog/version management, backup/restore, and organization-specific review procedures.

Do not store secrets, credentials, regulated records, or sensitive evidence directly in this in-memory library.
