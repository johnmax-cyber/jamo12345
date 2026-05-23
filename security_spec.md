# Security Specification - Susan's Company Portal

This document specifications the Firestore security constraints, invariants, potential threat payloads, and test runner layout for Susan's Company.

## 1. Data Invariants and Security Constraints
- **Products**: Anyone can read (`list`, `get`). Only authenticated admins can write (`create`, `update`, `delete`).
- **ContactMessages**: Anyone can create. Only authenticated admins can read (`list`, `get`) or alter (`update`, `delete`).
- **Orders**: Anyone can create. Only authenticated admins can read/list or update statuses (`pending`, `completed`, `cancelled`).

## 2. The "Dirty Dozen" Payloads (Threat Vectors)
Here are twelve payloads designed to violate system boundaries and check security policy resilience.

1. **Unauthenticated Catalog Sabotage**: Anonymous user tries to inject a cheap custom product.
2. **Catalog Override**: Non-admin user tries to update or delete a premium kaftan listed in the inventory.
3. **Price Poisoning**: A user creates a product with a negative or massive price tag (`price: -5000` or `price: 1e9`).
4. **Identity Spoofing in Messages**: A sender submits a contact message on behalf of another user's phone or email identity.
5. **Private Inbox Theft**: Unauthorized user requests a checklist listing of all incoming direct client contacts.
6. **Inquiry Deletion**: Client attempts to wipe or delete an inquiry ticket submitted so admins cannot view it.
7. **Order Hijack**: Unauthenticated malicious actor requests details of of random `orders/{orderID}`.
8. **Billing Manipulation**: A customer attempts to place an order where the listed checkout totals do not match the sum total of cart structures.
9. **Status Short-circuiting**: A customer tries to mark an order as `completed` directly at checkout.
10. **State Corruption after Termination**: An admin tries to revert a `completed` or `cancelled` order back to `pending`.
11. **ID Injection Poisoning**: Injection of malicious, long ID strings containing non-alphanumeric junk symbols into document resource IDs.
12. **Field Overflow**: Payload featuring oversized values (e.g. 5MB strings for contact messages or description fields).

## 3. Recommended Rules Structure
The rule definitions will block all of the above items safely. Since we do not run a local Emulators framework in this quick preview setup, we configure and deploy the fortress rules directly.
