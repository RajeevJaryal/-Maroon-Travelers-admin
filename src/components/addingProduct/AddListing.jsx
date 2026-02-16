import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../slices/categoriesSlice";
import { addListing, clearListingsError } from "../slices/listingsSlice";
import { uploadImageToFirebase } from "../../utils/uploadImage";

export default function AddListing() {
  const dispatch = useDispatch();

  const token = useSelector((s) => s.adminAuth.token);

  const { items: categories, loading: catsLoading, error: catsError } =
    useSelector((s) => s.categories);

  const { loading: listingLoading, error: listingError } = useSelector(
    (s) => s.listings
  );

  const [placeName, setPlaceName] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // ✅ device images
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // string[]
  const [uploading, setUploading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCategories());
  }, [dispatch, token]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [categories]);

  const resetForm = () => {
    setPlaceName("");
    setPricePerNight("");
    setStreet("");
    setCity("");
    setPin("");
    setCategoryId("");
    setDescription("");
    setIsAvailable(true);

    // clear images
    setImageFiles([]);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews([]);
  };

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []);

    // 3–4 images max
    const selected = files.slice(0, 4);

    // clear old previews to avoid memory leak
    previews.forEach((u) => URL.revokeObjectURL(u));

    setImageFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    dispatch(clearListingsError());

    if (!token) return;

    if (imageFiles.length < 3) {
      alert("Please select at least 3 images (max 4).");
      return;
    }

    try {
      setUploading(true);

      // ✅ 1) Upload images to Firebase Storage and get URLs
      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => uploadImageToFirebase(file, token))
      );

      // ✅ 2) Save listing in DB using your redux thunk
      const listingData = {
        placeName,
        pricePerNight,
        street,
        city,
        pin,
        categoryId,
        description,
        isAvailable,
        images: uploadedUrls, // ✅ URLs stored in DB
      };

      const res = await dispatch(addListing(listingData));

      if (addListing.fulfilled.match(res)) {
        setSuccessMsg("Listing added successfully ✅");
        resetForm();
      }
    } catch (err) {
      console.log(err);
      alert(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const isBusy = listingLoading || uploading;

  return (
    <div className="container py-4" style={{ maxWidth: 950 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">Create Listing</h3>
        <span className="text-muted" style={{ fontSize: 14 }}>
          Add a new property for users
        </span>
      </div>

      {!token && (
        <div className="alert alert-warning py-2">
          Please login as admin to add listings.
        </div>
      )}

      {catsError && <div className="alert alert-danger py-2">{catsError}</div>}
      {listingError && (
        <div className="alert alert-danger py-2">{listingError}</div>
      )}
      {successMsg && (
        <div className="alert alert-success py-2">{successMsg}</div>
      )}

      <form className="card shadow-sm p-3" onSubmit={onSubmit}>
        <div className="row g-3">
          {/* Place name */}
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

          {/* Price */}
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

          {/* Address */}
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

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!token || catsLoading}
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

            <div className="form-text">
              Add categories first (Villa, Apartment, Houseboat).
            </div>
          </div>

          {/* Availability */}
          <div className="col-md-6 d-flex align-items-end">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="available"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="available">
                Available
              </label>
            </div>
          </div>

          {/* Description */}
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

          {/* ✅ Device image picker */}
          <div className="col-12">
            <label className="form-label">Select 3–4 Images *</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              multiple
              onChange={onPickImages}
            />
            <div className="form-text">Minimum 3 images, maximum 4 images.</div>
          </div>

          {/* previews */}
          {previews.length > 0 && (
            <div className="col-12">
              <div className="d-flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="preview"
                    style={{
                      width: 120,
                      height: 85,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="btn btn-dark mt-3" disabled={!token || isBusy}>
          {isBusy ? "Uploading / Saving..." : "Add Listing"}
        </button>
      </form>
    </div>
  );
}
