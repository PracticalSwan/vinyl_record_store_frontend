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
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('data-artwork-source', 'proxy');
    expect(screen.getByRole('link', { name: 'Artwork source' })).toHaveAttribute('href', record.image.sourceUrl);
    fireEvent.load(image);
    expect(container.querySelector('.product-image')).toHaveClass('is-loaded');
  });

  it('uses the per-record local artwork when remote artwork is missing or unapproved', () => {
    const { rerender, container } = render(<ProductImage record={{ ...record, image: null }} />);
    expect(screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' })).toHaveAttribute(
      'src',
      expect.stringContaining('/api/artwork/local/1'),
    );
    expect(container.querySelector('img')).toHaveAttribute('data-artwork-source', 'local');

    rerender(<ProductImage record={{
      ...record,
      image: { ...record.image, thumbnailUrl: 'https://images.example.com/copied.jpg' },
    }} />);
    expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('/api/artwork/local/1'));

    rerender(<ProductImage record={{ ...record, id: null, image: null }} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByTestId('product-image-placeholder')).toHaveAttribute('role', 'img');
  });

  it('falls back from the proxy to local artwork and then once to the placeholder', () => {
    const view = render(<ProductImage record={record} />);
    fireEvent.error(screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' }));
    const local = screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' });
    expect(local).toHaveAttribute('src', expect.stringContaining('/api/artwork/local/1'));
    expect(local).toHaveAttribute('data-artwork-source', 'local');
    view.rerender(<ProductImage record={record} />);
    expect(view.container.querySelector('img')).toHaveAttribute('data-artwork-source', 'local');

    fireEvent.error(screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' }));
    expect(view.container.querySelector('img')).toBeNull();
    expect(screen.getByTestId('product-image-placeholder')).toHaveAttribute('role', 'img');
    view.rerender(<ProductImage record={record} />);
    expect(view.container.querySelector('img')).toBeNull();
  });

  it('resets for a new record and ignores a stale error from the previous source', () => {
    const second = {
      ...record,
      id: 2,
      title: 'Innervisions',
      artist: 'Stevie Wonder',
      image: {
        ...record.image,
        thumbnailUrl: 'https://coverartarchive.org/release/second/cover-500.jpg',
      },
    };
    const view = render(<ProductImage record={record} />);
    const originalProxy = screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' });
    fireEvent.error(originalProxy);
    const local = screen.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' });
    fireEvent.load(local);
    fireEvent.error(originalProxy);
    expect(view.container.querySelector('.product-image')).toHaveClass('is-loaded');
    expect(view.container.querySelector('img')).toHaveAttribute('data-artwork-source', 'local');

    view.rerender(<ProductImage record={second} />);
    const secondProxy = screen.getByRole('img', { name: 'Cover art for Innervisions by Stevie Wonder.' });
    expect(secondProxy).toHaveAttribute('data-artwork-source', 'proxy');
    expect(secondProxy).toHaveAttribute('src', expect.stringContaining(encodeURIComponent(second.image.thumbnailUrl)));
  });

  it('uses empty alt text for decorative repeated thumbnails', () => {
    const { container } = render(<ProductImage record={record} decorative />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.queryByRole('img')).toBeNull();
  });
});
