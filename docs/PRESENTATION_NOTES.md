# Presentation Notes

Use this file to prepare future report and presentation writing.

## Short Project Pitch

The Vinyl Record Store Recommender System is a web application that helps users find vinyl records they may want to buy. It uses product metadata and user behavior to rank records and explain each recommendation.

## Problem-Solution Explanation

Problem: a record store catalog can be hard to browse because users may not know every artist, genre, label, or release era.

Solution: the system recommends records that match the user's interests and explains the reason, such as same artist, shared genre, similar release era, or wishlist behavior.

## Why Recommender Systems Fit This Project

A recommender system fits because users make choices from many records. Ranking and explanation can reduce search effort and support better decisions.

## Why MongoDB Atlas Fits The Project

MongoDB Atlas fits the planned data because vinyl records can have flexible metadata. Different records may have different tags, moods, labels, formats, conditions, and release details. User interactions can also be stored as event-like documents.

## MVP Features

- Product catalog.
- Product detail page.
- Search and filters.
- User interaction logging.
- Content-based recommendations.
- Recommendation explanations.
- Basic evaluation scenarios.

## Future Features

- Collaborative filtering after enough interaction data exists.
- Hybrid recommendation.
- Admin catalog tools.
- User onboarding for favorite artists or genres.
- Recommendation logs dashboard for academic evaluation.
- Deployment.

## Risks And Limitations

- New users and new records create cold-start problems.
- Sparse interaction data limits collaborative filtering.
- Bad metadata can produce weak recommendations.
- Copying external website design or product data is not allowed.
- Privacy must be considered for user behavior logs.
- Scope can grow too large if payment, authentication, scraping, and admin tools are added too early.

## Update Notes

Update this file when project scope, implemented features, architecture, recommender logic, evaluation results, or risks change.

