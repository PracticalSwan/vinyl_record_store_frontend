# Frontend Recommendation Presentation

The backend owns candidate generation, scoring, diversity, exclusions, and explanations. The frontend owns presentation and request state.

## Implemented Surfaces

- Home recommendation row from `/api/recommendations/user/demo-user`.
- Recommendation demo page with profile summary, mode label, ranking order, and reasons.
- Product detail similarity row from `/api/recommendations/product/:id`.
- Request/list metadata flattened into cards for impression, click, and downstream attribution.

## Modes

| Mode | Meaning | Required UI Language |
| --- | --- | --- |
| `demo-profile` | Results use the documented synthetic profile. | State that it is a sample profile, not a signed-in customer. |
| `content-similarity` | Results match one source product's metadata. | Describe them as similar records. |
| `cold-start` | No stored history is available. | Describe results as generic in-stock suggestions. |

## Display Rules

- Render at least one backend reason when present.
- Keep reasons tied to actual artist, genre, era, label, or availability matches.
- Do not expose score as a quality guarantee.
- Preserve loading, empty, error, and success states.
- Request user recommendations only on Home and Recommendations so logged lists correspond to rendered output.
- Deduplicate impressions by request/list/product/surface for the full page view.
- Never infer or display private interaction history that the backend did not return.

## Evaluation Boundary

UI review can measure comprehension and accessibility. Ranking-quality metrics belong to the backend evaluation protocol and require held-out interactions, baselines, and a leakage-safe split.

## Personalization Roadmap (Planned)

`PERSONALIZATION_IMPLEMENTATION_PLAN.md` plans, without implementing, the frontend half of a genuine personalization system scheduled after BFP-07, FFP-07, and FFP-08. It switches the storefront to a session-owned endpoint, renders new modes truthfully (`preference-profile`, `behavior-profile`, `popularity`, `personalized-hybrid`, `anonymous-fallback`), refreshes on preference save, adds first-class negative-feedback controls, and keeps attribution intact. The honesty wording above stays in force until personalization is actually implemented; no quality claim is made.
