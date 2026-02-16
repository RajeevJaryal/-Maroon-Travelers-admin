// src/redux/slices/adminAuthSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAPI from "../../api/authAPI";
import dbAPI from "../../api/dbAPI";

/**
 *  What this slice does:
 * 1) Logs in admin using Firebase Auth REST API (Email/Password)
 * 2) After login, verifies admin permission by checking: /admins/{uid}.json
 * 3) If admin exists → saves session in localStorage
 * 4) Restores session on page refresh (if token not expired)
 */

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const STORAGE_KEY = "adminAuth";

/* ---------------------------------------------
   Small helper functions 
--------------------------------------------- */

// Parse JSON safely (so app doesn't crash if storage has bad data)
const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// Read stored session and make sure it’s still valid
const getStoredSession = () => {
  const stored = safeParse(localStorage.getItem(STORAGE_KEY));

  // If nothing stored or missing required fields → no session
  if (!stored?.token || !stored?.expiresAt) return null;

  // If token expired → clear it and treat as logged out
  if (Date.now() >= stored.expiresAt) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return stored;
};

// Save session to localStorage (so refresh keeps user logged in)
const saveSession = (session) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

// Clear session (used during logout or when unauthorized)
const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/* ---------------------------------------------
   Thunks (async actions)
--------------------------------------------- */

// Admin Login + Admin Permission Check
export const loginAdmin = createAsyncThunk(
  "adminAuth/loginAdmin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      if (!API_KEY) {
        return rejectWithValue("Missing VITE_FIREBASE_API_KEY in .env");
      }

      const res = await authAPI.post(
        `/accounts:signInWithPassword?key=${API_KEY}`,
        { email, password, returnSecureToken: true }
      );

      const { idToken, localId, expiresIn } = res.data;

      // Admin check with auth token (fixes 401)
      const adminCheck = await dbAPI.get(`/admins/${localId}.json`, {
        params: { auth: idToken },
      });

      if (!adminCheck.data) {
        return rejectWithValue("Access denied: you are not an admin.");
      }

      const expiresAt = Date.now() + Number(expiresIn) * 1000;

      const session = {
        token: idToken,
        uid: localId,
        email: adminCheck.data?.email || email,
        isAdmin: true,
        expiresAt,
      };

      saveSession(session);
      return session;
    } catch (err) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Login failed. Please try again.";

      return rejectWithValue(message);
    }
  }
);

//  Restore admin session (run on app start)
export const restoreAdminSession = createAsyncThunk(
  "adminAuth/restoreAdminSession",
  async (_, { rejectWithValue }) => {
    const stored = getStoredSession();

    if (!stored) {
      return rejectWithValue("No valid session found");
    }

    return stored;
  }
);

/* ---------------------------------------------
   Slice
--------------------------------------------- */

const stored = getStoredSession();

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    // auth data
    token: stored?.token || null,
    uid: stored?.uid || null,
    email: stored?.email || null,
    isAdmin: stored?.isAdmin || false,
    expiresAt: stored?.expiresAt || null,

    // ui states
    loading: false,
    error: null,

    // helps prevent UI flicker on reload
    authChecked: !!stored,
  },
  reducers: {
    // 🚪 Logout admin
    logoutAdmin: (state) => {
      state.token = null;
      state.uid = null;
      state.email = null;
      state.isAdmin = false;
      state.expiresAt = null;

      state.loading = false;
      state.error = null;
      state.authChecked = true;

      clearSession();
    },

    // Clear error message (use when user starts typing again)
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------------- LOGIN ---------------- */
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.token = action.payload.token;
        state.uid = action.payload.uid;
        state.email = action.payload.email;
        state.isAdmin = true;
        state.expiresAt = action.payload.expiresAt;
        console.log("logged in");
        state.authChecked = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";

        // clear state if login not allowed
        state.token = null;
        state.uid = null;
        state.email = null;
        state.isAdmin = false;
        state.expiresAt = null;

        state.authChecked = true;

        clearSession();
      })

      /* ------------- RESTORE SESSION ------------- */
      .addCase(restoreAdminSession.pending, (state) => {
        // Not mandatory, but nice UI behavior during restore
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreAdminSession.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.token = action.payload.token;
        state.uid = action.payload.uid;
        state.email = action.payload.email;
        state.isAdmin = !!action.payload.isAdmin;
        state.expiresAt = action.payload.expiresAt;

        state.authChecked = true;
      })
      .addCase(restoreAdminSession.rejected, (state) => {
        state.loading = false;
        state.authChecked = true;
      });
  },
});

export const { logoutAdmin, clearAuthError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
