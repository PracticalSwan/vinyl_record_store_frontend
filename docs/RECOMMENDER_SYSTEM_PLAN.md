# Frontend Recommendation Presentation

The backend owns candidate generation, scoring, diversity, exclusions, and explanations. The frontend owns presentation and request state.

## Implemented Surfaces

- Home recommendation row from `/api/recommendations/user/demo-user`.
- Recommendation demo page with profile summary, mode label, ranking order, and reasons.
- Product detail similarity row from `/api/recommendations/product/:id`.

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
- Never infer or display private interaction history that the backend did not return.

## Evaluation Boundary

UI review can measure comprehension and accessibility. Ranking-quality metrics belong to the backend evaluation protocol and require held-out interactions, baselines, and a leakage-safe split.
