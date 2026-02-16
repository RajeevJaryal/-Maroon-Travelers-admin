// Upload ONE image file to Firebase Storage using REST (no SDK)
// Returns a public download URL
export async function uploadImageToFirebase(file, idToken) {
  const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  if (!bucket) throw new Error("Missing VITE_FIREBASE_STORAGE_BUCKET in .env");

  // unique file name
  const safeName = `${Date.now()}_${Math.random().toString(16).slice(2)}_${file.name}`;
  const path = `listings/${safeName}`;

  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(
    path
  )}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Image upload failed");
  }

  const data = await res.json();

  // simple download url (works if storage rules allow read)
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    data.name
  )}?alt=media`;
}
