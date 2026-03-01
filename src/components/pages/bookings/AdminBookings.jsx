import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllBookings,
  approveBooking,
  rejectBooking,
} from "../../slices/bookingsSlice";

import BookingCard from "./BookingCard";
import BookingFilters from "./BookingFilters";

export default function AdminBookings() {

  const dispatch = useDispatch();

  const { token } = useSelector(
    (s) => s.adminAuth
  );

  const {
    items = [],
    loading = false,
    error = null,
    updating = false,
  } = useSelector(
    (s) => s.bookings
  );

  const [onlyPending, setOnlyPending] =
    useState(true);

  const [q, setQ] = useState("");



  useEffect(() => {

    if (token)
      dispatch(
        fetchAllBookings({
          idToken: token,
        })
      );

  }, [token]);



  const filtered = useMemo(() => {

    let list = onlyPending
      ? items.filter(
          (b) =>
            b.status !== "approved" &&
            b.status !== "rejected"
        )
      : items;


    return list.filter((b) => {

      const title =
        b.listingSnapshot?.title ||
        "";

      const email =
        b.email || "";

      const phone =
        b.phone || "";

      return (
        title.toLowerCase()
          .includes(q.toLowerCase()) ||

        email.toLowerCase()
          .includes(q.toLowerCase()) ||

        phone.toLowerCase()
          .includes(q.toLowerCase())
      );
    });

  }, [items, onlyPending, q]);



  const pendingCount = useMemo(() =>

    items.filter(
      (b) =>
        b.status !== "approved" &&
        b.status !== "rejected"
    ).length,

    [items]

  );



  const handleApprove = (b) => {

    dispatch(
      approveBooking({
        bookingId: b.id,
        userId: b.userId,
        idToken: token,
      })
    );

  };



  const handleReject = (b) => {

    const reason =
      window.prompt("Reason");

    dispatch(
      rejectBooking({

        bookingId: b.id,

        userId: b.userId,

        idToken: token,

        reason

      })
    );

  };



  if (!token)
    return <div>Admin Login Required</div>;



  return (
    <div className="container py-4">


      <BookingFilters

        q={q}

        setQ={setQ}

        onlyPending={onlyPending}

        setOnlyPending={setOnlyPending}

        refresh={() =>
          dispatch(
            fetchAllBookings({
              idToken: token,
            })
          )
        }

        loading={loading}

        pendingCount={pendingCount}

        total={items.length}

      />


      {error &&
        <div className="alert alert-danger">
          {error}
        </div>
      }


      <div className="row g-3">

        {filtered.map((b) => (

          <BookingCard

            key={b.id}

            b={b}

            updating={updating}

            onApprove={handleApprove}

            onReject={handleReject}

          />

        ))}

      </div>

    </div>
  );
}