import "./SplashCursor.css";
import "./App.css";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";

import SplashCursor from "./SplashCursor";
import LoginPage from "./components/LoginSection/LoginPage/LoginPage";
import HeaderSection from "./components/LoginSection/Header/HeaderSection";
import AddListing from "./components/addingProduct/AddListing";
import ListingsPage from "./components/pages/ListingsPage";
import ProtectedAdminRoute from "./components/routes/ProtectedAdminRoute";

import { restoreAdminSession } from "./components/slices/AdminAuthSlice";

function App() {
  const dispatch = useDispatch();
  const { authChecked } = useSelector((s) => s.adminAuth);

  useEffect(() => {
    if (authChecked) return;
    dispatch(restoreAdminSession());
  }, [dispatch, authChecked]);

  if (!authChecked) return null; // wait until session restored

  return (
    <div className="app-background">
      <SplashCursor />
      <HeaderSection />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Admin */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/add-listing" element={<AddListing />} />
          <Route path="/admin/listings" element={<ListingsPage />} />
        </Route>

        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </div>
  );
}

export default App;
