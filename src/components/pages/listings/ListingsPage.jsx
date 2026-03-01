import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchListings, deleteListing } from "../../slices/listingsSlice";
import { fetchCategories } from "../../slices/categoriesSlice";
import { useNavigate } from "react-router-dom";

import ListingsFilters from "./ListingsFilters";
import ListingCard from "./ListingCard";
import Pagination from "./Pagination";
import SkeletonCard from "./SkeletonCard";

export default function ListingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((s) => s.adminAuth.token);

  const {
    items: listings,
    loading: listingsLoading,
    error: listingsError,
  } = useSelector((s) => s.listings);

  const { items: categories } = useSelector((s) => s.categories);

  // Filters state

  const [q, setQ] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [availability, setAvailability] = useState("all");

  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);

  const pageSize = 9;

  // Load data

  useEffect(() => {
    if (!token) return;

    dispatch(fetchCategories());

    dispatch(fetchListings());
  }, [token]);

  // Category Map

  const categoriesMap = useMemo(() => {
    const m = new Map();

    categories.forEach((c) => m.set(c.id, c.name));

    return m;
  }, [categories]);

  // Filtering

  const filtered = useMemo(() => {
    let arr = [...(listings || [])];

    const query = q.toLowerCase();

    if (query) {
      arr = arr.filter((l) =>
        String(l.placeName).toLowerCase().includes(query),
      );
    }

    if (categoryId) {
      const name = categoriesMap.get(categoryId);

      arr = arr.filter((l) => l.categoryId === name);
    }

    if (availability === "available") {
      arr = arr.filter((l) => l.isAvailable);
    }

    if (availability === "not") {
      arr = arr.filter((l) => !l.isAvailable);
    }

    if (sort === "newest") {
      arr.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (sort === "priceLow") {
      arr.sort((a, b) => a.pricePerNight - b.pricePerNight);
    }

    if (sort === "priceHigh") {
      arr.sort((a, b) => b.pricePerNight - a.pricePerNight);
    }

    if (sort === "name") {
      arr.sort((a, b) => a.placeName.localeCompare(b.placeName));
    }

    return arr;
  }, [listings, q, categoryId, availability, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [q, categoryId, availability, sort]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete listing?");

    if (!ok) return;

    await dispatch(deleteListing(id));
  };

  if (!token)
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Admin login required</div>
      </div>
    );

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <h3>Listings</h3>

      <ListingsFilters
        q={q}
        setQ={setQ}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        availability={availability}
        setAvailability={setAvailability}
        sort={sort}
        setSort={setSort}
        categories={categories}
      />

      {listingsError && (
        <div className="alert alert-danger">{listingsError}</div>
      )}

      {listingsLoading && (
        <div className="row g-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div className="col-md-4" key={i}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}

      {!listingsLoading && (
        <div className="row g-3">
          {paged.map((l) => (
            <ListingCard
              key={l.id}
              l={l}
              categoriesMap={categoriesMap}
              navigate={navigate}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}
