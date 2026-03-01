export default function Pagination({ page, setPage, totalPages }) {
  return (
    <div className="d-flex justify-content-center mt-4">
      <button onClick={() => setPage(page - 1)}>Prev</button>

      <span>
        Page {page}/{totalPages}
      </span>

      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}
