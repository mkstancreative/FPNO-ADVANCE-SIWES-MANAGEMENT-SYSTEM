import {
  Building,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Users,
  Bell,
  FileText,
  Settings2,
} from "lucide-react";

export const ADMIN_NAV = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/admin",
      },
    ],
  },
  {
    section: "Setup",
    items: [
      {
        label: "Batches",
        icon: <Layers size={18} />,
        path: "/admin/batches",
      },
      {
        label: "Students",
        icon: <GraduationCap size={18} />,
        children: [
          {
            label: "All Students",
            icon: <GraduationCap size={18} />,
            path: "/admin/students",
          },
          {
            label: "Unassigned Students",
            icon: <GraduationCap size={18} />,
            path: "/admin/unassigned-students",
          },
          {
            label: "Internships",
            icon: <GraduationCap size={18} />,
            path: "/admin/internships",
          },
        ],
      },
    ],
  },
  {
    section: "Manage Supervisors",
    items: [
      {
        label: "Supervisors",
        icon: <Users size={18} />,
        path: "/admin/supervisors",
      },
    ],
  },
  {
    section: "Manage Company/Hospitals",
    items: [
      {
        label: "Companies",
        icon: <Building size={18} />,
        children: [
          {
            label: "Unverified Companies",
            icon: <Building size={18} />,
            path: "/admin/companies",
          },
          {
            label: "Partially Verified Companies",
            icon: <Building size={18} />,
            path: "/admin/partially-verified-companies",
          },
          {
            label: "Verified Companies",
            icon: <Building size={18} />,
            path: "/admin/verified-companies",
          },
        ],
      },
    ],
  },
  {
    section: "Notifications",
    items: [
      {
        label: "Notifications",
        icon: <Bell size={18} />,
        path: "/admin/notifications",
      },
    ],
  },
  {
    section: "Certificates",
    items: [
      {
        label: "Certificate Requests",
        icon: <FileText size={18} />,
        path: "/admin/certificates",
      },
    ],
  },
  {
    section: "Settings",
    items: [
      {
        label: "System Settings",
        icon: <Settings2 size={18} />,
        path: "/admin/settings",
      },
    ],
  },
];
