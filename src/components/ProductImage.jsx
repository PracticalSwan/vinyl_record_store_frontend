import { useState } from 'react';
import { IconVinyl, IconVinylDark } from './Icons';
import { API_BASE_URL } from '../lib/api';

const COVER_ART_HOSTS = new Set(['coverartarchive.org', 'www.coverartarchive.org']);
const MUSICBRAINZ_HOSTS = new Set(['musicbrainz.org', 'www.musicbrainz.org']);
const PUBLIC_ID_PATTERN = /^[1-9][0-9]{0,9}$/;

function approvedUrl(value, hosts) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && hosts.has(url.hostname.toLowerCase()) ? url.toString() : null;
  } catch {
    return null;
  }
}

// Prefer the backend proxy, then its canonical-ID local bundle, before the
// generic placeholder. The browser never loads Cover Art Archive directly;
// the backend validates the remote URL and every redirect hop.
function proxiedArtworkSrc(coverArtUrl) {
  return `${API_BASE_URL}/api/artwork?u=${encodeURIComponent(coverArtUrl)}`;
}

function localArtworkSrc(publicId) {
  const value = String(publicId ?? '');
  return PUBLIC_ID_PATTERN.test(value) ? `${API_BASE_URL}/api/artwork/local/${value}` : null;
}

function sourceChain(remoteUrl, localUrl) {
  const sources = [];
  if (remoteUrl) sources.push({ kind: 'proxy', src: proxiedArtworkSrc(remoteUrl) });
  if (localUrl && !sources.some((source) => source.src === localUrl)) {
    sources.push({ kind: 'local', src: localUrl });
  }
  return sources;
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

function Artwork({ record, variant, decorative, priority, showAttribution, sources, sourceUrl }) {
  const [imageState, setImageState] = useState({ sourceIndex: 0, loadedSource: null });
  const alt = `Cover art for ${record?.title || 'record'} by ${record?.artist || 'unknown artist'}.`;
  const currentSource = sources[imageState.sourceIndex] || null;
  const loaded = imageState.loadedSource === currentSource?.src;

  const usePlaceholder = !currentSource;
  return (
    <figure className={`product-image product-image-${variant}${loaded ? ' is-loaded' : ''}`}>
      {usePlaceholder ? (
        <Placeholder decorative={decorative} variant={variant} alt={alt} />
      ) : (
        <>
          <Placeholder decorative variant={variant} alt="" />
          <img
            key={currentSource.src}
            className="product-image-artwork"
            src={currentSource.src}
            alt={decorative ? '' : alt}
            width={variant === 'detail' ? 1200 : 500}
            height={variant === 'detail' ? 1200 : 500}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            data-artwork-source={currentSource.kind}
            onLoad={() => setImageState((current) => (
              current.sourceIndex === imageState.sourceIndex
                ? { ...current, loadedSource: currentSource.src }
                : current
            ))}
            onError={() => {
              setImageState((current) => (
                current.sourceIndex === imageState.sourceIndex
                  ? { sourceIndex: current.sourceIndex + 1, loadedSource: null }
                  : current
              ));
            }}
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
  const localUrl = localArtworkSrc(record?.id);
  const sources = sourceChain(url, localUrl);
  const chainKey = [record?.id || 'unknown', variant, ...sources.map((source) => source.src)].join(':');
  return (
    <Artwork
      key={chainKey}
      record={record}
      variant={variant}
      decorative={decorative}
      priority={priority}
      showAttribution={showAttribution}
      sources={sources}
      sourceUrl={sourceUrl}
    />
  );
}
