// ✅ AdminBookings.jsx (UI) — shows all bookings + filter pending + approve button
// Route example: <Route path="/admin/bookings" element={<AdminBookings />} />

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBookings, approveBooking } from "../slices/BookingsSlice";

function formatINR(n) {
  const v = Number(n || 0);
  return `₹${v.toLocaleString("en-IN")}`;
}

export default function AdminBookings() {
  const dispatch = useDispatch();

  // ✅ admin token (adjust path if your slice name differs)
  const { token: adminToken } = useSelector((s) => s.adminAuth || {});
  const { items = [], loading = false, error = null } = useSelector(
    (s) => s.bookings || {}
  );

  const [onlyPending, setOnlyPending] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (adminToken) dispatch(fetchAllBookings({ idToken: adminToken }));
  }, [dispatch, adminToken]);

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const byStatus = onlyPending ? list.filter((b) => b.status !== "approved") : list;

    const query = q.trim().toLowerCase();
    if (!query) return byStatus;

    return byStatus.filter((b) => {
      const title = b?.listingSnapshot?.title || b?.listingName || "";
      const email = b?.email || b?.userEmail || "";
      const phone = b?.phone || "";
      return (
        String(title).toLowerCase().includes(query) ||
        String(email).toLowerCase().includes(query) ||
        String(phone).toLowerCase().includes(query)
      );
    });
  }, [items, onlyPending, q]);

  const pendingCount = useMemo(
    () => (Array.isArray(items) ? items.filter((b) => b.status !== "approved").length : 0),
    [items]
  );

  const handleApprove = (b) => {
    const userId = b.userId; // IMPORTANT: you must store userId in bookingData (you already are)
    if (!adminToken || !b?.id || !userId) return;

    dispatch(
      approveBooking({
        bookingId: b.id,
        userId,
        idToken: adminToken,
      })
    );
  };

  if (!adminToken) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Admin not logged in. Please login to access bookings.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div>
          <h3 className="text-white m-0">Bookings</h3>
          <small className="text-secondary">
            Pending: <b>{pendingCount}</b> • Total: <b>{items.length}</b>
          </small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <input
            className="form-control form-control-sm"
            style={{ width: 260 }}
            placeholder="Search title / email / phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="form-check form-switch text-white">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="pendingOnly"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="pendingOnly">
              Pending only
            </label>
          </div>

          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => dispatch(fetchAllBookings({ idToken: adminToken }))}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{String(error)}</div>}
      {loading && <div className="alert alert-info">Loading bookings...</div>}

      {!loading && filtered.length === 0 && (
        <div className="alert alert-secondary">No bookings found.</div>
      )}

      <div className="row g-3">
        {filtered.map((b) => {
          const snap = b.listingSnapshot || {};
          const img = snap.image || b.image || "";
          const title = snap.title || b.listingName || "Hotel";
          const total = b.totalPrice ?? (Number(b.pricePerNight || 0) * Number(b.nights || 0));
          const status = b.status || "pending";

          return (
            <div className="col-12 col-lg-6" key={b.id}>
              <div className="card bg-black text-white border border-secondary h-100">
                <div className="row g-0">
                  <div className="col-4">
                    {img ? (
                      <img
                        src={img}
                        alt={title}
                        className="img-fluid h-100"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center text-secondary"
                        style={{ height: "100%", minHeight: 160 }}
                      >
                        No image
                      </div>
                    )}
                  </div>

                  <div className="col-8">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <h5 className="card-title mb-1">{title}</h5>
                        <span
                          className={`badge ${
                            status === "approved"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="text-secondary small">
                        {snap.location || b.address || ""}
                      </div>

                      <div className="mt-2 small">
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">Guest</span>
                          <b>{b.name || "-"}</b>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">Phone</span>
                          <b>{b.phone || "-"}</b>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">Dates</span>
                          <b>
                            {b.fromDate || "-"} → {b.toDate || "-"}{" "}
                            {b.nights ? `(${b.nights} nights)` : ""}
                          </b>
                        </div>

                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">Price</span>
                          <b>
                            {formatINR(b.pricePerNight)} / night • Total:{" "}
                            {formatINR(total)}
                          </b>
                        </div>
                      </div>

                      <div className="mt-3 d-flex gap-2">
                        {status !== "approved" ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(b)}
                          >
                            Approve
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm" disabled>
                            Approved
                          </button>
                        )}

                        <button
                          className="btn btn-outline-light btn-sm"
                          onClick={() => {
                            // quick details popup (optional)
                            alert(JSON.stringify(b, null, 2));
                          }}
                        >
                          View JSON
                        </button>
                      </div>

                      <small className="text-secondary d-block mt-2">
                        Booking ID: {b.id}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}