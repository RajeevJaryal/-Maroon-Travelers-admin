import React from "react";

export default function BookingFilters({
  q,
  setQ,
  onlyPending,
  setOnlyPending,
  refresh,
  loading,
  pendingCount,
  total
}) {
  return (
    <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
      
      <div>
        <h3 className="text-white m-0">Bookings</h3>
        <small className="text-secondary">
          Pending: <b>{pendingCount}</b> • Total: <b>{total}</b>
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
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
          />
          <label className="form-check-label">
            Pending only
          </label>
        </div>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>

    </div>
  );
}