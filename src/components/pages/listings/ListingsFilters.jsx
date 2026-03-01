export default function ListingsFilters({
  q,
  setQ,
  categoryId,
  setCategoryId,
  availability,
  setAvailability,
  sort,
  setSort,
  categories
}) {

  return (
    <div className="card shadow-sm p-3 mb-3">

      <div className="row g-2">

        <div className="col-md-4">

          <input
            className="form-control"
            placeholder="Search..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />

        </div>


        <div className="col-md-3">

          <select
            className="form-select"
            value={categoryId}
            onChange={(e)=>setCategoryId(e.target.value)}
          >

            <option value="">All</option>

            {categories.map(c=>(
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
            onChange={(e)=>setAvailability(e.target.value)}
          >

            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="not">Not Available</option>

          </select>

        </div>


        <div className="col-md-3">

          <select
            className="form-select"
            value={sort}
            onChange={(e)=>setSort(e.target.value)}
          >

            <option value="newest">Newest</option>

            <option value="priceLow">
              Price Low
            </option>

            <option value="priceHigh">
              Price High
            </option>

            <option value="name">
              Name
            </option>

          </select>

        </div>

      </div>

    </div>
  );
}