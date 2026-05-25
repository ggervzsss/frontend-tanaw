import { apiClient } from "../lib/apiClient";
import type { ReportEnterprise } from "../types";

export async function listReportEnterprises() {
  const response = await apiClient.get<ReportEnterprise[]>("/operational/reports/enterprises");
  return response.data;
}
