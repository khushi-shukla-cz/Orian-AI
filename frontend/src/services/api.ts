import axios, { AxiosInstance, AxiosError } from "axios";
import toast from "react-hot-toast";
import type {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  CreateMvpWorkflowRequest,
  CreateMvpWorkflowResponse,
  GetMvpWorkflowResponse,
  ListMvpWorkflowsResponse,
  WorkflowDetailsResponse,
  SimulateWorkflowRequest,
  SimulateWorkflowResponse,
  Workflow,
  WorkflowMetrics,
} from "@/types";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "/api/v1",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      },
    );
  }

  private handleError(error: AxiosError): void {
    if (error.response) {
      const data = (error.response.data as any) || {};
      const validationMessage = Array.isArray(data.details)
        ? data.details[0]?.message
        : undefined;
      const message = validationMessage || data.error || "An error occurred";
      toast.error(message);
      console.error("API Error:", error.response.status, message);
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
      console.error("Network Error:", error.message);
    } else {
      toast.error("An unexpected error occurred");
      console.error("Error:", error.message);
    }
  }

  // Workflow endpoints
  async createWorkflow(
    data: CreateWorkflowRequest,
  ): Promise<CreateWorkflowResponse> {
    const response = await this.client.post<CreateWorkflowResponse>(
      "/workflows",
      data,
    );
    return response.data;
  }

  async getWorkflow(id: string): Promise<WorkflowDetailsResponse> {
    const response = await this.client.get<WorkflowDetailsResponse>(
      `/workflows/${id}`,
    );
    return response.data;
  }

  async listWorkflows(
    limit: number = 20,
  ): Promise<{ success: boolean; data: Workflow[] }> {
    const response = await this.client.get<{
      success: boolean;
      data: Workflow[];
    }>(`/workflows?limit=${limit}`);
    return response.data;
  }

  async getMetrics(
    id: string,
  ): Promise<{ success: boolean; data: WorkflowMetrics }> {
    const response = await this.client.get<{
      success: boolean;
      data: WorkflowMetrics;
    }>(`/workflows/${id}/metrics`);
    return response.data;
  }

  async simulateWorkflow(
    data: SimulateWorkflowRequest,
  ): Promise<SimulateWorkflowResponse> {
    const response = await this.client.post<SimulateWorkflowResponse>(
      "/workflows/simulate",
      data,
    );
    return response.data;
  }

  // MVP workflow endpoints
  async createMvpWorkflow(
    data: CreateMvpWorkflowRequest,
  ): Promise<CreateMvpWorkflowResponse> {
    const response = await this.client.post<CreateMvpWorkflowResponse>(
      "/mvp/workflows",
      data,
    );
    return response.data;
  }

  async listMvpWorkflows(
    limit: number = 20,
  ): Promise<ListMvpWorkflowsResponse> {
    const response = await this.client.get<ListMvpWorkflowsResponse>(
      `/mvp/workflows?limit=${limit}`,
    );
    return response.data;
  }

  async getMvpWorkflow(id: string): Promise<GetMvpWorkflowResponse> {
    const response = await this.client.get<GetMvpWorkflowResponse>(
      `/mvp/workflows/${id}`,
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
  }> {
    const response = await this.client.get<{
      success: boolean;
      message: string;
      timestamp: string;
    }>("/health");
    return response.data;
  }
}

export const apiService = new ApiService();
