import type { AuditLog, Enterprise, EnterpriseAccount, FinalReport, IntakeReport, LguAccount, MapEnterprise, PipelineHealth, PriorityAlert, ReportEnterprise, SystemActivity, SystemAlert } from "../types";

const monitoredEstablishments = [
  {
    enterpriseId: "E1",
    reportId: "ENT-001",
    account: {
      id: "EA-001",
      enterpriseName: "Archie's Events Place",
      category: "Events Venue",
      managerName: "Gervy Masbate",
      email: "events@archies.example",
      contactNumber: "+63 49 555 0101",
      barangay: "San Antonio",
      address: "B2 L22 Sapphire Street, San Antonio",
      gatewayStatus: "Offline",
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
    complianceOwner: "S. Bercasio",
  },
  {
    enterpriseId: "E2",
    reportId: "ENT-002",
    account: {
      id: "EA-002",
      enterpriseName: "Lolo Uweng Shrine",
      category: "Tourism",
      managerName: "Irish Arabaca",
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
    complianceOwner: "Irish Arabaca",
  },
  {
    enterpriseId: "E3",
    reportId: "ENT-003",
    account: {
      id: "EA-003",
      enterpriseName: "Balaon ni Lolo Uweng",
      category: "Tourism",
      managerName: "David Vallejera",
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
    complianceOwner: "David Vallejera",
  },
  {
    enterpriseId: "E4",
    reportId: "ENT-004",
    account: {
      id: "EA-004",
      enterpriseName: "San Pedro Apostol Parish Church",
      category: "Tourism",
      managerName: "Regine Javier",
      email: "parish@sanpedroapostol.example",
      contactNumber: "+63 49 555 0104",
      barangay: "Nueva",
      address: "A Mabini St, Nueva",
      gatewayStatus: "Closed",
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
    complianceOwner: "Regine Javier",
  },
] satisfies Array<{
  enterpriseId: string;
  reportId: string;
  account: EnterpriseAccount;
  map: Omit<MapEnterprise, "name" | "barangay" | "type" | "address">;
  complianceOwner: string;
}>;

export const mapEnterprises: MapEnterprise[] = monitoredEstablishments.map(({ account, map }) => ({
  ...map,
  name: account.enterpriseName,
  barangay: account.barangay,
  type: account.category,
  address: account.address,
}));

export const enterpriseAccounts: EnterpriseAccount[] = monitoredEstablishments.map(({ account }) => account);

export const enterprises: Enterprise[] = monitoredEstablishments.map(({ account, enterpriseId }) => ({
  id: enterpriseId,
  enterpriseName: account.enterpriseName,
  barangay: account.barangay,
  status: "Active",
  category: account.category,
  gatewayStatus: account.gatewayStatus,
}));

export const lguAccounts: LguAccount[] = [
  {
    id: "LGU-001",
    firstName: "Jherico",
    lastName: "",
    email: "jherico.admin@tanaw.gov.ph",
    role: "Admin",
    status: "Active",
    phone: "+63 917 100 1122",
    lastLogin: "May 18, 2026 08:31 AM",
    createdAt: "Jan 15, 2026",
  },
  {
    id: "LGU-002",
    firstName: "Mike",
    lastName: "",
    email: "mike.it@tanaw.gov.ph",
    role: "IT Personnel",
    status: "Active",
    phone: "+63 917 200 3344",
    lastLogin: "May 18, 2026 09:12 AM",
    createdAt: "Jan 22, 2026",
  },
  {
    id: "LGU-003",
    firstName: "Marianne",
    lastName: "",
    email: "marianne.staff@tanaw.gov.ph",
    role: "LGU Staff",
    status: "Active",
    phone: "+63 917 300 5566",
    lastLogin: "May 18, 2026 07:45 AM",
    createdAt: "Feb 03, 2026",
  },
  {
    id: "LGU-004",
    firstName: "Austine",
    lastName: "",
    email: "austine.audit@tanaw.gov.ph",
    role: "LGU Staff",
    status: "Inactive",
    phone: "+63 917 400 7788",
    lastLogin: "May 10, 2026 04:02 PM",
    createdAt: "Feb 19, 2026",
  },
  {
    id: "LGU-005",
    firstName: "Kenneth",
    lastName: "Delicano",
    email: "kenneth.support@tanaw.gov.ph",
    role: "IT Personnel",
    status: "Inactive",
    phone: "+63 917 500 9900",
    lastLogin: "May 07, 2026 11:17 AM",
    createdAt: "Mar 04, 2026",
  },
];

export const pipelineHealth: PipelineHealth[] = [];

export const systemActivities: SystemActivity[] = [
  {
    id: "ACT-LOGIN-001",
    severity: "Info",
    type: "LOGIN",
    time: "2026-05-23 08:52 AM",
    initiatedBy: "Marianne",
    actorType: "LGU Account",
    accountName: "Marianne",
    target: "LGU Staff portal",
    summary: "LGU Staff account signed in successfully.",
    recommendedAction: "No action is required unless the login was not expected.",
    timePeriod: "Today",
  },
  {
    id: "ACT-CONN-001",
    severity: "Info",
    type: "CONNECTION",
    time: "2026-05-23 08:46 AM",
    initiatedBy: "Lolo Uweng Shrine",
    actorType: "Enterprise Account",
    enterprise: "Lolo Uweng Shrine",
    device: "GW-SHRINE-02",
    target: "Desktop app connection",
    summary: "Enterprise desktop app opened and is actively processing live data.",
    recommendedAction: "Monitor live occupancy and camera health as needed.",
    timePeriod: "Today",
    deviceState: "Healthy",
  },
  {
    id: "ACT-CONN-002",
    severity: "Warning",
    type: "CONNECTION",
    time: "2026-05-23 08:33 AM",
    initiatedBy: "Archie's Events Place",
    actorType: "Enterprise Account",
    enterprise: "Archie's Events Place",
    device: "GW-ARCHIES-01",
    target: "Desktop app connection",
    summary: "Enterprise desktop app is offline and not currently processing data.",
    recommendedAction: "Confirm whether the establishment is closed or the desktop app is not running.",
    timePeriod: "Today",
    deviceState: "Offline",
    requiresEnterpriseAttention: true,
  },
  {
    id: "ACT-ACCT-001",
    severity: "Info",
    type: "ACCOUNT CONFIG",
    time: "2026-05-23 08:21 AM",
    initiatedBy: "Mike",
    actorType: "IT Personnel",
    accountName: "Kenneth Delicano",
    target: "LGU account access",
    summary: "IT Personnel updated LGU account status and access configuration.",
    recommendedAction: "No follow-up is required unless the access change needs review.",
    timePeriod: "Today",
  },
  {
    id: "ACT-ENTCFG-001",
    severity: "Info",
    type: "ENTERPRISE CONFIG",
    time: "2026-05-23 08:08 AM",
    initiatedBy: "Mike",
    actorType: "IT Personnel",
    enterprise: "Archie's Events Place",
    device: "CAM-03",
    target: "RTSP and ONVIF settings",
    summary: "IT Personnel updated RTSP stream URL and ONVIF reachability settings for a camera node.",
    recommendedAction: "Run a connection test and confirm the camera stream remains stable.",
    timePeriod: "Today",
  },
  {
    id: "ACT-IT-001",
    severity: "Info",
    type: "IT ACTION",
    time: "2026-05-23 07:59 AM",
    initiatedBy: "Mike",
    actorType: "IT Personnel",
    enterprise: "San Pedro Apostol Parish Church",
    target: "Enterprise account status",
    summary: "IT Personnel marked an enterprise account as Closed for record-keeping.",
    recommendedAction: "Retain the account for historical records and reporting references.",
    timePeriod: "Today",
  },
  {
    id: "ACT-SYS-001",
    severity: "Info",
    type: "SYSTEM",
    time: "2026-05-23 07:47 AM",
    initiatedBy: "System",
    actorType: "System",
    accountName: "Jherico",
    target: "Verification email",
    summary: "System automatically sent a verification email to an LGU account.",
    recommendedAction: "No manual action is required unless delivery fails.",
    timePeriod: "Today",
  },
  {
    id: "ACT-SYS-002",
    severity: "Info",
    type: "SYSTEM",
    time: "2026-05-23 06:58 AM",
    initiatedBy: "System",
    actorType: "System",
    enterprise: "Balaon ni Lolo Uweng",
    target: "SMS notification",
    summary: "System automatically sent an SMS notification to an enterprise contact.",
    recommendedAction: "No manual action is required unless the recipient reports non-delivery.",
    timePeriod: "Today",
  },
  {
    id: "ACT-SYS-003",
    severity: "Info",
    type: "SYSTEM",
    time: "2026-05-22 04:16 PM",
    initiatedBy: "System",
    actorType: "System",
    accountName: "Irish Arabaca",
    target: "Password reset email",
    summary: "System automatically sent a password reset email after an approved reset request.",
    recommendedAction: "No manual action is required after successful delivery.",
    timePeriod: "Earlier",
  },
];

export const priorityAlerts: PriorityAlert[] = [
  {
    id: "PAL-001",
    type: "Maintenance Request",
    severity: "Critical",
    enterprise: "Archie's Events Place",
    requester: "Gervy Masbate",
    summary: "CCTV connection cannot be established for the Garden Stage camera.",
    requiredAction: "Dispatch IT personnel to the enterprise location to inspect cabling, camera power, and network equipment.",
    resolutionMode: "On-site Visit Required",
    status: "New",
    time: "18m ago",
  },
  {
    id: "PAL-002",
    type: "Maintenance Request",
    severity: "Warning",
    enterprise: "San Pedro Apostol Parish Church",
    requester: "Regine Javier",
    summary: "Enterprise reported repeated ONVIF discovery failure for one CCTV node.",
    requiredAction: "Schedule an on-site validation because the camera cannot be recovered remotely.",
    resolutionMode: "On-site Visit Required",
    status: "In Review",
    time: "46m ago",
  },
  {
    id: "PAL-003",
    type: "Password Reset Request",
    severity: "Info",
    requester: "Irish Arabaca",
    enterprise: "Lolo Uweng Shrine",
    summary: "Enterprise user requested a password reset for their account.",
    requiredAction: "Review the request and trigger the password reset workflow from the system.",
    resolutionMode: "In-system Action",
    status: "New",
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
