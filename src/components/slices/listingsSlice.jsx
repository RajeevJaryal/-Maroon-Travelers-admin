import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dbAPI from "../../api/dbAPI";

/**
 * Listings slice (Admin)
 * - fetch all listings
 * - add listing (your form)
 * - update listing
 * - delete listing
 */

const normalizeListingPayload = (listing) => ({
  placeName: listing.placeName.trim(),
  pricePerNight: Number(listing.pricePerNight),
  address: {
    street: listing.street?.trim() || listing.address?.street?.trim() || "",
    city: (listing.city || listing.address?.city || "").trim(),
    pin: String(listing.pin || listing.address?.pin || "").trim(),
  },
  images: (listing.images || [])
    .map((x) => (x ? String(x).trim() : ""))
    .filter(Boolean)
    .slice(0, 4),
  categoryId: listing.categoryId,
  description: (listing.description || "").trim(),
  isAvailable: !!listing.isAvailable,
  updatedAt: Date.now(),
});

export const fetchListings = createAsyncThunk(
  "listings/fetchListings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      const res = await dbAPI.get("/listings.json", {
        params: { auth: token },
      });

      const data = res.data || {};
      return Object.keys(data).map((id) => ({ id, ...data[id] }));
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to fetch listings"
      );
    }
  }
);

export const addListing = createAsyncThunk(
  "listings/addListing",
  async (listing, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      // createdAt only at creation time
      const payload = {
        ...normalizeListingPayload(listing),
        createdAt: Date.now(),
      };

      // quick safety: at least 3 images
      if (payload.images.length < 3) {
        return rejectWithValue("Please add at least 3 image URLs.");
      }

      const res = await dbAPI.post("/listings.json", payload, {
        params: { auth: token },
      });
      console.log("TOKEN:", token?.slice(0, 20), token?.length);


      return { id: res.data.name, ...payload };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to add listing"
      );
    }
  }
);

export const updateListing = createAsyncThunk(
  "listings/updateListing",
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      const payload = normalizeListingPayload(data);

      await dbAPI.patch(`/listings/${id}.json`, payload, {
        params: { auth: token },
      });

      return { id, ...payload };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to update listing"
      );
    }
  }
);

export const deleteListing = createAsyncThunk(
  "listings/deleteListing",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      await dbAPI.delete(`/listings/${id}.json`, {
        params: { auth: token },
      });

      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to delete listing"
      );
    }
  }
);

const listingsSlice = createSlice({
  name: "listings",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearListingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch listings";
      })

      // add
      .addCase(addListing.pending, (state) => {
        state.error = null;
      })
      .addCase(addListing.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addListing.rejected, (state, action) => {
        state.error = action.payload || "Failed to add listing";
      })

      // update
      .addCase(updateListing.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })

      // delete
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l.id !== action.payload);
      });
  },
});

export const { clearListingsError } = listingsSlice.actions;
export default listingsSlice.reducer;
