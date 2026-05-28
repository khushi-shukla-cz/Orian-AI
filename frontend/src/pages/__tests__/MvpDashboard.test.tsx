import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock the apiService
vi.mock("@/services/api", () => ({
  apiService: {
    listMvpWorkflows: vi.fn(() => Promise.resolve({ success: true, data: [] })),
    createMvpWorkflow: vi.fn(() =>
      Promise.resolve({
        success: true,
        data: { id: "1", name: "Test", status: "pending" },
      }),
    ),
    getMvpWorkflow: vi.fn(() =>
      Promise.resolve({
        success: true,
        data: {
          id: "1",
          name: "Test",
          input: "do something",
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          logs: [],
        },
      }),
    ),
  },
}));

import { MvpDashboard } from "../MvpDashboard";

describe("MvpDashboard", () => {
  it("renders title and empty state", async () => {
    render(
      <BrowserRouter>
        <MvpDashboard />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Orion AI MVP/i)).toBeInTheDocument();

    // Wait for the mocked list to resolve and show empty state
    await waitFor(() => {
      expect(screen.getByText(/No MVP workflows yet./i)).toBeInTheDocument();
    });
  });
});
