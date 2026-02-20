import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "./AdminAuthSlice";
import categoriesReducer from "./categoriesSlice";
import listingsReducer from "./listingsSlice";
import bookingsReducer from "./BookingsSlice";
// Configure Redux store
const store = configureStore({
  reducer: {
    // Add all slices here
    adminAuth: adminAuthReducer,
    categories: categoriesReducer,
    listings: listingsReducer,
    bookings: bookingsReducer,

  },

  // DevTools automatically enabled in development
  devTools: import.meta.env.MODE !== "production",
});

export default store;
