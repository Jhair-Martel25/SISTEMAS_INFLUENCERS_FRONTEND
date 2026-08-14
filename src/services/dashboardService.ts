import { apiClient } from "@/services/api";
import { DashboardMetricas } from "@/types/dashboard";

export const dashboardService = {
  async obtenerMetricas(): Promise<DashboardMetricas> {
    return apiClient.get<DashboardMetricas>("/dashboard/metricas");
  },
};