# Phase 2F: Policies / FAQ API Report

## A. Existing schema
The existing \prisma/schema.prisma\ provides two primary data structures capable of hosting this data without requiring new schema migrations:
1. \PropertyPolicy\: A dedicated relational model strictly containing \checkInTime\, \checkOutTime\, \petsAllowed\, \cancellationPolicy\, and \houseRules\.
2. \PropertySection\: A modular JSON schema that explicitly supports a \aq\ component type.

## B. Existing Policies/FAQ architecture
Previously, the policies and FAQ rendered on the property page relied heavily on fallback/mock structures provided by \properties-data/index.ts\ via the \contextResolver.ts\, causing inconsistencies when viewing published content.

## C. Existing CMS UI behavior
The CMS UI provides separate interfaces in the CMS component:
- \policies\: Exposes \checkIn\, \checkOut\, \petPolicy\, and \cancellation\ mapped as standard text strings.
- \aqs\: Exposes an array of \{ question, answer }\ pairs.
The data gets routed to \/api/property/cms\ via \POST\.

## D. Canonical storage selected
- **Policies**: Selected \PropertyPolicy\ model, using \houseRules\ to persist the generic \petPolicy\ string.
- **FAQ**: Selected the existing \PropertySection\ with \	ype=" faq\\,
