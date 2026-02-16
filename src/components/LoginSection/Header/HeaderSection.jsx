import React from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin } from "../../slices/AdminAuthSlice";

const linkStyle = ({ isActive }) =>
  `nav-link px-2 ${isActive ? "text-warning fw-semibold" : "text-white-50"}`;

const HeaderSection = () => {
  const dispatch = useDispatch();
  const { token, email, isAdmin } = useSelector((s) => s.adminAuth);

  const handleLogout = () => dispatch(logoutAdmin());

  const showNav = token && isAdmin;

  return (
    <header className="bg-dark text-white shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">
        {/* Brand */}
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold fs-4" style={{ letterSpacing: "1px" }}>
            ✈ Maroon Travelers
          </span>
          <span className="badge bg-warning text-dark ms-2">Admin Panel</span>
        </div>

        {/* Navigation */}
        {showNav && (
          <nav>
            <ul className="nav">
              <li className="nav-item">
                <NavLink to="/admin/dashboard" className={linkStyle}>
                  Dashboard
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/admin/categories" className={linkStyle}>
                  Categories
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/admin/add-listing" className={linkStyle}>
                  Add Listing
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/admin/listings" className={linkStyle}>
                  Listings
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/admin/bookings" className={linkStyle}>
                  Bookings
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        {/* Right side */}
        {showNav && (
          <div className="d-flex align-items-center gap-3">
            <span className="text-light small">{email}</span>
            <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderSection;
