import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCategories } from "../slices/categoriesSlice";
import { fetchListings, updateListing } from "../slices/listingsSlice";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((s) => s.adminAuth.token);
  const { items: categories, loading: catsLoading } = useSelector((s) => s.categories);
  const { items: listings } = useSelector((s) => s.listings);

  const listing = useMemo(
    () => (listings || []).find((x) => x.id === id),
    [listings, id]
  );

  const [placeName, setPlaceName] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // image links (3–4)
  const [imageUrls, setImageUrls] = useState(["", "", ""]);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCategories());
    dispatch(fetchListings()); // ensure listing exists after refresh
  }, [dispatch, token]);

  useEffect(() => {
    if (!listing) return;

    setPlaceName(listing.placeName || "");
    setPricePerNight(listing.pricePerNight || "");
    setStreet(listing.address?.street || "");
    setCity(listing.address?.city || "");
    setPin(listing.address?.pin || "");
    setCategoryId(listing.categoryId || "");
    setDescription(listing.description || "");
    setIsAvailable(!!listing.isAvailable);

    const imgs = (listing.images || []).slice(0, 4);
    const base = ["", "", ""];
    for (let i = 0; i < Math.min(3, imgs.length); i++) base[i] = imgs[i];
    if (imgs.length === 4) base.push(imgs[3]);
    setImageUrls(base);
  }, [listing]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [categories]);

  const handleImageChange = (idx, val) => {
    const copy = [...imageUrls];
    copy[idx] = val;
    setImageUrls(copy);
  };

  const addImageField = () => {
    if (imageUrls.length < 4) setImageUrls([...imageUrls, ""]);
  };

  const removeImageField = () => {
    if (imageUrls.length > 3) setImageUrls(imageUrls.slice(0, -1));
  };

  const onSave = async (e) => {
    e.preventDefault();

    const validUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length < 3) {
      alert("Please enter at least 3 image URLs.");
      return;
    }

    const data = {
      placeName,
      pricePerNight,
      street,
      city,
      pin,
      categoryId,
      description,
      isAvailable,
      images: validUrls,
    };

    const res = await dispatch(updateListing({ id, data }));
    if (updateListing.fulfilled.match(res)) {
      navigate("/admin/listings");
    }
  };

  if (!listing) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Listing not found. Try going back to Listings.
        </div>
        <button className="btn btn-dark" onClick={() => navigate("/admin/listings")}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 950 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">Edit Listing</h3>
        <button className="btn btn-outline-dark" onClick={() => navigate("/admin/listings")}>
          Back
        </button>
      </div>

      <form className="card shadow-sm p-3" onSubmit={onSave}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Place name *</label>
            <input
              className="form-control"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Lake View Villa"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Price per night *</label>
            <input
              type="number"
              className="form-control"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="e.g. 4500"
              min="1"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Street / Area</label>
            <input
              className="form-control"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">City *</label>
            <input
              className="form-control"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Manali"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">PIN code *</label>
            <input
              className="form-control"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 175131"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={catsLoading}
              required
            >
              <option value="">
                {catsLoading ? "Loading categories..." : "Select category"}
              </option>
              {sortedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 d-flex align-items-end">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="availableEdit"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="availableEdit">
                Available
              </label>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          <div className="col-12">
            <label className="form-label">Select 3–4 Images *</label>

            {imageUrls.map((url, idx) => (
              <input
                key={idx}
                type="text"
                className="form-control mb-2"
                value={url}
                onChange={(e) => handleImageChange(idx, e.target.value)}
                placeholder={`Paste image URL ${idx + 1}`}
              />
            ))}

            <div className="form-text">
              Minimum 3 image links, maximum 4 image links.
            </div>

            <div className="mt-2">
              <button type="button" className="btn btn-sm btn-secondary me-2" onClick={addImageField}>
                + Add Image
              </button>
              <button type="button" className="btn btn-sm btn-danger" onClick={removeImageField}>
                - Remove Image
              </button>
            </div>
          </div>
        </div>

        <button className="btn btn-dark mt-3" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}
