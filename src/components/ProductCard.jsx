import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useTracking } from '../context/useTracking';
import { useAuth } from '../context/useAuth';
import { IconHeart } from './Icons';
import ProductImage from './ProductImage';
import FeedbackControls from './FeedbackControls';
import { deleteFeedback, putFeedback } from '../lib/feedback';
import {
  personalizationNegativeFeedbackEnabled,
  personalizationMeEndpointEnabled,
  personalizationProfileDomainEnabled,
} from '../lib/features';
import {
  availabilityLabel,
  displayArtist,
  displayValue,
  displayYear,
  formatMoney,
  isResearchProduct,
} from '../lib/productDisplay';

function StockBadge({ stock }) {
  if (stock === 'in')  return <span className="badge badge-in">In stock</span>;
  if (stock === 'low') return <span className="badge badge-low">Low stock</span>;
  if (stock === 'out') return <span className="badge badge-out">Out of stock</span>;
  return <span className="badge">Availability unknown</span>;
}

function StockDot({ stock }) {
  const cls = stock === 'in' ? 'dot-in' : stock === 'low' ? 'dot-low' : stock === 'out' ? 'dot-out' : '';
  const label = availabilityLabel(stock);
  return <span className={`card-stock-dot ${cls}`} title={label} aria-hidden="true" />;
}

function visibleRecommendationReasons(record) {
  const candidates = [
    ...(Array.isArray(record.recommendationReasons) ? record.recommendationReasons : []),
    record.reason,
  ];
  const reasons = [];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const reason = candidate.trim();
    if (!reason || reasons.includes(reason)) continue;
    reasons.push(reason);
    if (reasons.length === 2) break;
  }
  return reasons;
}

export default function ProductCard({ record, showReason = false, surface = 'catalog', queryLength = 0, searchRank = null }) {
  const navigate = useNavigate();
  const tracking = useTracking();
  const auth = useAuth();
  const cardRef = useRef(null);
  const store = useStore();
  const { wishlist, toggleWishlist } = store;
  const saved = wishlist.includes(record.id);
  const recommendationContext = record.recommendationContext;
  const recommendationReasons = visibleRecommendationReasons(record);
  const researchOnly = isResearchProduct(record);
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [confirmedFeedbackKind, setConfirmedFeedbackKind] = useState(null);
  const [feedbackPending, setFeedbackPending] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const feedbackUndoRef = useRef(null);
  const feedbackPrimaryRef = useRef(null);
  const feedbackSecondaryRef = useRef(null);
  const feedbackFocusIntentRef = useRef(null);
  const lastFeedbackKindRef = useRef('not-interested');
  const feedbackEnabled = Boolean(
    recommendationContext
    && ['home', 'recommendations'].includes(surface)
    && auth.status === 'authenticated'
    && auth.user?.role === 'customer'
    && personalizationMeEndpointEnabled()
    && !['demo-profile', 'content-similarity'].includes(recommendationContext.mode)
    && personalizationProfileDomainEnabled()
    && personalizationNegativeFeedbackEnabled(),
  );

  useEffect(() => {
    if (!recommendationContext?.requestId || !cardRef.current) return undefined;
    const emit = () => tracking.track('recommendation_impression', {
      productId: record.id,
      surface,
      recommendationContext,
      dedupeKey: `impression:${globalThis.location?.pathname || ''}:${surface}:${recommendationContext.requestId}:${record.id}`,
      dedupeWindowMs: Number.POSITIVE_INFINITY,
    });
    if (!globalThis.IntersectionObserver) {
      emit();
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
        emit();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [record.id, recommendationContext, surface, tracking]);

  const viewRecord = () => {
    if (recommendationContext) {
      tracking.track('recommendation_click', { productId: record.id, surface, recommendationContext });
    } else if (surface === 'search') {
      tracking.track('search_result_click', {
        productId: record.id,
        surface,
        value: Math.min(99, queryLength),
        searchContext: { rank: searchRank, queryLength: Math.min(100, queryLength) },
      });
    }
    navigate(`/records/${record.id}`, {
      state: recommendationContext ? { recommendationContext, surface } : undefined,
    });
  };

  const toggleSaved = async (event) => {
    event.stopPropagation();
    await toggleWishlist(record.id, recommendationContext ? { recommendationContext, surface } : { surface });
  };

  useEffect(() => {
    if (feedbackPending || !feedbackFocusIntentRef.current) return;
    const target = feedbackFocusIntentRef.current;
    feedbackFocusIntentRef.current = null;
    if (target === 'undo') {
      feedbackUndoRef.current?.focus();
    } else if (target === 'already-own') {
      feedbackSecondaryRef.current?.focus();
    } else {
      feedbackPrimaryRef.current?.focus();
    }
  }, [feedbackError, feedbackPending, feedbackStatus]);

  const createFeedback = async (kind) => {
    lastFeedbackKindRef.current = kind;
    setFeedbackPending(true);
    setFeedbackError(null);
    try {
      await putFeedback(record.id, { kind });
      feedbackFocusIntentRef.current = 'undo';
      setConfirmedFeedbackKind(kind);
      setFeedbackStatus('confirmed');
    } catch (error) {
      feedbackFocusIntentRef.current = kind;
      setFeedbackError(error.message || 'Feedback could not be saved. Try again.');
    } finally {
      setFeedbackPending(false);
    }
  };

  const undoFeedback = async () => {
    setFeedbackPending(true);
    setFeedbackError(null);
    try {
      await deleteFeedback(record.id);
      feedbackFocusIntentRef.current = lastFeedbackKindRef.current;
      setConfirmedFeedbackKind(null);
      setFeedbackStatus('idle');
    } catch (error) {
      feedbackFocusIntentRef.current = 'undo';
      setFeedbackError(error.message || 'Feedback could not be undone. Try again.');
    } finally {
      setFeedbackPending(false);
    }
  };

  return (
    <article
      ref={cardRef}
      className="product-card"
      role="listitem"
      aria-label={`${record.title} by ${displayArtist(record)}`}
    >
      {!(feedbackStatus === 'confirmed' && feedbackEnabled) && <div className="card-cover">
        <ProductImage record={record} decorative />
        {!researchOnly && <StockDot stock={record.stock} />}
        <button
          className={`card-wishlist-btn${saved ? ' active' : ''}`}
          aria-label={`${saved ? 'Remove' : 'Add'} ${record.title} ${saved ? 'from' : 'to'} wishlist`}
          disabled={store.isPending('wishlist', record.id)}
          onClick={toggleSaved}
        >
          <IconHeart filled={saved} />
        </button>
      </div>}

      <div className="card-body">
        {feedbackStatus === 'confirmed' && feedbackEnabled ? (
          <FeedbackControls
            status="confirmed"
            pending={feedbackPending}
            onUndo={undoFeedback}
            error={feedbackError}
            undoRef={feedbackUndoRef}
            confirmedKind={confirmedFeedbackKind}
          />
        ) : <>
        <h3 className="card-title">{record.title}</h3>
        <p className="card-artist">{displayArtist(record)}</p>
        <div className="card-meta" aria-label="Record details">
          <span className="badge badge-genre">{record.genre || 'Uncategorized'}</span>
          <span className="badge badge-era">{displayYear(record)}</span>
          {researchOnly ? <span className="badge">Research record</span> : <StockBadge stock={record.stock} />}
        </div>
        <div className="card-footer">
          {!researchOnly && <div>
            <span className="card-price">{formatMoney(record.price, record.currency)}</span>
            <p className="card-condition">{displayValue(record.condition, 'Condition unknown')}</p>
          </div>}
          <button
            className="btn btn-primary btn-sm"
            onClick={viewRecord}
          >
            View record
          </button>
        </div>
        {feedbackEnabled && <FeedbackControls
          status="idle"
          pending={feedbackPending}
          onCreate={createFeedback}
          error={feedbackError}
          ref={feedbackPrimaryRef}
          secondaryRef={feedbackSecondaryRef}
        />}
        </>}
      </div>

      {feedbackStatus !== 'confirmed' && showReason && recommendationReasons.map((reason) => (
        <p className="card-reason" role="note" key={reason}>{reason}</p>
      ))}
    </article>
  );
}
