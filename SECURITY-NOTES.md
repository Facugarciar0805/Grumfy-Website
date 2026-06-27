# Grumfy Member Access Notes

The current login gate is a static-site prototype. It blocks the page visually, only accepts usernames for the locked domain in `auth-config.js`, and remembers a valid institutional email in the visitor's browser.

This does not prove email ownership. Anyone technical can bypass browser-only code.

For real institution-only access, replace the static gate with one of these:

- Google or Microsoft sign-in restricted to the institution domain.
- A backend magic-link flow that sends a login link to the institutional email.
- A serverless function that sends and verifies a one-time code sent to the institutional email.

Keep the locked-domain input design, but let the backend verify that the person actually controls the email address before showing the cookie page.

To change the institution domain in the current prototype, edit `institutionDomain` in `auth-config.js`.

`auth-provider-template.js` shows the browser-side shape for a future email-code flow. It expects two backend endpoints:

- `POST /api/auth/request-code`
- `POST /api/auth/verify-code`
