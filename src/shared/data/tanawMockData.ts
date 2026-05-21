import type { AuditLog, CameraNode, Enterprise, EnterpriseAccount, FinalReport, IntakeReport, LguAccount, MapEnterprise, PipelineHealth, ReportEnterprise, SystemAlert, TechnicalLog } from "../types";

const monitoredEstablishments = [
  {
    enterpriseId: "E1",
    reportId: "ENT-001",
    account: {
      id: "EA-001",
      enterpriseName: "Archie's Events Place",
      category: "Events Venue",
      managerName: "Lara Mendoza",
      email: "events@archies.example",
      contactNumber: "+63 49 555 0101",
      barangay: "Narra",
      address: "Narra Road, Barangay Narra",
      gatewayStatus: "Sync Delayed",
      gatewayId: "GW-ARCHIES-01",
      accountStatus: "Active",
      lastSync: "May 18, 2026 08:40 AM",
      cameras: [
        { id: "CAM-01", name: "Main Gate", location: "Entrance Gate", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:43 AM" },
        { id: "CAM-02", name: "Events Hall", location: "Reception Hall", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:42 AM" },
        { id: "CAM-03", name: "Garden Stage", location: "Outdoor Stage", rtspStatus: "Degraded", onvifStatus: "Reachable", status: "Unstable", lastChecked: "May 18, 2026 08:39 AM" },
      ],
    },
    map: {
      id: 101,
      lat: 14.3367,
      lng: 121.0472,
      visitorCount: 740,
      status: "Normal",
      topSegment: "Event Guests",
      localVisitors: 520,
      nonLocalVisitors: 220,
      maleVisitors: 330,
      femaleVisitors: 410,
      totalTourists: 240,
    },
    complianceOwner: "L. Mendoza",
    pendingSync: 34,
  },
  {
    enterpriseId: "E2",
    reportId: "ENT-002",
    account: {
      id: "EA-002",
      enterpriseName: "Lolo Uweng Shrine",
      category: "Faith Tourism",
      managerName: "A. Santos",
      email: "shrine@lolouweng.example",
      contactNumber: "+63 49 555 0102",
      barangay: "Landayan",
      address: "Landayan Road, Barangay Landayan",
      gatewayStatus: "Connected",
      gatewayId: "GW-SHRINE-02",
      accountStatus: "Active",
      lastSync: "May 18, 2026 08:45 AM",
      cameras: [
        { id: "CAM-04", name: "Pilgrim Gate", location: "Shrine Entrance", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:45 AM" },
        { id: "CAM-05", name: "Prayer Hall", location: "Main Hall", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:44 AM" },
      ],
    },
    map: {
      id: 102,
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
    complianceOwner: "A. Santos",
    pendingSync: 0,
  },
  {
    enterpriseId: "E3",
    reportId: "ENT-003",
    account: {
      id: "EA-003",
      enterpriseName: "Balaon ni Lolo Uweng",
      category: "Faith Tourism",
      managerName: "M. Garcia",
      email: "balaon@lolouweng.example",
      contactNumber: "+63 49 555 0103",
      barangay: "Landayan",
      address: "Landayan Heritage Strip, Barangay Landayan",
      gatewayStatus: "Connected",
      gatewayId: "GW-BALAON-03",
      accountStatus: "Active",
      lastSync: "May 18, 2026 08:41 AM",
      cameras: [{ id: "CAM-06", name: "Dining Entry", location: "Front Entrance", rtspStatus: "Connected", onvifStatus: "Reachable", status: "Online", lastChecked: "May 18, 2026 08:41 AM" }],
    },
    map: {
      id: 103,
      lat: 14.3447,
      lng: 121.0553,
      visitorCount: 610,
      status: "Normal",
      topSegment: "Families",
      localVisitors: 440,
      nonLocalVisitors: 170,
      maleVisitors: 285,
      femaleVisitors: 325,
      totalTourists: 210,
    },
    complianceOwner: "M. Garcia",
    pendingSync: 0,
  },
  {
    enterpriseId: "E4",
    reportId: "ENT-004",
    account: {
      id: "EA-004",
      enterpriseName: "San Pedro Apostol Parish Church",
      category: "Faith Tourism",
      managerName: "R. Cruz",
      email: "parish@sanpedroapostol.example",
      contactNumber: "+63 49 555 0104",
      barangay: "Poblacion",
      address: "Rizal Street, Barangay Poblacion",
      gatewayStatus: "Offline",
      gatewayId: "GW-PARISH-04",
      accountStatus: "Active",
      lastSync: "May 18, 2026 07:52 AM",
      cameras: [
        { id: "CAM-07", name: "Parish Gate", location: "Front Entrance", rtspStatus: "Timeout", onvifStatus: "Unreachable", status: "Offline", lastChecked: "May 18, 2026 07:52 AM" },
        { id: "CAM-08", name: "Nave View", location: "Main Nave", rtspStatus: "Connected", onvifStatus: "Intermittent", status: "Unstable", lastChecked: "May 18, 2026 07:59 AM" },
      ],
    },
    map: {
      id: 104,
      lat: 14.3595,
      lng: 121.0501,
      visitorCount: 1320,
      status: "Critical",
      topSegment: "Parish Visitors",
      localVisitors: 915,
      nonLocalVisitors: 405,
      maleVisitors: 580,
      femaleVisitors: 740,
      totalTourists: 510,
    },
    complianceOwner: "R. Cruz",
    pendingSync: 118,
  },
] satisfies Array<{
  enterpriseId: string;
  reportId: string;
  account: EnterpriseAccount;
  map: Omit<MapEnterprise, "name" | "barangay" | "type" | "address">;
  complianceOwner: string;
  pendingSync: number;
}>;

export const mapEnterprises: MapEnterprise[] = monitoredEstablishments.map(({ account, map }) => ({
  ...map,
  name: account.enterpriseName,
  barangay: account.barangay,
  type: account.category,
  address: account.address,
}));

export const enterpriseAccounts: EnterpriseAccount[] = monitoredEstablishments.map(({ account }) => account);

export const enterpriseCameras: CameraNode[] = monitoredEstablishments.flatMap(({ account, enterpriseId }) =>
  account.cameras.map((camera) => ({
    id: camera.id,
    enterpriseId,
    enterpriseName: account.enterpriseName,
    name: camera.name,
    status: camera.status,
    connectivity: camera.status === "Online" ? 96.8 : camera.status === "Unstable" ? 54.1 : 0,
    fps: camera.status === "Online" ? 29.4 : camera.status === "Unstable" ? 10.2 : 0,
    latencyMs: camera.status === "Online" ? 48 : camera.status === "Unstable" ? 260 : 0,
    lastChecked: camera.lastChecked,
  })),
);

export const enterprises: Enterprise[] = monitoredEstablishments.map(({ account, enterpriseId, pendingSync }) => ({
  id: enterpriseId,
  enterpriseName: account.enterpriseName,
  barangay: account.barangay,
  status: "Active",
  category: account.category,
  gatewayStatus: account.gatewayStatus,
  pendingSync,
}));

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

export const pipelineHealth: PipelineHealth[] = [
  {
    enterpriseId: "E1",
    name: "Archie's Events Place",
    barangay: "Narra",
    gatewayStatus: "Sync Delayed",
    cameraFeed: { activeCams: 2, totalCams: 3 },
    warnings: [
      { id: "ALERT-001", severity: "Warning", device: "CAM-03", msg: "Garden Stage camera has high occlusion and reduced detection confidence.", status: "New", time: "May 14, 2026 08:09 AM" },
      { id: "ALERT-002", severity: "Warning", device: "GW-ARCHIES-01", msg: "Gateway has 34 records pending cloud sync.", status: "Acknowledged", time: "May 14, 2026 07:40 AM" },
    ],
  },
  {
    enterpriseId: "E2",
    name: "Lolo Uweng Shrine",
    barangay: "Landayan",
    gatewayStatus: "Connected",
    cameraFeed: { activeCams: 2, totalCams: 2 },
    warnings: [],
  },
  {
    enterpriseId: "E3",
    name: "Balaon ni Lolo Uweng",
    barangay: "Landayan",
    gatewayStatus: "Connected",
    cameraFeed: { activeCams: 1, totalCams: 1 },
    warnings: [],
  },
  {
    enterpriseId: "E4",
    name: "San Pedro Apostol Parish Church",
    barangay: "Poblacion",
    gatewayStatus: "Offline",
    cameraFeed: { activeCams: 0, totalCams: 2 },
    warnings: [
      { id: "ALERT-003", severity: "Critical", device: "CAM-07", msg: "Parish Gate camera is offline and has failed RTSP testing.", status: "New", time: "May 14, 2026 07:52 AM" },
      { id: "ALERT-004", severity: "Warning", device: "CAM-08", msg: "Nave View camera is online but unstable.", status: "New", time: "May 14, 2026 07:59 AM" },
    ],
  },
];

export const technicalLogs: TechnicalLog[] = [
  {
    id: "LOG-001",
    severity: "Critical",
    eventType: "Camera",
    enterprise: "San Pedro Apostol Parish Church",
    device: "CAM-07",
    desc: "Camera CAM-07 went offline after repeated RTSP connection timeouts.",
    performedBy: "System monitor",
    time: "2m ago",
  },
  {
    id: "LOG-002",
    severity: "Warning",
    eventType: "Sync",
    enterprise: "Archie's Events Place",
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
    enterprise: "Archie's Events Place",
    device: "CAM-03",
    desc: "High occlusion and low FPS detected on Garden Stage camera.",
    performedBy: "Camera health check",
    time: "1h ago",
  },
];

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
    desc: "Updated RTSP stream URL and frame rate for Archie's Events Place - Cam 01.",
  },
  {
    id: 3,
    time: "2026-05-13 10:50:11 AM",
    user: "ent_balaon",
    role: "Enterprise",
    module: "Auth",
    event: "Error",
    desc: "Failed login attempt. Invalid credentials provided.",
  },
  {
    id: 4,
    time: "2026-05-13 10:48:00 AM",
    user: "ent_balaon",
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
    desc: "Queried Enterprise Performance Ledger for Lolo Uweng Shrine.",
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
    user: "ent_shrine",
    role: "Enterprise",
    module: "Reports",
    event: "Submit",
    desc: "Enterprise Lolo Uweng Shrine submitted Weekly Compliance Report.",
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
    enterprise: "San Pedro Apostol Parish Church",
    severity: "Critical",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: "Active",
    desc: "Occupancy exceeded 90% hard threshold. Security mobilization recommended.",
  },
  {
    id: "ALRT-902",
    type: "Camera Offline",
    enterprise: "Archie's Events Place",
    severity: "Warning",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: "Active",
    desc: "RTSP stream dropped for Cam 01. Video analytics suspended.",
  },
  {
    id: "ALRT-903",
    type: "Visitor Surge",
    enterprise: "Lolo Uweng Shrine",
    severity: "Warning",
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    status: "IT Notified",
    desc: "Sudden 40% increase in entry rate within 10 minutes. Monitoring required.",
  },
  {
    id: "ALRT-904",
    type: "Database Sync Delay",
    enterprise: "Balaon ni Lolo Uweng",
    severity: "Info",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    status: "Resolved",
    desc: "Edge node cache failed to sync to central cloud. Auto-resolved via redundant path.",
  },
];

export const reportEnterprises: ReportEnterprise[] = monitoredEstablishments.map(({ account, complianceOwner, reportId }) => ({
  id: reportId,
  name: account.enterpriseName,
  category: account.category,
  barangay: account.barangay,
  complianceOwner,
}));

const REPORT_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
];

const READY_REPORT_METRICS: IntakeReport["metrics"][] = [
  { entry: 4520, exit: 4490, unique: 3100, peak: "11:00 AM" },
  { entry: 12500, exit: 12450, unique: 8900, peak: "5:00 PM" },
  { entry: 1200, exit: 1195, unique: 950, peak: "9:00 AM" },
  { entry: 820, exit: 790, unique: 760, peak: "4:45 PM" },
];

const SUBMISSION_TIMES = ["09:15 AM", "10:30 AM", "08:00 AM", "11:20 AM"];

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
