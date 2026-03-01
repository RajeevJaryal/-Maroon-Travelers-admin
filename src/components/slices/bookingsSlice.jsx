// src/redux/bookingsSlice.jsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dbAPI from "../../api/dbAPI"; // adjust path if needed

// ✅ Create booking (writes to 2 places + rollback on fail)
export const createBooking = createAsyncThunk(
  "bookings/create",
  async ({ bookingData, idToken, userId }, { rejectWithValue }) => {
    try {
      const token = String(idToken || "").trim();
      if (!token) throw new Error("Please login to book");
      if (!userId) throw new Error("Missing userId");

      const payload = {
        ...bookingData,
        status: "pending",
        createdAt: Date.now(),
      };

      // 1) Save global booking (admin)
      const res = await dbAPI.post(`/bookings.json?auth=${token}`, payload);
      const bookingId = res.data.name;

      try {
        // 2) Save under user (order history)
        await dbAPI.put(
          `/bookingsByUser/${userId}/${bookingId}.json?auth=${token}`,
          payload
        );
      } catch (e) {
        // rollback global write if user write fails
        await dbAPI.delete(`/bookings/${bookingId}.json?auth=${token}`);
        throw e;
      }

      return { id: bookingId, ...payload };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);


// ✅ Fetch all bookings (Admin)
export const fetchAllBookings = createAsyncThunk(
  "bookings/fetchAll",
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const token = String(idToken || "").trim();
      if (!token) throw new Error("Missing token");

      const res = await dbAPI.get(`/bookings.json?auth=${token}`);
      const data = res.data;
      if (!data) return [];

      return Object.entries(data).map(([id, b]) => ({ id, ...b }));
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || e.message);
    }
  }
);


// ✅ Approve booking (Admin) - updates both paths
export const approveBooking = createAsyncThunk(
  "bookings/approve",
  async ({ bookingId, userId, idToken }, { rejectWithValue }) => {
    try {
      const token = String(idToken || "").trim();
      if (!token) throw new Error("Missing token");
      if (!bookingId) throw new Error("Missing bookingId");
      if (!userId) throw new Error("Missing userId");

      const updates = {
        status: "approved",
        approvedAt: Date.now(),
      };

      await dbAPI.patch(`/bookings/${bookingId}.json?auth=${token}`, updates);
      await dbAPI.patch(
        `/bookingsByUser/${userId}/${bookingId}.json?auth=${token}`,
        updates
      );

      return { bookingId, userId, updates };
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || e.message);
    }
  }
);

// ✅ Reject booking (Admin)
export const rejectBooking = createAsyncThunk(
  "bookings/reject",
  async ({ bookingId, userId, idToken, reason = "" }, { rejectWithValue }) => {
    try {
      const token = String(idToken || "").trim();
      if (!token) throw new Error("Missing token");
      if (!bookingId) throw new Error("Missing bookingId");
      if (!userId) throw new Error("Missing userId");

      const updates = {
        status: "rejected",
        rejectedAt: Date.now(),
        rejectReason: reason.trim() || "Rejected by admin",
      };

      await dbAPI.patch(`/bookings/${bookingId}.json?auth=${token}`, updates);
      await dbAPI.patch(
        `/bookingsByUser/${userId}/${bookingId}.json?auth=${token}`,
        updates
      );

      return { bookingId, userId, updates };
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || e.message);
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState: {
    items: [],
    loading: false,
    creating: false,
    updating: false,
    error: null,
    success: null,
    lastAction: null,
  },
  reducers: {
    clearBookingStatus: (state) => {
      state.error = null;
      state.success = null;
      state.lastAction = null;
    },
    clearBookings: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createBooking.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = null;
        state.lastAction = "create";
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.success = "Booking submitted ✅";
        state.items = [action.payload, ...state.items];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Booking failed";
      })


      // FETCH ALL
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load all bookings";
      })

      // APPROVE
      .addCase(approveBooking.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = null;
        state.lastAction = "approve";
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        state.updating = false;
        state.success = "Booking approved ✅";
        const { bookingId, updates } = action.payload;
        state.items = state.items.map((b) =>
          b.id === bookingId ? { ...b, ...updates } : b
        );
      })
      .addCase(approveBooking.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Approve failed";
      })

      // REJECT
      .addCase(rejectBooking.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = null;
        state.lastAction = "reject";
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.updating = false;
        state.success = "Booking rejected ✅";
        const { bookingId, updates } = action.payload;
        state.items = state.items.map((b) =>
          b.id === bookingId ? { ...b, ...updates } : b
        );
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Reject failed";
      });
  },
});

export const { clearBookingStatus, clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;