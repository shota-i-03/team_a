import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Register } from "./pages/Register";
import { AuthCallback } from "./pages/AuthCallback";
import Home from "./pages/Home";
import GroupRegistration from "./pages/GroupRegistration";
import { Layout } from "./components/Layout";
import { ProfileSetup } from "./pages/ProfileSetup";
import { CompatibilityDiagnosis } from "./pages/CompatibilityDiagnosis";
import Survey from "./pages/Survey";
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/home" element={<Home />} />
          <Route path="/groups" element={<GroupRegistration />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/survey" element={<Survey />} />
          <Route
            path="/compatibility/:groupId"
            element={<CompatibilityDiagnosis />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
