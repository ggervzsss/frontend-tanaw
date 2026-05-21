import type {
  AnalyticsPeriod,
  AnalyticsPeriodData,
  AuditLog,
  CameraNode,
  Enterprise,
  EnterpriseAccount,
  FinalReport,
  IntakeReport,
  LguAccount,
  MapEnterprise,
  PipelineHealth,
  ReportEnterprise,
  SystemAlert,
  TechnicalLog,
} from "../types";

export const mapEnterprises: MapEnterprise[] = [
  {
    id: 101,
    name: "Lolo Uweng Shrine / San Vicente Ferrer Parish Church",
    barangay: "Landayan",
    type: "Faith Tourism",
    address: "Landayan Road, Barangay Landayan",
    lat: 14.3439,
    lng: 121.0567,
    visitorCount: 1840,
    status: "Warning",
    topSegment: "Pilgrims",
    localVisitors: 1120,
    nonLocalVisitors: 720,
    maleVisitors: 790,
    femaleVisitors: 1050,
    totalTourists: 980,
  },
  {
    id: 102,
    name: "Archies",
    barangay: "Narra",
    type: "Dining",
    address: "Narra Road, Barangay Narra",
    lat: 14.3367,
    lng: 121.0472,
    visitorCount: 740,
    status: "Normal",
    topSegment: "Families",
    localVisitors: 520,
    nonLocalVisitors: 220,
    maleVisitors: 330,
    femaleVisitors: 410,
    totalTourists: 240,
  },
  {
    id: 103,
    name: "San Pedro Town Center",
    barangay: "Poblacion",
    type: "Retail",
    address: "National Highway, Barangay Poblacion",
    lat: 14.3595,
    lng: 121.0501,
    visitorCount: 2305,
    status: "Critical",
    topSegment: "Shoppers",
    localVisitors: 1575,
    nonLocalVisitors: 730,
    maleVisitors: 1040,
    femaleVisitors: 1265,
    totalTourists: 620,
  },
  {
    id: 104,
    name: "SPL Public Market",
    barangay: "Poblacion",
    type: "Public Market",
    address: "Mabini Street, Barangay Poblacion",
    lat: 14.362,
    lng: 121.048,
    visitorCount: 3105,
    status: "Warning",
    topSegment: "Residents",
    localVisitors: 2560,
    nonLocalVisitors: 545,
    maleVisitors: 1510,
    femaleVisitors: 1595,
    totalTourists: 210,
  },
  {
    id: 105,
    name: "Plaza Pacita Commercial Hub",
    barangay: "Pacita I",
    type: "Transport",
    address: "Pacita Avenue, Barangay Pacita I",
    lat: 14.3412,
    lng: 121.0453,
    visitorCount: 2100,
    status: "Normal",
    topSegment: "Commuters",
    localVisitors: 1490,
    nonLocalVisitors: 610,
    maleVisitors: 1065,
    femaleVisitors: 1035,
    totalTourists: 360,
  },
  {
    id: 106,
    name: "Pacita Complex Activity Center",
    barangay: "Pacita II",
    type: "Community Venue",
    address: "Pacita Complex, Barangay Pacita II",
    lat: 14.3379,
    lng: 121.0435,
    visitorCount: 1260,
    status: "Normal",
    topSegment: "Families",
    localVisitors: 935,
    nonLocalVisitors: 325,
    maleVisitors: 590,
    femaleVisitors: 670,
    totalTourists: 280,
  },
  {
    id: 107,
    name: "Lakeside Park",
    barangay: "Cuyab",
    type: "Outdoor Recreation",
    address: "Cuyab Lakeside Access Road",
    lat: 14.3651,
    lng: 121.0556,
    visitorCount: 920,
    status: "Warning",
    topSegment: "Tourists",
    localVisitors: 465,
    nonLocalVisitors: 455,
    maleVisitors: 425,
    femaleVisitors: 495,
    totalTourists: 580,
  },
  {
    id: 108,
    name: "Boundary Gateway",
    barangay: "San Antonio",
    type: "Transport",
    address: "San Pedro Boundary, Barangay San Antonio",
    lat: 14.3497,
    lng: 121.0138,
    visitorCount: 3500,
    status: "Normal",
    topSegment: "Commuters",
    localVisitors: 1940,
    nonLocalVisitors: 1560,
    maleVisitors: 1805,
    femaleVisitors: 1695,
    totalTourists: 710,
  },
];

export const enterpriseCameras: CameraNode[] = [
  {
    id: "CAM-01",
    enterpriseId: "E1",
    enterpriseName: "Archies Diner & Resort",
    name: "Main Gate",
    status: "Online",
    connectivity: 97.2,
    fps: 30.2,
    latencyMs: 42,
    lastChecked: "May 14, 2026 08:14 AM",
  },
  { id: "CAM-02", enterpriseId: "E1", enterpriseName: "Archies Diner & Resort", name: "Lobby", status: "Online", connectivity: 94.5, fps: 28.7, latencyMs: 48, lastChecked: "May 14, 2026 08:13 AM" },
  {
    id: "CAM-03",
    enterpriseId: "E1",
    enterpriseName: "Archies Diner & Resort",
    name: "Pool Deck",
    status: "Unstable",
    connectivity: 58.3,
    fps: 11.2,
    latencyMs: 212,
    lastChecked: "May 14, 2026 08:09 AM",
  },
  {
    id: "CAM-05",
    enterpriseId: "E2",
    enterpriseName: "San Pedro Heritage Hotel",
    name: "Heritage Gate",
    status: "Offline",
    connectivity: 0,
    fps: 0,
    latencyMs: 0,
    lastChecked: "May 14, 2026 07:52 AM",
  },
  {
    id: "CAM-07",
    enterpriseId: "E2",
    enterpriseName: "San Pedro Heritage Hotel",
    name: "Rooftop Terrace",
    status: "Unstable",
    connectivity: 44.1,
    fps: 8.3,
    latencyMs: 390,
    lastChecked: "May 14, 2026 07:59 AM",
  },
  {
    id: "CAM-08",
    enterpriseId: "E3",
    enterpriseName: "Laguna Eco-Resort",
    name: "Nature Trail Entry",
    status: "Online",
    connectivity: 96.8,
    fps: 29.4,
    latencyMs: 51,
    lastChecked: "May 14, 2026 08:12 AM",
  },
];

export const enterprises: Enterprise[] = [
  { id: "E1", enterpriseName: "Archies Diner & Resort", barangay: "San Vicente", status: "Active", category: "Resort", gatewayStatus: "Sync Delayed", pendingSync: 34 },
  { id: "E2", enterpriseName: "San Pedro Heritage Hotel", barangay: "Poblacion", status: "Active", category: "Hotel", gatewayStatus: "Offline", pendingSync: 118 },
  { id: "E3", enterpriseName: "Laguna Eco-Resort", barangay: "Cuyab", status: "Active", category: "Tourist Site", gatewayStatus: "Connected", pendingSync: 0 },
  { id: "E4", enterpriseName: "Poblacion Night Market", barangay: "Poblacion", status: "Archived", category: "Commercial", gatewayStatus: "Not Linked", pendingSync: 0 },
];

export const lguAccounts: LguAccount[] = [
  {
    id: "LGU-001",
    firstName: "Ricardo",
    lastName: "Del Rosario",
    email: "ricardo.admin@tanaw.gov.ph",
    role: "Admin",
    status: "Active",
    department: "City Tourism Office",
    phone: "+63 917 100 1122",
    lastLogin: "May 18, 2026 08:31 AM",
    createdAt: "Jan 15, 2026",
  },
  {
    id: "LGU-002",
    firstName: "Mike",
    lastName: "Santos",
    email: "mike.it@tanaw.gov.ph",
    role: "IT Personnel",
    status: "Active",
    department: "Management Information Systems",
    phone: "+63 917 200 3344",
    lastLogin: "May 18, 2026 09:12 AM",
    createdAt: "Jan 22, 2026",
  },
  {
    id: "LGU-003",
    firstName: "Juan",
    lastName: "Reyes",
    email: "juan.staff@tanaw.gov.ph",
    role: "LGU Staff",
    status: "Active",
    department: "Tourism Processing Division",
    phone: "+63 917 300 5566",
    lastLogin: "May 18, 2026 07:45 AM",
    createdAt: "Feb 03, 2026",
  },
  {
    id: "LGU-004",
    firstName: "Ana",
    lastName: "Cruz",
    email: "ana.audit@tanaw.gov.ph",
    role: "LGU Staff",
    status: "Inactive",
    department: "Report Audit Desk",
    phone: "+63 917 400 7788",
    lastLogin: "May 10, 2026 04:02 PM",
    createdAt: "Feb 19, 2026",
  },
  {
    id: "LGU-005",
    firstName: "Marco",
    lastName: "Villanueva",
    email: "marco.support@tanaw.gov.ph",
    role: "IT Personnel",
    status: "Suspended",
    department: "Field Support",
    phone: "+63 917 500 9900",
    lastLogin: "May 07, 2026 11:17 AM",
    createdAt: "Mar 04, 2026",
  },
];

export const enterpriseAccounts: EnterpriseAccount[] = [
  {
    id: "EA-001",
    enterpriseName: "Archies Diner & Resort",
    category: "Resort",
    managerName: "Lara Mendoza",
    email: "operations@archies.example",
    contactNumber: "+63 49 555 0101",
    barangay: "San Vicente",
    address: "San Vicente Tourism Strip, San Pedro",
    gatewayStatus: "Sync Delayed",
    gatewayId: "GW-ARCHIES-01",
    accountStatus: "Active",
    lastSync: "May 18, 2026 08:40 AM",
    cameras: [
      { id: "CAM-01", name: "Main Gate", location: "Entrance Gate", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:43 AM" },
      { id: "CAM-02", name: "Lobby", location: "Lobby Hall", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:42 AM" },
      { id: "CAM-03", name: "Pool Deck", location: "Outdoor Pool", rtspStatus: "Degraded", onvifStatus: "Reachable", status: "Unstable", lastChecked: "May 18, 2026 08:39 AM" },
    ],
  },
  {
    id: "EA-002",
    enterpriseName: "San Pedro Heritage Hotel",
    category: "Hotel",
    managerName: "Elena Torres",
    email: "frontdesk@heritage.example",
    contactNumber: "+63 49 555 0102",
    barangay: "Poblacion",
    address: "Rizal Avenue, Barangay Poblacion",
    gatewayStatus: "Offline",
    gatewayId: "GW-HERITAGE-02",
    accountStatus: "Active",
    lastSync: "May 18, 2026 07:52 AM",
    cameras: [
      { id: "CAM-05", name: "Heritage Gate", location: "Front Entrance", rtspStatus: "Timeout", onvifStatus: "Unreachable", status: "Offline", lastChecked: "May 18, 2026 07:52 AM" },
      { id: "CAM-07", name: "Rooftop Terrace", location: "Roof Deck", rtspStatus: "Connected", onvifStatus: "Intermittent", status: "Unstable", lastChecked: "May 18, 2026 07:59 AM" },
    ],
  },
  {
    id: "EA-003",
    enterpriseName: "Laguna Eco-Resort",
    category: "Tourist Site",
    managerName: "Noel Aquino",
    email: "admin@lagunaeco.example",
    contactNumber: "+63 49 555 0103",
    barangay: "Cuyab",
    address: "Cuyab Lakeside Access Road",
    gatewayStatus: "Connected",
    gatewayId: "GW-ECO-03",
    accountStatus: "Active",
    lastSync: "May 18, 2026 08:45 AM",
    cameras: [{ id: "CAM-08", name: "Nature Trail Entry", location: "Trail Entrance", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:44 AM" }],
  },
  {
    id: "EA-004",
    enterpriseName: "Poblacion Night Market",
    category: "Commercial",
    managerName: "Rina De Leon",
    email: "marketdesk@poblacion.example",
    contactNumber: "+63 49 555 0104",
    barangay: "Poblacion",
    address: "Old Municipal Road, Poblacion",
    gatewayStatus: "Not Linked",
    accountStatus: "Archived",
    lastSync: "No active gateway",
    cameras: [],
  },
  {
    id: "EA-005",
    enterpriseName: "Boundary Gateway Transit Hub",
    category: "Transport",
    managerName: "Paolo Navarro",
    email: "ops@boundaryhub.example",
    contactNumber: "+63 49 555 0105",
    barangay: "San Antonio",
    address: "San Pedro Boundary Road, San Antonio",
    gatewayStatus: "Connected",
    gatewayId: "GW-TRANSIT-05",
    accountStatus: "Suspended",
    lastSync: "May 18, 2026 08:35 AM",
    cameras: [{ id: "CAM-11", name: "Terminal Gate", location: "Passenger Entry", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:35 AM" }],
  },
];

export const pipelineHealth: PipelineHealth[] = [
  {
    enterpriseId: "E1",
    name: "Archies Diner & Resort",
    barangay: "San Vicente",
    gatewayStatus: "Sync Delayed",
    cameraFeed: { activeCams: 2, totalCams: 3 },
    warnings: [
      { id: "ALERT-001", severity: "Warning", device: "CAM-03", msg: "Pool Deck camera has high occlusion and reduced detection confidence.", status: "New", time: "May 14, 2026 08:09 AM" },
      { id: "ALERT-002", severity: "Warning", device: "GW-ARCHIES-01", msg: "Gateway has 34 records pending cloud sync.", status: "Acknowledged", time: "May 14, 2026 07:40 AM" },
    ],
  },
  {
    enterpriseId: "E2",
    name: "San Pedro Heritage Hotel",
    barangay: "Poblacion",
    gatewayStatus: "Offline",
    cameraFeed: { activeCams: 0, totalCams: 2 },
    warnings: [
      { id: "ALERT-003", severity: "Critical", device: "CAM-05", msg: "Heritage Gate camera is offline and has failed RTSP testing.", status: "New", time: "May 14, 2026 07:52 AM" },
      { id: "ALERT-004", severity: "Warning", device: "CAM-07", msg: "Rooftop Terrace camera is online but unstable.", status: "New", time: "May 14, 2026 07:59 AM" },
    ],
  },
  {
    enterpriseId: "E3",
    name: "Laguna Eco-Resort",
    barangay: "Cuyab",
    gatewayStatus: "Connected",
    cameraFeed: { activeCams: 1, totalCams: 1 },
    warnings: [],
  },
];

export const technicalLogs: TechnicalLog[] = [
  {
    id: "LOG-001",
    severity: "Critical",
    eventType: "Camera",
    enterprise: "San Pedro Heritage Hotel",
    device: "CAM-05",
    desc: "Camera CAM-05 went offline after repeated RTSP connection timeouts.",
    performedBy: "System monitor",
    time: "2m ago",
  },
  {
    id: "LOG-002",
    severity: "Warning",
    eventType: "Sync",
    enterprise: "Archies Diner & Resort",
    device: "GW-ARCHIES-01",
    desc: "Gateway sync delayed. 34 local records are waiting for upload.",
    performedBy: "Sync service",
    time: "15m ago",
  },
  { id: "LOG-003", severity: "Info", eventType: "Account", desc: "New LGU Staff account created for Ana Reyes.", performedBy: "Mike Santos", time: "1h ago" },
  {
    id: "LOG-004",
    severity: "Warning",
    eventType: "Camera",
    enterprise: "Archies Diner & Resort",
    device: "CAM-03",
    desc: "High occlusion and low FPS detected on Pool Deck camera.",
    performedBy: "Camera health check",
    time: "1h ago",
  },
];

export const analyticsPeriods: Record<AnalyticsPeriod, AnalyticsPeriodData> = {
  "October 2023": {
    entries: "184,205",
    trend: "+12% vs last period",
    unique: "92,100",
    compliance: "45 / 50",
    complianceRate: "90% Submission Rate",
    utilization: "78%",
    chartData: [
      { name: "SPL Market", entries: 4520, unique: 3100 },
      { name: "Plaza Mall", entries: 12500, unique: 8900 },
      { name: "City Hall", entries: 1200, unique: 950 },
      { name: "Town Center", entries: 800, unique: 750 },
      { name: "Public Library", entries: 540, unique: 400 },
    ],
  },
  "September 2023": {
    entries: "164,468",
    trend: "+5% vs last period",
    unique: "82,230",
    compliance: "48 / 50",
    complianceRate: "96% Submission Rate",
    utilization: "72%",
    chartData: [
      { name: "SPL Market", entries: 4100, unique: 2900 },
      { name: "Plaza Mall", entries: 11200, unique: 8100 },
      { name: "City Hall", entries: 1050, unique: 850 },
      { name: "Town Center", entries: 450, unique: 400 },
      { name: "Public Library", entries: 200, unique: 150 },
    ],
  },
};

const baseAuditLogs = [
  {
    id: 1,
    time: "2026-05-13 11:10:05 AM",
    user: "system",
    role: "System",
    module: "Analytics",
    event: "Generate",
    desc: "Automated hourly visitor aggregation completed.",
  },
  {
    id: 2,
    time: "2026-05-13 11:05:22 AM",
    user: "jdelacruz (IT)",
    role: "IT Personnel",
    module: "Camera Config",
    event: "Update",
    desc: "Updated RTSP stream URL and frame rate for Boundary Gateway - Cam 01.",
  },
  {
    id: 3,
    time: "2026-05-13 10:50:11 AM",
    user: "ent_pacita",
    role: "Enterprise",
    module: "Auth",
    event: "Error",
    desc: "Failed login attempt. Invalid credentials provided.",
  },
  {
    id: 4,
    time: "2026-05-13 10:48:00 AM",
    user: "ent_pacita",
    role: "Enterprise",
    module: "Auth",
    event: "Login",
    desc: "Successful login from IP 112.204.15.88.",
  },
  {
    id: 5,
    time: "2026-05-13 10:30:45 AM",
    user: "msantos (Staff)",
    role: "Staff",
    module: "Reports",
    event: "Export",
    desc: "Exported Weekly Tourism Report (May W2) as PDF.",
  },
  {
    id: 6,
    time: "2026-05-13 10:15:30 AM",
    user: "admin_super",
    role: "Admin",
    module: "Ledger",
    event: "Query",
    desc: "Queried Enterprise Performance Ledger for Lakeside Park.",
  },
  {
    id: 7,
    time: "2026-05-13 09:45:22 AM",
    user: "jdelacruz (IT)",
    role: "IT Personnel",
    module: "Camera Config",
    event: "Update",
    desc: "IT Personnel updated RTSP stream URL for Enterprise A - Cam 02.",
  },
  {
    id: 8,
    time: "2026-05-13 09:30:00 AM",
    user: "ent_lakeside",
    role: "Enterprise",
    module: "Reports",
    event: "Submit",
    desc: "Enterprise Lakeside Park submitted Weekly Compliance Report.",
  },
] satisfies Array<Omit<AuditLog, "hashId" | "ip" | "sessionId" | "userAgent" | "payload" | "prevState" | "newState">>;

export const auditLogs: AuditLog[] = baseAuditLogs.map((log) => {
  const hashId = `EVT-${log.time.replace(/[^0-9]/g, "").substring(0, 8)}-${log.id.toString().padStart(4, "0")}`;
  const isUpdate = log.event === "Update";
  const isAuth = log.event === "Login" || log.event === "Error";

  return {
    ...log,
    hashId,
    ip: log.user === "system" ? "127.0.0.1" : `112.204.${(31 + log.id * 17) % 255}.${(80 + log.id * 19) % 255}`,
    sessionId: log.user === "system" ? "SYS-DAEMON-X" : `SESS-${hashId.slice(-6)}`,
    userAgent: log.user === "system" ? "TANAW-Core-Service/2.0" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TANAW-Portal/1.0",
    payload: isUpdate
      ? { action: "modify_configuration", target_module: log.module, execution_ms: 142 }
      : isAuth
        ? { auth_method: "jwt_token", provider: "internal_db", attempts: log.event === "Error" ? 5 : 1 }
        : { report_type: "tourism_census", attached_files: 1, signature: "verified" },
    prevState: isUpdate ? { status: "active", version: "1.0.0", flags: ["legacy_config"] } : null,
    newState: isUpdate ? { status: "active", version: "1.0.1", flags: ["optimized_stream"] } : null,
  };
});

export const systemAlerts: SystemAlert[] = [
  {
    id: "ALRT-901",
    type: "Overcrowding Breach",
    enterprise: "San Pedro Town Center",
    severity: "Critical",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: "Active",
    desc: "Occupancy exceeded 90% hard threshold. Security mobilization recommended.",
  },
  {
    id: "ALRT-902",
    type: "Camera Offline",
    enterprise: "Boundary Gateway",
    severity: "Warning",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: "Active",
    desc: "RTSP stream dropped for Cam 01. Video analytics suspended.",
  },
  {
    id: "ALRT-903",
    type: "Visitor Surge",
    enterprise: "Lakeside Park",
    severity: "Warning",
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    status: "IT Notified",
    desc: "Sudden 40% increase in entry rate within 10 minutes. Monitoring required.",
  },
  {
    id: "ALRT-904",
    type: "Database Sync Delay",
    enterprise: "Plaza Pacita Hub",
    severity: "Info",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    status: "Resolved",
    desc: "Edge node cache failed to sync to central cloud. Auto-resolved via redundant path.",
  },
];

export const reportEnterprises: ReportEnterprise[] = [
  { id: "ENT-001", name: "SPL Market Branch", category: "Commercial", barangay: "Poblacion", complianceOwner: "A. Santos" },
  { id: "ENT-002", name: "Plaza Mall San Pedro", category: "Commercial", barangay: "San Antonio", complianceOwner: "M. Garcia" },
  { id: "ENT-003", name: "City Hall Lobby", category: "Government", barangay: "Poblacion", complianceOwner: "R. Cruz" },
  { id: "ENT-004", name: "Town Center Park", category: "Recreational", barangay: "San Vicente", complianceOwner: "L. Mendoza" },
  { id: "ENT-005", name: "SPL Public Library", category: "Government", barangay: "Poblacion", complianceOwner: "J. Reyes" },
];

const REPORT_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type ReportTimelinePeriod = {
  month: string;
  monthIndex: number;
  period: string;
  shortMonth: string;
  year: number;
};

const ARCHIVED_REPORT_METRICS: IntakeReport["metrics"][] = [
  { entry: 4100, exit: 4060, unique: 2900, peak: "10:30 AM" },
  { entry: 11200, exit: 11110, unique: 8100, peak: "4:30 PM" },
  { entry: 1050, exit: 1040, unique: 850, peak: "9:30 AM" },
  { entry: 760, exit: 720, unique: 620, peak: "5:15 PM" },
  { entry: 980, exit: 965, unique: 710, peak: "2:00 PM" },
];

const READY_REPORT_METRICS: IntakeReport["metrics"][] = [
  { entry: 4520, exit: 4490, unique: 3100, peak: "11:00 AM" },
  { entry: 12500, exit: 12450, unique: 8900, peak: "5:00 PM" },
  { entry: 1200, exit: 1195, unique: 950, peak: "9:00 AM" },
  { entry: 820, exit: 790, unique: 760, peak: "4:45 PM" },
  { entry: 1080, exit: 1065, unique: 820, peak: "1:30 PM" },
];

const SUBMISSION_TIMES = ["09:15 AM", "10:30 AM", "08:00 AM", "11:20 AM", "09:45 AM"];

function getReportTimelinePeriod(monthOffset: number): ReportTimelinePeriod {
  const currentDate = new Date();
  const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
  const month = REPORT_MONTHS[periodStart.getMonth()];
  const shortMonth = month.slice(0, 3);
  const lastDay = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();

  return {
    month,
    monthIndex: periodStart.getMonth(),
    period: `${shortMonth} 1 - ${shortMonth} ${lastDay}, ${periodStart.getFullYear()}`,
    shortMonth,
    year: periodStart.getFullYear(),
  };
}

function formatReportDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function createTimelineReports(period: ReportTimelinePeriod, status: "Ready to Consolidate" | "Consolidated", metrics: IntakeReport["metrics"][]) {
  const periodKey = `${period.year}${String(period.monthIndex + 1).padStart(2, "0")}`;

  return reportEnterprises.map((enterprise, index) => {
    const submittedDate = new Date(period.year, period.monthIndex + 1, index < 3 ? 1 : 2);

    return {
      id: `REP-${periodKey}-${String(index + 1).padStart(2, "0")}`,
      enterpriseId: enterprise.id,
      enterprise: enterprise.name,
      category: enterprise.category,
      barangay: enterprise.barangay,
      month: period.month,
      period: period.period,
      submitted: `${formatReportDate(submittedDate)} ${SUBMISSION_TIMES[index]}`,
      status,
      code: `AT-${String(index + 1).padStart(3, "0")}`,
      remarks: status === "Consolidated" ? "Included in archived final report." : "Validated by staff reviewer.",
      metrics: metrics[index],
    };
  });
}

// The current month is generated by the report store. Static fixtures hold only history.
const archivedReportPeriod = getReportTimelinePeriod(-2);
const readyReportPeriod = getReportTimelinePeriod(-1);
const archivedIntakeReports = createTimelineReports(archivedReportPeriod, "Consolidated", ARCHIVED_REPORT_METRICS);
const readyIntakeReports = createTimelineReports(readyReportPeriod, "Ready to Consolidate", READY_REPORT_METRICS);

export const intakeReports: IntakeReport[] = [...archivedIntakeReports, ...readyIntakeReports];

export const finalReports: FinalReport[] = [
  {
    id: `CON-${archivedReportPeriod.shortMonth.toUpperCase()}-${archivedReportPeriod.year}`,
    title: "Citywide Tourism Aggregation",
    period: `${archivedReportPeriod.month} ${archivedReportPeriod.year}`,
    generatedOn: formatReportDate(new Date(archivedReportPeriod.year, archivedReportPeriod.monthIndex + 1, 4)),
    preparedBy: "Admin Staff User",
    preparedRole: "Staff Processing Division",
    status: "Archived",
    totalEntry: archivedIntakeReports.reduce((total, report) => total + report.metrics.entry, 0),
    totalExit: archivedIntakeReports.reduce((total, report) => total + report.metrics.exit, 0),
    totalUnique: archivedIntakeReports.reduce((total, report) => total + report.metrics.unique, 0),
    enterpriseCount: archivedIntakeReports.length,
    sources: archivedIntakeReports.map((report) => ({
      id: report.id,
      enterprise: report.enterprise,
      code: report.code,
      unique: report.metrics.unique,
      entry: report.metrics.entry,
      exit: report.metrics.exit,
    })),
  },
];
