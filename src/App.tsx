import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import TestCreatePage from "./pages/TestCreate/TestCreatePage";
import QuestionCreationPage from "./pages/QuestionCreation/QuestionCreationPage";
import ConfirmationPage from "./pages/Confirmation/ConfirmationPage";
import TestTrackingPage from "./pages/TestTracking/TestTrackingPage";
import TestViewPage from "./pages/TestView/TestViewPage";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tests/new" element={<TestCreatePage />} />
          <Route path="/tests/:testId/edit" element={<TestCreatePage />} />
          <Route
            path="/tests/:testId/questions"
            element={<QuestionCreationPage />}
          />
          <Route
            path="/tests/:testId/publish"
            element={<ConfirmationPage />}
          />
          <Route path="/test-tracking" element={<TestTrackingPage />} />
          <Route path="/tests/:testId/view" element={<TestViewPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}