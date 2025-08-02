import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inventory from "./pages/Inventory";
import AdminApp from "./admin";
import Uploads from "./pages/upload"
import Edit from "./pages/edit";
import Log from "./pages/log";
import Login from "./login";
function App() {
  return (
    <Router>
      <Routes>
        {/* Admin layout with nested pages at the root */}
        
        <Route path="/" element={<Login />} />
        <Route path="admin" element={<AdminApp />}>
          <Route index element={<Uploads />} />
          <Route path="upload" element={<Uploads />} />
          <Route path="edit" element={<Edit />} />
            <Route path="inventory" element={<Inventory />} />

          <Route path="log" element={<Log />} />
        </Route>
                <Route path="/edit/:batchId" element={<Edit />} />
      </Routes>
    </Router>
  );
}

export default App;
