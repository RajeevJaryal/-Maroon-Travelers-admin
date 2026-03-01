export function formatINR(value) {
  const n = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function getFirstImage(listing) {
  const img = listing?.images?.[0];
  return img ? img : null;
}