# Security Specification: Vocational Rehabilitation Case Management System

## 1. Data Invariants

1. **Authentication Requirement**: All write operations require an authenticated staff user (`request.auth != null`). Unauthenticated writes are unconditionally denied.
2. **Admin & Staff Access**: `sun@suwonrehab.or.kr` is the bootstrapped facility supervisor/admin. Users in the `/admins` collection have administrative authorization.
3. **Document ID Hygiene**: Path document IDs must conform to `isValidId()` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **Relational Consistency**: Child assessment records (Purdue, ERS, Academic, IPE, Situation, Semester) must have a valid `clientId` referencing an existing or valid client ID.
5. **No Blind Blanket Reads**: Read operations require authentication; document data must belong to registered trainees in the vocational facility.
6. **Immutable Key Safeguards**: Document IDs and creation timestamps cannot be mutated after initial write.
7. **Strict Field Typing & Size Limits**: All text inputs have strict upper bounds to prevent denial-of-wallet / payload-bloat attacks.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)

1. **Unauthenticated Client Creation**: Anonymous actor attempts to insert a trainee without auth token. Expected: `PERMISSION_DENIED`.
2. **Junk Character Path Injection**: Attacker injects a 2KB string with illegal characters as `clientId`. Expected: `PERMISSION_DENIED`.
3. **Shadow Field Injection**: Attempt to create client with arbitrary injected properties `{"isSuperAdmin": true, "hack": 1}`. Expected: `PERMISSION_DENIED`.
4. **Missing Required Fields**: Client record without mandatory `name` field. Expected: `PERMISSION_DENIED`.
5. **Payload Bloat Attack**: Client with a 100KB `name` string exceeding max limit. Expected: `PERMISSION_DENIED`.
6. **Immutable ID Tampering**: Client update attempting to change `id` to a different client. Expected: `PERMISSION_DENIED`.
7. **Purdue Score Poisoning**: Attempt to insert negative numbers or non-number strings in `rightHand`. Expected: `PERMISSION_DENIED`.
8. **Orphaned Purdue Record**: Purdue test created without a `clientId`. Expected: `PERMISSION_DENIED`.
9. **Admin Elevation Attempt**: Non-admin user writing their own record into `/admins/{uid}`. Expected: `PERMISSION_DENIED`.
10. **Unauthenticated List Query**: Anonymous client attempting to dump all `/clients` documents. Expected: `PERMISSION_DENIED`.
11. **Type Mismatch on Status**: Updating client status with an object instead of string. Expected: `PERMISSION_DENIED`.
12. **Malformed Semester Evaluation**: Adding semester evaluation with non-matching `clientId`. Expected: `PERMISSION_DENIED`.

## 3. Test Runner Specification (`firestore.rules.test.ts`)
The test suite validates that all 12 payloads fail closed with `PERMISSION_DENIED`.
