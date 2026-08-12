# Frontend Recommendation Presentation

The backend owns active-version candidate generation, scoring, diversity, exclusions, and explanations. The frontend owns presentation and request state. DATA-00 through DATA-15 expanded catalog compatibility but did not implement a recommender algorithm.

## Implemented Surfaces

- Home recommendation row from the optional-session `/api/recommendations/me` endpoint.
- Recommendation demo page with profile summary, mode label, ranking order, and reasons.
- Product detail similarity row from `/api/recommendations/product/:id`.
- Request/list metadata flattened into cards for impression, click, and downstream attribution.

## Modes

| Mode | Meaning | Required UI Language |
| --- | --- | --- |
| `demo-profile` | Results use the documented synthetic profile. | State that it is a sample profile, not a signed-in customer. |
| `content-similarity` | Results match one source product's metadata. | Describe them as similar records. |
| `cold-start` | No stored history is available. | Describe results as generic in-stock suggestions. |
| `anonymous-fallback` | No verified customer session resolved. | State that results are catalog-based fallback suggestions without account history. |
| `preference-profile` | Effective first-batch preference flag is enabled and saved preference signals are available. | State that results use the preferences saved for this account. |
| `behavior-profile` | Effective behavioral flag is enabled and bounded account/passive evidence is available. | State that results use activity and account signals available for this profile; do not imply passive tracking is required. |
| `popularity` | Effective popularity flag is enabled and active-dataset aggregate evidence is available. | State that results use aggregate research ratings, not recent or personalized activity. |
| `personalized-hybrid` | Preference and behavior are both available and the hybrid flag is enabled; popularity may join. | State that results combine the preferences and account activity available for this profile. |

## Display Rules

- Render at least one backend reason when present.
- Keep reasons tied to actual artist, genre, era, label, or availability matches.
- Do not expose score as a quality guarantee.
- Preserve loading, empty, error, and success states.
- Request user recommendations only on Home and Recommendations so logged lists correspond to rendered output.
- Wait for auth restoration, omit anonymous IDs for signed-in requests, key the resource by public subject, and abort/generation-guard identity transitions.
- Deduplicate impressions by request/list/product/surface for the full page view.
- Never infer or display private interaction history that the backend did not return.
- Handle nullable dataset metadata without inventing reasons; show only backend-provided explanations and safe catalog fallbacks.

## Evaluation Boundary

UI review can measure comprehension and accessibility. Ranking-quality metrics belong to the backend evaluation protocol and require held-out interactions, baselines, and a leakage-safe split.

## Personalization Roadmap

PERS-00 through PERS-09 / FFP-14 are complete. PERS-04 through PERS-08 remain behind default-off flags: the client has no arbitrary-user selection surface, authenticated/anonymous storefront requests use the session-owned endpoint safely, identity and surface changes cannot reveal stale results, all returned modes are labelled honestly, server-owned reasons render with up to two unique entries, and recommendation cards expose exact feedback controls only when enabled. Lower modes preserve their pure backend score/version, and no quality claim is made.
