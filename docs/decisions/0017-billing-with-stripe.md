# 0017: Billing with Stripe

- **Status:** Accepted
- **Date:** 2026-11-25

## Decision

All paid offerings (the Creator subscription in 0014, business offerings in 0015, the co-pilot in 0016) are billed through **Stripe**: Stripe Checkout for purchases and Stripe Billing for subscriptions, with the Stripe customer portal for managing them.

### Stripe Managed Payments as merchant of record

MFDIY sells through **Stripe Managed Payments**, so **Stripe is the merchant of record**. Stripe handles indirect tax (sales tax, VAT, GST: calculation, collection, filing and remittance) in the jurisdictions it supports, as well as fraud prevention, disputes and transaction-level customer support.

## Why

- Stripe is a mature, widely documented platform that covers subscriptions, one-off payments and self-service management.
- The maintainer (based in Australia) wants zero hassle with global tax compliance and payment disputes, and is happy to pay for it. Stripe's fees are a percentage of each sale, so they are absorbed into the subscription prices.

## Consequences

- Purchases go through Stripe Checkout sessions or payment links with Managed Payments enabled.
- Prices are set with Managed Payments fees in mind.
- Entitlements are checked server-side by the MFDIY service (0016). Clients never decide on their own whether a user has paid.
- Paid features need accounts that link a user to their Stripe customer.
- Sales outside the jurisdictions Managed Payments covers, and a few documented exceptions, remain the maintainer's tax responsibility; check Stripe's coverage list before launch.
- Product support, pricing and refund policy remain MFDIY's responsibility.
