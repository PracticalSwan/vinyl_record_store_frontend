import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProductImage from '../../src/components/ProductImage';

const record = {
  id: 1,
  title: 'Kind of Blue',
  artist: 'Miles Davis',
  image: {
    thumbnailUrl: 'https://coverartarchive.org/release/example/cover-500.jpg',
    detailUrl: 'https://coverartarchive.org/release/example/cover-1200.jpg',
    source: 'cover-art-archive',
    sourceUrl: 'https://musicbrainz.org/release/example',
  },
};

describe('ProductImage', () => {
  it('renders approved art with stable dimensions, detail priority, and source attribution', () => {
    const { container } = render(<ProductImage record={record} variant="detail" priority showAttribution />);
    const image = screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' });
    // Cover art is now streamed through the backend proxy, so the rendered src
    // embeds the approved detail URL rather than pointing at the external host.
    expect(image).toHaveAttribute('src', expect.stringContaining(`/api/artwork?u=${encodeURIComponent(record.image.detailUrl)}`));
    expect(image).toHaveAttribute('width', '1200');
    expect(image).toHaveAttribute('height', '1200');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(screen.getByRole('link', { name: 'Artwork source' })).toHaveAttribute('href', record.image.sourceUrl);
    fireEvent.load(image);
    expect(container.querySelector('.product-image')).toHaveClass('is-loaded');
  });

  it('uses the accessible vinyl placeholder when artwork is missing or unapproved', () => {
    const { rerender, container } = render(<ProductImage record={{ ...record, image: null }} />);
    expect(screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' })).toBeVisible();
    expect(container.querySelector('img')).toBeNull();

    rerender(<ProductImage record={{
      ...record,
      image: { ...record.image, thumbnailUrl: 'https://images.example.com/copied.jpg' },
    }} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('switches once to the placeholder after an image error and does not retry on rerender', () => {
    const view = render(<ProductImage record={record} />);
    fireEvent.error(screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' }));
    expect(view.container.querySelector('img')).toBeNull();
    expect(screen.getByTestId('product-image-placeholder')).toHaveAttribute('role', 'img');
    view.rerender(<ProductImage record={record} />);
    expect(view.container.querySelector('img')).toBeNull();
  });

  it('uses empty alt text for decorative repeated thumbnails', () => {
    const { container } = render(<ProductImage record={record} decorative />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.queryByRole('img')).toBeNull();
  });
});
