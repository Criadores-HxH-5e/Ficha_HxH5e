# Security Specification - Arena V2

## 1. Data Invariants
- A `V2Quote` cannot exist without a valid `V2Fighter` and `V2User`.
- `coins_balance` and `withdrawable_balance` can only be modified by the System (Admin).
- `quote_value` calculation is strictly System-owned.
- Total supply of `V2Quote` for a fighter must not exceed `quotes_available` (checked by System).
- `V2Transaction` records are immutable once created.

## 2. Global Safety Net
- Catch-all: `match /{document=**} { allow read, write: if false; }`

## 3. The "Dirty Dozen" Payloads (Denial Tests)
1. **Balance Spoofing**: User A attempts to update their own `coins_balance` to 999999.
2. **Identity Theft**: User A attempts to buy a quote setting `user_id` to User B.
3. **Fighter Value Poisoning**: User A attempts to update a fighter's `quote_value`.
4. **Infinite Withdrawal**: User A attempts to create a `WITHDRAW` transaction for more than their `withdrawable_balance`.
5. **Orphaned Quote**: User A attempts to create a quote for a non-existent fighter.
6. **Ghost Fight**: User A attempts to record a fight between themselves and a mock fighter to boost stats.
7. **Negative Balance**: Transaction results in a negative `coins_balance`.
8. **Field Injection**: Updating a fighter with an `isAdmin: true` field.
9. **Timestamp Manipulation**: Creating a transaction with a `timestamp` in the future.
10. **Role Escalation**: User A attempts to change their `user_type` to `ADMIN` (if exists).
11. **Quote Stealing**: User A attempts to update User B's quote `amount`.
12. **System Log Erasure**: User A attempts to delete their own `v2_transactions`.

## 4. Relationship Mapping
- **Transactions** are the source of truth for all balance changes.
- **Fighters** are the source of truth for quote valuation.
- **Quotes** represent the link between Users and Fighters.

## 5. Security Strategy
- All critical economic mutations (Buy/Sell/Fight) will be handled via API routes using `firebase-admin`.
- Firestore Rules will act as the "Fortress" layer, explicitly denying user-initiated writes to these critical paths while allowing reads.
- `UserProfile` and `V2User` basic metadata can be updated by the owner with strict key checks.
