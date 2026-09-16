---
name: btp
description: Use this skill whenever working on the BTP tender-response SaaS MateriaBTP, including DCE analysis, tender documents, RC, CCTP, CCAP, annexes, Go/No-Go decisions, requirement extraction, company knowledge, technical proposals, mémoire technique generation, compliance checks, landing copy, and tender-response workflows.
---

# BTP Tender Response Skill

## Purpose

This skill provides the domain knowledge and product rules required to build and improve a SaaS specialized in helping French BTP companies analyze public and private tender documents and produce compliant technical proposals.

The product is designed specifically for BTP companies responding to appels d'offres.

The core workflow is:

DCE → Analyse → Go/No-Go → Exigences → Base entreprise → Mémoire → Contrôle → Word/PDF

---

## Target users

The primary users are French BTP companies that regularly respond to appels d'offres.

Typical users include:

- dirigeants de PME du BTP
- responsables commerciaux
- chargés d'affaires
- responsables études de prix
- responsables appels d'offres
- conducteurs de travaux involved in tender preparation
- personnes responsible for preparing mémoires techniques

The product should always be designed around their real-world workflow and vocabulary.

---

## BTP tender vocabulary

Understand these terms:

### DCE

Dossier de Consultation des Entreprises.

A DCE can contain multiple documents such as:

- RC — Règlement de la Consultation
- CCTP — Cahier des Clauses Techniques Particulières
- CCAP — Cahier des Clauses Administratives Particulières
- AE — Acte d'Engagement
- BPU — Bordereau des Prix Unitaires
- DPGF — Décomposition du Prix Global et Forfaitaire
- plans
- annexes
- cadres de mémoire technique
- documents administratifs
- pièces complémentaires

### RC

Règlement de la Consultation.

Important information may include:

- deadline
- submission procedure
- required documents
- evaluation criteria
- weighting of criteria
- technical requirements
- formatting requirements
- questions/deadlines
- validity period
- mandatory elements

### CCTP

Technical specifications.

It contains technical requirements, execution requirements, materials, methods, performance requirements and constraints.

### CCAP

Administrative contractual requirements.

It may contain:

- contractual conditions
- deadlines
- penalties
- payment conditions
- insurance requirements
- guarantees
- subcontracting conditions
- administrative obligations

### Mémoire technique

The technical proposal submitted by the company to explain how it will execute the contract.

It should respond directly to the buyer's requirements and evaluation criteria.

---

## Product principles

The SaaS must not behave like a generic AI writing tool.

It should behave like a specialized BTP tender-response assistant.

Every generated answer should be grounded in:

1. the tender documents
2. the buyer's requirements
3. the company's information
4. the company's capabilities
5. the evaluation criteria

Avoid inventing company capabilities, certifications, equipment, staff, references, methods or commitments.

If information is missing, clearly identify it instead of fabricating it.

---

## DCE analysis

When analyzing a DCE, identify:

- important dates
- submission deadline
- required documents
- eligibility requirements
- technical requirements
- administrative requirements
- evaluation criteria
- evaluation weighting
- mandatory commitments
- requested certifications
- requested qualifications
- staffing requirements
- equipment requirements
- experience requirements
- references
- environmental requirements
- safety requirements
- quality requirements
- execution constraints
- penalties
- contractual constraints
- formatting requirements
- specific questions or expectations from the buyer

Every important requirement should ideally be traceable to its source document.

---

## Go / No-Go

The product should help the company decide whether an opportunity is worth pursuing.

The Go/No-Go analysis should consider:

- eligibility
- deadline feasibility
- technical capability
- required qualifications
- required certifications
- geographical constraints
- company capacity
- similar project experience
- financial/contractual risks
- unusual requirements
- competition indicators when available
- strategic fit

Never make the final business decision automatically.

Present the analysis and risks clearly so the company can make the decision.

---

## Requirement extraction

Requirements should be structured whenever possible.

Each requirement should contain:

- requirement
- category
- source document
- source section/page when available
- mandatory vs optional
- importance
- expected response
- company information needed
- status

Example:

Requirement:
"Présenter les moyens humains affectés au chantier."

Category:
Moyens humains

Source:
CCTP / article X

Mandatory:
Yes

Company information needed:
Team composition and qualifications

Status:
Missing information

---

## Company knowledge base

The company knowledge base can contain:

- company presentation
- areas of expertise
- services
- staff
- qualifications
- certifications
- equipment
- methodologies
- environmental practices
- safety procedures
- quality procedures
- project references
- past projects
- geographic coverage
- technical resources
- standard processes

Generated content must only use information actually available in the company's knowledge base or supplied by the user.

Do not invent facts.

---

## Mémoire technique generation

A mémoire technique should be structured around the buyer's requirements and evaluation criteria.

Avoid generic filler content.

A good structure can include:

1. Présentation de l'entreprise
2. Compréhension du projet
3. Méthodologie d'exécution
4. Organisation et moyens humains
5. Moyens matériels
6. Planning et organisation
7. Qualité
8. Sécurité
9. Environnement
10. Gestion des contraintes
11. Moyens de contrôle
12. Engagements
13. Références pertinentes

The actual structure must adapt to the specific DCE.

If the buyer provides a specific framework, follow it.

---

## Compliance / Control

Before finalizing a mémoire technique, check whether the response covers the identified requirements.

The control stage should detect:

- missing requirements
- partially answered requirements
- unsupported claims
- contradictions
- missing company information
- irrelevant content
- generic content
- incorrect terminology
- missing evaluation criteria
- inconsistencies between sections

The system should clearly distinguish:

- Covered
- Partially covered
- Missing
- Information required

---

## Source traceability

Whenever possible, generated content should be traceable to:

- the DCE
- the company knowledge base
- user-provided information

Do not present assumptions as facts.

---

## UX principles

The interface should feel like a professional French B2B SaaS.

Priorities:

- clarity
- trust
- traceability
- speed
- simplicity
- professional design
- minimal cognitive load

The user should always understand:

- what the AI found
- why it matters
- where the information came from
- what information is missing
- what the AI generated
- what still needs human validation

---

## Important rule

This is a BTP-specific product.

Do not design features as if this were a generic AI assistant, generic document generator, or generic ChatGPT wrapper.

All important product decisions should be evaluated against the workflow of a French BTP company responding to an appel d'offres.
