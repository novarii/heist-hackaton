# API Design Explanation

This note outlines each backend route from the schema plan and how it supports the prototype. The language is kept simple so the team can quickly align on what ships now.

## POST /api/public/prompts
- **What it does:** Receives the very first prompt from the landing page, saves it as an anonymous lead, and forwards the text to the existing n8n hiring agent.
- **Why we need it:** Without this endpoint we cannot capture interest before a user signs in, which breaks the top of the funnel and leaves n8n without the data it needs to suggest agents.

## POST /api/auth/link-prompt
- **What it does:** After OAuth, this endpoint looks up the saved prompt and connects it to the new Supabase profile.
- **Why we need it:** It keeps the initial prompt tied to the person who just authenticated, so follow-up comparisons and waitlist actions use the right context.

## POST /api/onboarding/profile
- **What it does:** Stores the role, company info, and onboarding status for the logged-in user.
- **Why we need it:** The comparison view depends on these fields to personalise agent suggestions; without it the prototype would show generic results.

## GET /api/agents
- **What it does:** Returns the list of public agents, applies filters, and can attach a fit score if there is past prompt context.
- **Why we need it:** The comparison screen cannot render its grid without this data source, so it is essential for the core demo.

## POST /api/agents/compare
- **What it does:** Creates a comparison session, calculates fit scores, and records the ranked agents along with reasons.
- **Why we need it:** This is the engine behind the side-by-side comparison experience; the prototype loses its differentiator if we skip it.

## GET /api/agents/[slug]
- **What it does:** Supplies full details for a single agent, including endorsements and metrics, based on the slug used in routing.
- **Why we need it:** The agent profile page relies on this endpoint to show trustworthy information before someone joins the waitlist.

## POST /api/hire/waitlist
- **What it does:** Records that a user (or anonymous lead) wants to hire an agent, storing contact info and the related session.
- **Why we need it:** Capturing intent is a key outcome for the prototype; without this route we would have no actionable signal from interested teams.

## POST /api/integrations/n8n-callback
- **What it does:** Would let n8n push back extra data (like recommended agents) after the initial prompt.
- **Why it is optional now:** The prototype flow is synchronous and already complete without callbacks, so we can defer this endpoint unless n8n starts sending follow-ups.
