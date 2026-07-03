export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  return (
    <nav className="pagination" aria-label="Catalog pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        Previous
      </button>
      {pages.map((value, index) => (
        <span key={value} className="pagination-item">
          {index > 0 && value - pages[index - 1] > 1 && <span aria-hidden="true">...</span>}
          <button
            onClick={() => onPageChange(value)}
            aria-label={`Page ${value}`}
            aria-current={value === page ? 'page' : undefined}
          >
            {value}
          </button>
        </span>
      ))}
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        Next
      </button>
    </nav>
  );
}
