import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Availability from "./pages/Availability.jsx";
import Bookings from "./pages/Bookings.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import BookingConfirm from "./pages/BookingConfirm.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: "14px" } }}
      />
      <Routes>
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/booking-confirmed" element={<BookingConfirm />} />
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/availability"
          element={
            <Layout>
              <Availability />
            </Layout>
          }
        />
        <Route
          path="/bookings"
          element={
            <Layout>
              <Bookings />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
