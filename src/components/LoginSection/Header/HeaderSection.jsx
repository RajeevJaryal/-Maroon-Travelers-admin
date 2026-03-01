import React from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin } from "../../slices/AdminAuthSlice";

const linkStyle = ({ isActive }) =>
  `nav-link ${isActive ? "text-warning fw-semibold" : "text-white-50"}`;

const HeaderSection = () => {
  const dispatch = useDispatch();
  const { token, email, isAdmin } = useSelector((s) => s.adminAuth);

  const handleLogout = () => dispatch(logoutAdmin());
  const showNav = token && isAdmin;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        {/* Brand */}
        <span
          className="navbar-brand fw-bold"
          style={{ letterSpacing: "1px" }}
        >
          Maroon Travelers
          <span className="badge bg-warning text-dark ms-2">
            Admin Panel
          </span>
        </span>

        {/* Hamburger Button (Mobile) */}
        {showNav && (
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        )}

        {/* Collapsible Content */}
        {showNav && (
          <div className="collapse navbar-collapse" id="adminNavbar">
            {/* Left Nav Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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

            {/* Right Side */}
            <div className="d-flex align-items-lg-center flex-column flex-lg-row gap-2">
              <span className="text-light small">{email}</span>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HeaderSection;