import CatalogResultsLayout from '../components/CatalogResultsLayout';
import { useCatalogQuery } from '../hooks/useCatalogQuery';

export default function CatalogPage() {
  const catalog = useCatalogQuery();
  return (
    <CatalogResultsLayout
      title="Record catalog"
      query={catalog.query}
      updateQuery={catalog.updateQuery}
      resource={catalog}
    />
  );
}
