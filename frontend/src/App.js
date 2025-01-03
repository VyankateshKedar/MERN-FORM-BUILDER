import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./layouts/LandingPage/LandingPage.jsx";
import SignIn from "./layouts/Auth/SignIn.jsx";
import SignUp from "./layouts/Auth/SignUp.jsx";
import Dashboard from "./layouts/Dashboard/Dashboard.jsx";
import Settings from "./layouts/Setting/Settings.jsx";
import FolderView from "./layouts/ViewFolder/FolderView.jsx";
import Workspace from "./layouts/Workspace/workspace.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/folder/:folderName" element={<FolderView />} />

        {/* Capital 'W' to match navigate(`/Workspace/...`) */}
        <Route path="/Workspace/:folderName" element={<Workspace />} />
      </Routes>
    </Router>
  );
}

export default App;
