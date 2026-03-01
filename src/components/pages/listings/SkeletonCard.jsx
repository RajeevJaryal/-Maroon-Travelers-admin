export default function SkeletonCard() {
  return (
    <div className="card shadow-sm h-100">

      <div
        className="bg-secondary bg-opacity-25"
        style={{ height: 180 }}
      />

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