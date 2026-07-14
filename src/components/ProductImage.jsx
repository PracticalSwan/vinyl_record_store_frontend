import { useState } from 'react';
import { IconVinyl, IconVinylDark } from './Icons';
import { API_BASE_URL } from '../lib/api';

const COVER_ART_HOSTS = new Set(['coverartarchive.org', 'www.coverartarchive.org']);
const MUSICBRAINZ_HOSTS = new Set(['musicbrainz.org', 'www.musicbrainz.org']);

function approvedUrl(value, hosts) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && hosts.has(url.hostname.toLowerCase()) ? url.toString() : null;
  } catch {
    return null;
  }
}

// Route cover art through the backend proxy instead of loading it directly
// from coverartarchive.org, so storefronts on networks that cannot reach that
// host still render artwork. The backend re-validates the host (SSRF boundary).
function proxiedArtworkSrc(coverArtUrl) {
  return `${API_BASE_URL}/api/artwork?u=${encodeURIComponent(coverArtUrl)}`;
}

function Placeholder({ decorative, variant, alt }) {
  const Icon = variant === 'list' ? IconVinylDark : IconVinyl;
  const size = variant === 'detail' ? 120 : variant === 'list' ? 32 : 64;
  return (
    <div
      className={`product-image-placeholder product-image-placeholder-${variant}`}
      data-testid="product-image-placeholder"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <Icon size={size} opacity={variant === 'list' ? undefined : 0.3} />
    </div>
  );
}

function Artwork({ record, variant, decorative, priority, showAttribution, url, sourceUrl }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const alt = `Cover art for ${record?.title || 'record'} by ${record?.artist || 'unknown artist'}.`;

  const usePlaceholder = !url || failed;
  return (
    <figure className={`product-image product-image-${variant}${loaded ? ' is-loaded' : ''}`}>
      {usePlaceholder ? (
        <Placeholder decorative={decorative} variant={variant} alt={alt} />
      ) : (
        <>
          <Placeholder decorative variant={variant} alt="" />
          <img
            className="product-image-artwork"
            src={proxiedArtworkSrc(url)}
            alt={decorative ? '' : alt}
            width={variant === 'detail' ? 1200 : 500}
            height={variant === 'detail' ? 1200 : 500}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      )}
      {showAttribution && !usePlaceholder && sourceUrl && (
        <figcaption className="product-image-attribution">
          <a href={sourceUrl} target="_blank" rel="noreferrer">Artwork source</a>
        </figcaption>
      )}
    </figure>
  );
}

export default function ProductImage({
  record,
  variant = 'card',
  decorative = false,
  priority = false,
  showAttribution = false,
}) {
  const image = record?.image;
  const candidate = variant === 'detail' ? image?.detailUrl : image?.thumbnailUrl;
  const url = approvedUrl(candidate, COVER_ART_HOSTS);
  const sourceUrl = approvedUrl(image?.sourceUrl, MUSICBRAINZ_HOSTS);
  return (
    <Artwork
      key={`${variant}:${url || 'placeholder'}`}
      record={record}
      variant={variant}
      decorative={decorative}
      priority={priority}
      showAttribution={showAttribution}
      url={url}
      sourceUrl={sourceUrl}
    />
  );
}
