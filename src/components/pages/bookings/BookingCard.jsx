import React from "react";
import { formatINR } from "./utils";

export default function BookingCard({
  b,
  updating,
  onApprove,
  onReject
}) {

  const snap = b.listingSnapshot || {};

  const img = snap.image || b.image || "";
  const title = snap.title || b.listingName || "Hotel";

  const total =
    b.totalPrice ??
    Number(b.pricePerNight || 0) *
    Number(b.nights || 0);

  const status = b.status || "pending";

  const statusBadge =
    status === "approved"
      ? "bg-success"
      : status === "rejected"
      ? "bg-danger"
      : "bg-warning text-dark";

  return (
    <div className="col-12 col-lg-6">

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

              <div className="d-flex justify-content-between">

                <h5>{title}</h5>

                <span className={`badge ${statusBadge}`}>
                  {status}
                </span>

              </div>


              <div className="small text-secondary">
                {snap.location || b.address}
              </div>


              <div className="mt-2 small">

                <div className="d-flex justify-content-between">
                  <span>Guest</span>
                  <b>{b.name}</b>
                </div>

                <div className="d-flex justify-content-between">
                  <span>Phone</span>
                  <b>{b.phone}</b>
                </div>

                <div className="d-flex justify-content-between">
                  <span>Dates</span>
                  <b>
                    {b.fromDate} → {b.toDate}
                  </b>
                </div>

                <div className="d-flex justify-content-between">
                  <span>Price</span>
                  <b>
                    {formatINR(b.pricePerNight)} /
                    night • {formatINR(total)}
                  </b>
                </div>

              </div>


              <div className="mt-3 d-flex gap-2">

                {status === "pending" && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => onApprove(b)}
                      disabled={updating}
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onReject(b)}
                      disabled={updating}
                    >
                      Reject
                    </button>
                  </>
                )}

                {status === "approved" && (
                  <button className="btn btn-secondary btn-sm" disabled>
                    Approved
                  </button>
                )}

                {status === "rejected" && (
                  <button className="btn btn-secondary btn-sm" disabled>
                    Rejected
                  </button>
                )}

              </div>


              <small className="text-secondary d-block mt-2">
                Booking ID: {b.id}
              </small>


              {status === "rejected" &&
                b.rejectReason && (

                <small className="text-danger d-block">
                  Reason: {b.rejectReason}
                </small>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}