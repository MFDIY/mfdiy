# 0018: Stripe Managed Payments as merchant of record

- **Status:** Accepted
- **Date:** 2026-11-25

## Decision

Settles the open question in 0017: MFDIY sells through **Stripe Managed Payments**, so **Stripe is the merchant of record**. Stripe handles indirect tax (sales tax, VAT, GST: calculation, collection, filing and remittance) in the jurisdictions it supports, as well as fraud prevention, disputes and transaction-level customer support.

## Why

The maintainer wants zero hassle with global tax compliance and payment disputes, and is happy to pay for it. Stripe's fees are a percentage of each sale, so they are absorbed into the subscription prices.

## Consequences

- Purchases go through Stripe Checkout sessions or payment links with Managed Payments enabled.
- Prices are set with Managed Payments fees in mind.
- Sales outside the jurisdictions Managed Payments covers, and a few documented exceptions, remain the maintainer's tax responsibility; check Stripe's coverage list before launch.
- Product support, pricing and refund policy remain MFDIY's responsibility.
