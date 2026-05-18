export type EnterpriseStatus = "Normal" | "Warning" | "Critical";
export type CameraStatus = "Online" | "Offline" | "Unstable";
export type GatewayStatus = "Connected" | "Sync Delayed" | "Offline" | "Not Linked";
export type AlertSeverity = "Info" | "Warning" | "Critical";
export type AuditEvent = "Generate" | "Update" | "Error" | "Login" | "Export" | "Query" | "Submit";
export type AuditRole = "System" | "IT Personnel" | "Enterprise" | "Staff" | "Admin";
export type AlertStatus = "Active" | "IT Notified" | "Resolved";

export type MapEnterprise = {
  id: number;
  name: string;
  barangay: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  visitorCount: number;
  status: EnterpriseStatus;
  topSegment: string;
  localVisitors: number;
  nonLocalVisitors: number;
  maleVisitors: number;
  femaleVisitors: number;
  totalTourists: number;
};

export type CameraNode = {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  name: string;
  status: CameraStatus;
  connectivity: number;
  fps: number;
  latencyMs: number;
  lastChecked: string;
};

export type Enterprise = {
  id: string;
  enterpriseName: string;
  barangay: string;
  status: "Active" | "Archived";
  category: string;
  gatewayStatus: GatewayStatus;
  pendingSync: number;
};

export type TechnicalLog = {
  id: string;
  severity: AlertSeverity;
  eventType: string;
  enterprise?: string;
  device?: string;
  desc: string;
  performedBy: string;
  time: string;
};

export type PipelineAlert = {
  id: string;
  severity: AlertSeverity;
  device: string;
  msg: string;
  status: "New" | "Acknowledged" | "Resolved";
  time: string;
};

export type PipelineHealth = {
  enterpriseId: string;
  name: string;
  barangay: string;
  gatewayStatus: GatewayStatus;
  cameraFeed: {
    activeCams: number;
    totalCams: number;
  };
  warnings: PipelineAlert[];
};

export type AnalyticsPeriod = "October 2023" | "September 2023";

export type AnalyticsPeriodData = {
  entries: string;
  trend: string;
  unique: string;
  compliance: string;
  complianceRate: string;
  utilization: string;
  chartData: {
    name: string;
    entries: number;
    unique: number;
  }[];
};

export type AuditLog = {
  id: number;
  time: string;
  user: string;
  role: AuditRole;
  module: string;
  event: AuditEvent;
  desc: string;
  hashId: string;
  ip: string;
  sessionId: string;
  userAgent: string;
  payload: Record<string, unknown>;
  prevState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
};

export type SystemAlert = {
  id: string;
  type: string;
  enterprise: string;
  severity: AlertSeverity;
  timestamp: string;
  status: AlertStatus;
  desc: string;
};

export type ReportStatus = "Pending Review" | "Ready to Consolidate" | "Returned" | "Consolidated" | "Missing";
export type FinalReportStatus = "Draft" | "Approved" | "Archived";
export type LguAccountRoleLabel = "Admin" | "IT Personnel" | "LGU Staff";
export type LguAccountStatus = "Active" | "Inactive" | "Suspended";
export type EnterpriseAccountStatus = "Active" | "Archived" | "Suspended";

export type LguAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: LguAccountRoleLabel;
  status: LguAccountStatus;
  department: string;
  phone: string;
  lastLogin: string;
  createdAt: string;
};

export type EnterpriseCamera = {
  id: string;
  name: string;
  location: string;
  rtspStatus: string;
  onvifStatus: string;
  status: CameraStatus;
  lastChecked: string;
};

export type EnterpriseAccount = {
  id: string;
  enterpriseName: string;
  category: string;
  managerName: string;
  email: string;
  contactNumber: string;
  barangay: string;
  address: string;
  gatewayStatus: GatewayStatus;
  gatewayId?: string;
  accountStatus: EnterpriseAccountStatus;
  lastSync: string;
  cameras: EnterpriseCamera[];
};

export type IntakeReport = {
  id: string;
  enterpriseId: string;
  enterprise: string;
  category: string;
  barangay: string;
  month: string;
  period: string;
  submitted: string;
  status: ReportStatus;
  code: string;
  remarks?: string;
  metrics: {
    entry: number;
    exit: number;
    unique: number;
    peak: string;
  };
};

export type ReportEnterprise = {
  id: string;
  name: string;
  category: string;
  barangay: string;
  complianceOwner: string;
};

export type FinalReportSource = {
  id: string;
  enterprise: string;
  code: string;
  unique: number;
  entry: number;
  exit: number;
};

export type FinalReport = {
  id: string;
  title: string;
  period: string;
  generatedOn: string;
  preparedBy: string;
  preparedRole: string;
  status: FinalReportStatus;
  totalEntry: number;
  totalExit: number;
  totalUnique: number;
  enterpriseCount: number;
  sources: FinalReportSource[];
};
