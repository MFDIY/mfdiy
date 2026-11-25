# 0017: Billing with Stripe

- **Status:** Accepted
- **Date:** 2026-11-25

## Decision

All paid offerings (the Creator subscription in 0014, business offerings in 0015, the co-pilot in 0016) are billed through **Stripe**: Stripe Checkout for purchases and Stripe Billing for subscriptions, with the Stripe customer portal for managing them.

## Why

Chosen by the maintainer: a mature, widely documented platform that covers subscriptions, one-off payments and self-service management.

## Consequences

- Entitlements are checked server-side by the MFDIY service (0016). Clients never decide on their own whether a user has paid.
- Paid features need accounts that link a user to their Stripe customer.

## Open questions

- **Merchant of record.** By default the seller (the maintainer, in Australia) is the merchant of record and is responsible for sales tax, VAT and GST in every country customers buy from, as well as fraud and disputes. Stripe's **Managed Payments** makes Stripe the merchant of record for digital products and handles tax compliance in more than 80 countries, plus fraud and disputes. It became generally available in April 2026 (it grew out of Lemon Squeezy, which Stripe acquired in 2024). Lean: use Managed Payments, since global tax compliance is a lot of work for a solo maintainer. Compare its fees with standard Stripe plus Stripe Tax before deciding.
