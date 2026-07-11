# Frontend Recommendation Presentation

The backend owns candidate generation, scoring, diversity, exclusions, and explanations. The frontend owns presentation and request state.

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

## Display Rules

- Render at least one backend reason when present.
- Keep reasons tied to actual artist, genre, era, label, or availability matches.
- Do not expose score as a quality guarantee.
- Preserve loading, empty, error, and success states.
- Request user recommendations only on Home and Recommendations so logged lists correspond to rendered output.
- Wait for auth restoration, omit anonymous IDs for signed-in requests, key the resource by public subject, and abort/generation-guard identity transitions.
- Deduplicate impressions by request/list/product/surface for the full page view.
- Never infer or display private interaction history that the backend did not return.

## Evaluation Boundary

UI review can measure comprehension and accessibility. Ranking-quality metrics belong to the backend evaluation protocol and require held-out interactions, baselines, and a leakage-safe split.

## Personalization Roadmap

PERS-00 through PERS-02 / FFP-09 are complete: decisions are frozen, the client has no arbitrary-user selection surface, and authenticated/anonymous storefront requests use the session-owned endpoint safely. PERS-03 onward remains planned for profile summaries, preference ranking, feedback, behavior, popularity, and hybrid modes. Ranking remains `content-demo-v1`, and no quality claim is made.
