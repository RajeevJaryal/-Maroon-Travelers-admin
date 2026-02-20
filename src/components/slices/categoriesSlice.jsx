import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dbAPI from "../../api/dbAPI";

/**
 * Categories slice (Admin)
 * - fetch categories (for dropdown)
 * - add / update / delete categories
 */

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      const res = await dbAPI.get("/categories.json", {
        params: { auth: token },
      });

      const data = res.data || {};
      // convert {id: {...}} into [{id, ...}]
      return Object.keys(data).map((id) => ({ id, ...data[id] }));
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to fetch categories"
      );
    }
  }
);

export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (name, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      const payload = {
        name: name.trim(),
        createdAt: Date.now(),
      };

      const res = await dbAPI.post("/categories.json", payload, {
        params: { auth: token },
      });

      return { id: res.data.name, ...payload };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to add category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, name }, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      const payload = { name: name.trim(), updatedAt: Date.now() };

      await dbAPI.patch(`/categories/${id}.json`, payload, {
        params: { auth: token },
      });

      return { id, ...payload };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().adminAuth.token;
      if (!token) return rejectWithValue("Please login first.");

      await dbAPI.delete(`/categories/${id}.json`, {
        params: { auth: token },
      });

      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || "Failed to delete category"
      );
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      })

      // add
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // update
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })

      // delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
