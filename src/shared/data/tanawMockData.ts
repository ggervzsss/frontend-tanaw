import type { Enterprise, EnterpriseAccount, FinalReport, IntakeReport, LguAccount, MapEnterprise, PipelineHealth, PriorityAlert, ReportEnterprise, SystemActivity, SystemLog } from "../types";

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
      address: "B2 L22 Sapphire Street, Barangay San Antonio, San Pedro City, Laguna",
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
      totalLiveOccupancy: 84,
      estimatedUniqueCount: 740,
      status: "Normal",
      operatingHours: "10:00 AM - 5:00 PM",
      trend: "Stable",
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
      address: "Landayan Road, Barangay Landayan, San Pedro City, Laguna",
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
      totalLiveOccupancy: 212,
      estimatedUniqueCount: 1840,
      status: "Warning",
      operatingHours: "6:00 AM - 8:00 PM",
      trend: "Up",
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
      address: "Landayan Heritage Strip, Barangay Landayan, San Pedro City, Laguna",
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
      totalLiveOccupancy: 48,
      estimatedUniqueCount: 610,
      status: "Normal",
      operatingHours: "9:00 AM - 8:00 PM",
      trend: "Stable",
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
      address: "A. Mabini Street, Barangay Nueva, San Pedro City, Laguna",
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
      totalLiveOccupancy: 156,
      estimatedUniqueCount: 1320,
      status: "Critical",
      operatingHours: "6:00 AM - 8:00 PM",
      trend: "Up",
    },
    complianceOwner: "Regine Javier",
  },
] satisfies Array<{
  enterpriseId: string;
  reportId: string;
  account: EnterpriseAccount;
  map: Omit<MapEnterprise, "name" | "barangay" | "category" | "fullAddress" | "contact" | "lastSync" | "gatewayStatus">;
  complianceOwner: string;
}>;

export const mapEnterprises: MapEnterprise[] = monitoredEstablishments.map(({ account, map }) => ({
  ...map,
  name: account.enterpriseName,
  barangay: account.barangay,
  category: account.category,
  fullAddress: account.address,
  contact: account.contactNumber,
  lastSync: account.lastSync,
  gatewayStatus: account.gatewayStatus,
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
    owner: "IT",
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
    owner: "IT",
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
    owner: "IT",
    time: "1h ago",
  },
  {
    id: "PAL-004",
    type: "Submission Delay",
    severity: "Warning",
    enterprise: "Balaon ni Lolo Uweng",
    requester: "System",
    summary: "Monthly compliance report is still missing for the active reporting cycle.",
    requiredAction: "Ask Staff to follow up with the enterprise contact before consolidation closes.",
    resolutionMode: "Staff Follow-up",
    status: "New",
    owner: "System",
    time: "2h ago",
  },
  {
    id: "PAL-005",
    type: "Occupancy Spike",
    severity: "Critical",
    enterprise: "San Pedro Apostol Parish Church",
    requester: "Occupancy Monitor",
    summary: "Visitor count rose sharply above the normal baseline for the current time window.",
    requiredAction: "Admin should review live map occupancy and coordinate with local operations if crowd control is required.",
    resolutionMode: "Admin Monitoring",
    status: "In Review",
    owner: "Admin",
    time: "3h ago",
  },
  {
    id: "PAL-007",
    type: "Foot Traffic Alert",
    severity: "Warning",
    enterprise: "Lolo Uweng Shrine",
    requester: "Analytics Monitor",
    summary: "Non-local visitor share is trending above the usual weekday pattern.",
    requiredAction: "Admin can compare the current pattern with historical analytics and watch for crowding indicators.",
    resolutionMode: "Admin Monitoring",
    status: "New",
    owner: "Admin",
    time: "Yesterday",
  },
  {
    id: "PAL-008",
    type: "Threshold Breach",
    severity: "Critical",
    enterprise: "Archie's Events Place",
    requester: "Capacity Threshold Monitor",
    summary: "Enterprise occupancy crossed the configured threshold for two consecutive readings.",
    requiredAction: "Admin should monitor the enterprise map marker and coordinate with field operations if the trend persists.",
    resolutionMode: "Admin Monitoring",
    status: "New",
    owner: "Admin",
    time: "Yesterday",
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

export const systemLogs: SystemLog[] = [
  ...systemActivities.map<SystemLog>((activity) => ({
    id: `LOG-${activity.id}`,
    timestamp: activity.time,
    category: "IT Activity",
    severity: activity.severity === "Info" ? "Success" : activity.severity,
    actor: activity.initiatedBy,
    actorRole: activity.actorType === "LGU Account" ? "LGU Staff" : activity.actorType,
    action: activity.type,
    target: activity.target ?? activity.enterprise ?? activity.accountName ?? "System",
    summary: activity.summary,
    sourceId: activity.id,
    metadata: {
      recommendedAction: activity.recommendedAction,
      device: activity.device ?? null,
      deviceState: activity.deviceState ?? null,
    },
  })),
  ...intakeReports
    .filter((report) => report.submitted !== "Not submitted")
    .map<SystemLog>((report) => ({
      id: `LOG-SUB-${report.id}`,
      timestamp: report.submitted,
      category: "Staff Submission",
      severity: report.status === "Returned" ? "Warning" : report.status === "Missing" ? "Critical" : "Success",
      actor: report.enterprise,
      actorRole: "Enterprise Account",
      action: "Report Submission",
      target: report.id,
      summary: `${report.enterprise} submitted ${report.period} compliance report for Staff review.`,
      sourceId: report.id,
      metadata: {
        status: report.status,
        barangay: report.barangay,
        category: report.category,
      },
    })),
  ...finalReports.map<SystemLog>((report) => ({
    id: `LOG-FIN-${report.id}`,
    timestamp: report.generatedOn,
    category: "Staff Operation",
    severity: report.status === "Archived" || report.status === "Finalized" ? "Success" : "Info",
    actor: report.preparedBy,
    actorRole: "LGU Staff",
    action: "Generate Final Report",
    target: report.id,
    summary: `${report.title} for ${report.period} was generated from ${report.enterpriseCount} enterprise submissions.`,
    sourceId: report.id,
    metadata: {
      status: report.status,
      totalEntry: report.totalEntry,
      totalUnique: report.totalUnique,
    },
  })),
  {
    id: "LOG-ADM-001",
    timestamp: "2026-05-23 09:10 AM",
    category: "Admin Operation",
    severity: "Success",
    actor: "Jherico",
    actorRole: "Admin",
    action: "Map Review",
    target: "Admin Map View",
    summary: "Admin reviewed citywide enterprise distribution and visitor density layers.",
    sourceId: "admin_001",
    metadata: {
      module: "Map View",
    },
  },
  {
    id: "LOG-ADM-002",
    timestamp: "2026-05-23 09:04 AM",
    category: "Admin Operation",
    severity: "Info",
    actor: "Jherico",
    actorRole: "Admin",
    action: "Alert Review",
    target: "Priority Alerts",
    summary: "Admin opened the centralized alerts feed for system-wide incident review.",
    sourceId: "admin_001",
    metadata: {
      module: "Alerts",
    },
  },
  {
    id: "LOG-SYS-001",
    timestamp: "2026-05-23 06:30 AM",
    category: "System",
    severity: "Success",
    actor: "System",
    actorRole: "System",
    action: "Daily Retention Check",
    target: "System Logs",
    summary: "Scheduled retention scan completed for audit and operational activity records.",
    sourceId: "system",
    metadata: {
      retentionDays: 180,
    },
  },
];
