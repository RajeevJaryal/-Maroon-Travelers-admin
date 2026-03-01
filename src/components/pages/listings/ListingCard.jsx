import { formatINR, getFirstImage } from "./listingsUtils";

export default function ListingCard({
  l,
  categoriesMap,
  navigate,
  handleDelete,
}) {
  const img = getFirstImage(l);

  const catName = categoriesMap.get(l.categoryId) || "-";

  const available = l.isAvailable ? "Available" : "Not Available";

  const city = l.address?.city || "";

  const pin = l.address?.pin || "";

  const state = l.address?.state || "";

  return (
    <div className="col-md-4">
      <div className="card shadow-sm h-100">
        {/* IMAGE */}

        {img ? (
          <img
            src={img}
            alt={l.placeName}
            style={{
              width: "100%",
              height: 200,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            className="bg-light d-flex justify-content-center align-items-center"
            style={{ height: 200 }}
          >
            No Image
          </div>
        )}

        <div className="card-body d-flex flex-column">
          {/* TITLE */}

          <h5 className="card-title">{l.placeName}</h5>

          {/* CATEGORY */}

          <div className="text-muted">
            <b>Category:</b> {catName}
          </div>

          {/* PRICE */}

          <div>
            <b>Price:</b>
            {formatINR(l.pricePerNight)} / night
          </div>

          {/* AVAILABILITY */}

          <div>
            <b>Status:</b>

            <span className={l.isAvailable ? "text-success" : "text-danger"}>
              {available}
            </span>
          </div>

          {/* ADDRESS */}

          <div>
            <b>Location:</b>

            {city}

            {state && `, ${state}`}

            {pin && ` - ${pin}`}
          </div>

          {/* DESCRIPTION */}

          {l.description && (
            <div className="mt-2">
              <b>Description:</b>

              <div
                style={{
                  fontSize: 14,
                  color: "#555",
                }}
              >
                {l.description}
              </div>
            </div>
          )}

          {/* EXTRA DETAILS */}

          <div className="mt-2">
            <b>Listing ID:</b>

            {l.id}
          </div>

          {/* BUTTONS */}

          <div className="mt-auto d-flex gap-2 pt-3">
            <button
              className="btn btn-dark btn-sm w-100"
              onClick={() => navigate(`/admin/edit/${l.id}`)}
            >
              Edit
            </button>

            <button
              className="btn btn-danger btn-sm w-100"
              onClick={() => handleDelete(l.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
