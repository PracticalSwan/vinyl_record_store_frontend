import { NavLink, Outlet, Link } from 'react-router-dom';

// Administrator workspace shell. Customer routes stay visually separate: this
// layout only renders for a verified admin session (RequireRole wraps it).
export default function AdminLayout() {
  return (
    <main className="container admin-layout">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">Administration</p>
          <h1 className="section-heading page-heading">Groovehaus catalog</h1>
        </div>
        <Link className="btn btn-outline btn-sm" to="/">Back to store</Link>
      </div>
      <nav className="admin-nav" aria-label="Administration navigation">
        <NavLink to="/admin" end className="admin-nav-link" aria-current="page">Dashboard</NavLink>
        <NavLink to="/admin/products" className="admin-nav-link" aria-current="page">Products</NavLink>
        <NavLink to="/admin/import" className="admin-nav-link" aria-current="page">Import</NavLink>
      </nav>
      <Outlet />
    </main>
  );
}
