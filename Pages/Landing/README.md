# Backstage landing

`Landing.jsx` serves `/`. Its styles are scoped to `.landing-page`; it has its own marketing navigation and footer, separate from public band pages.

- Every acquisition CTA targets `/register`. Registration and onboarding are intentionally deferred to the next task; this repository does not yet implement that route.
- Demo links target the existing pilot at `/lost-in-the-ocean`.
- Authenticated navigation uses `useAuth().activeSlug` for the band's dashboard.
- Q99/month, the first free month, and the buyer-paid 10% service fee (minimum Q5) are the agreed marketing offer. This page does not implement subscription billing, trial activation, or change checkout calculations. The optional no-card claim is omitted.
- Product tabs display local snapshots of the real application. They do not fetch public or private APIs. Asset provenance and the dashboard's demonstration state are documented in `public/landing/README.md`. Refresh snapshots after product UI changes.
- The community preview shows the existing public contact section. Subscriber onboarding/management is not added by this landing change.

The product tabs support left/right arrows, Home, and End. The mobile navigation closes with Escape and returns focus to its toggle. Reduced motion is respected by the stylesheet.
