/*
This file is a template for the real email-ownership verification step.

The current site uses auth.js as a static prototype gate. For real access control,
replace that flow with a backend or auth provider that sends a code or magic link
to the institutional email address and only unlocks the page after verification.
*/

async function requestInstitutionCode(email) {
    const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        throw new Error("Could not send verification code.");
    }
}

async function verifyInstitutionCode(email, code) {
    const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, code })
    });

    if (!response.ok) {
        return false;
    }

    const result = await response.json();
    return result.verified === true;
}
