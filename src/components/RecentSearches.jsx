export default function RecentSearches({ items, onSelect, onClear, compact = false }) {
  if (items.length === 0) return null;
  return (
    <section className={`recent-searches${compact ? ' compact' : ''}`} aria-label="Recent searches">
      <div className="recent-searches-heading">
        <span>Recent searches</span>
        <button type="button" onClick={onClear}>Clear</button>
      </div>
      <ul role="list">
        {items.map((item) => (
          <li key={item}>
            <button type="button" onClick={() => onSelect(item)}>{item}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
