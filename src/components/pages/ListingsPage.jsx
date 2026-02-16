import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchListings, deleteListing } from "../slices/listingsSlice";
import { fetchCategories } from "../slices/categoriesSlice";

function formatINR(value) {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n}`;
  }
}

function getFirstImage(listing) {
  const img = listing?.images?.[0];
  return img && String(img).trim().length > 0 ? img : null;
}

function SkeletonCard() {
  return (
    <div className="card shadow-sm h-100">
      <div className="bg-secondary bg-opacity-25" style={{ height: 180 }} />
      <div className="card-body">
        <div className="placeholder-glow">
          <span className="placeholder col-8" />
          <span className="placeholder col-6 d-block mt-2" />
          <span className="placeholder col-10 d-block mt-3" />
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage({ onEdit }) {
  const dispatch = useDispatch();

  const token = useSelector((s) => s.adminAuth.token);

  const { items: listings, loading: listingsLoading, error: listingsError } =
    useSelector((s) => s.listings);

  const { items: categories } = useSelector((s) => s.categories);

  // UI filters
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState("all"); // all | available | not
  const [sort, setSort] = useState("newest"); // newest | priceLow | priceHigh | name
  const [page, setPage] = useState(1);

  // pagination
  const pageSize = 9;

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCategories());
    dispatch(fetchListings());
  }, [dispatch, token]);

  const categoriesMap = useMemo(() => {
    const m = new Map();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let arr = [...(listings || [])];

    // search
    if (query) {
      arr = arr.filter((l) => {
        const name = String(l.placeName || "").toLowerCase();
        const city = String(l.address?.city || "").toLowerCase();
        const pin = String(l.address?.pin || "").toLowerCase();
        return name.includes(query) || city.includes(query) || pin.includes(query);
      });
    }

    // category filter
    if (categoryId) {
      arr = arr.filter((l) => l.categoryId === categoryId);
    }

    // availability filter
    if (availability === "available") {
      arr = arr.filter((l) => !!l.isAvailable);
    } else if (availability === "not") {
      arr = arr.filter((l) => !l.isAvailable);
    }

    // sort
    if (sort === "newest") {
      arr.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    } else if (sort === "priceLow") {
      arr.sort(
        (a, b) => Number(a.pricePerNight || 0) - Number(b.pricePerNight || 0)
      );
    } else if (sort === "priceHigh") {
      arr.sort(
        (a, b) => Number(b.pricePerNight || 0) - Number(a.pricePerNight || 0)
      );
    } else if (sort === "name") {
      arr.sort((a, b) =>
        String(a.placeName || "").localeCompare(String(b.placeName || ""))
      );
    }

    return arr;
  }, [listings, q, categoryId, availability, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    // reset to page 1 whenever filters change
    setPage(1);
  }, [q, categoryId, availability, sort]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this listing?");
    if (!ok) return;
    await dispatch(deleteListing(id));
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="m-0">Listings</h3>
          <div className="text-muted" style={{ fontSize: 14 }}>
            Manage your properties like a real admin panel
          </div>
        </div>

        <span className="badge text-bg-dark">
          Total: {filtered.length}
        </span>
      </div>

      {!token && (
        <div className="alert alert-warning py-2">
          Please login as admin to view listings.
        </div>
      )}

      {/* Filters */}
      <div className="card shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Search by place, city, pin..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All categories</option>
              {categories
                .slice()
                .sort((a, b) =>
                  String(a.name || "").localeCompare(String(b.name || ""))
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="not">Not available</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="priceLow">Price: Low → High</option>
              <option value="priceHigh">Price: High → Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Errors */}
      {listingsError && (
        <div className="alert alert-danger py-2">{listingsError}</div>
      )}

      {/* Loading */}
      {listingsLoading && (
        <div className="row g-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div className="col-md-4" key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!listingsLoading && filtered.length === 0 && (
        <div className="text-center py-5">
          <h5 className="mb-2">No listings found</h5>
          <div className="text-muted">
            Try changing filters or add a new listing.
          </div>
        </div>
      )}

      {/* Cards grid */}
      {!listingsLoading && filtered.length > 0 && (
        <>
          <div className="row g-3">
            {paged.map((l) => {
              const img = getFirstImage(l);
              const catName = categoriesMap.get(l.categoryId) || "—";
              const city = l.address?.city || "";
              const pin = l.address?.pin || "";
              const available = !!l.isAvailable;

              return (
                <div className="col-md-4" key={l.id}>
                  <div className="card shadow-sm h-100">
                    {/* image */}
                    <div style={{ position: "relative" }}>
                      {img ? (
                        <img
                          src={img}
                          alt={l.placeName}
                          style={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center"
                          style={{ height: 180 }}
                        >
                          <span className="text-muted">No image</span>
                        </div>
                      )}

                      <span
                        className={`badge ${
                          available ? "text-bg-success" : "text-bg-secondary"
                        }`}
                        style={{ position: "absolute", top: 10, left: 10 }}
                      >
                        {available ? "Available" : "Not available"}
                      </span>

                      <span
                        className="badge text-bg-dark"
                        style={{ position: "absolute", top: 10, right: 10 }}
                      >
                        {formatINR(l.pricePerNight)}/night
                      </span>
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-1">{l.placeName}</h5>

                      <div className="text-muted" style={{ fontSize: 14 }}>
                        {catName} • {city} {pin ? `• ${pin}` : ""}
                      </div>

                      {l.description && (
                        <p className="card-text mt-2 text-muted" style={{ fontSize: 14 }}>
                          {String(l.description).slice(0, 90)}
                          {String(l.description).length > 90 ? "..." : ""}
                        </p>
                      )}

                      <div className="mt-auto d-flex gap-2">
                        <button
                          className="btn btn-outline-dark btn-sm w-100"
                          onClick={() => onEdit?.(l)} // pass listing to parent if you want
                          type="button"
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={() => handleDelete(l.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    type="button"
                  >
                    Prev
                  </button>
                </li>

                <li className="page-item disabled">
                  <span className="page-link">
                    Page {page} / {totalPages}
                  </span>
                </li>

                <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    type="button"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
