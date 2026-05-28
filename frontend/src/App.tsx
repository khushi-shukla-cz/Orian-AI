import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Dashboard } from "./pages/Dashboard";
import { MvpDashboard } from "./pages/MvpDashboard";
import { WorkflowDetails } from "./pages/WorkflowDetails";
import { socketService } from "./services/socket";

function App() {
  useEffect(() => {
    // Initialize Socket.IO connection
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MvpDashboard />} />
          <Route path="/legacy" element={<Dashboard />} />
          <Route path="/workflow/:id" element={<WorkflowDetails />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#1F2937",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
