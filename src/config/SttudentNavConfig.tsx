import {
  Bell,
  BookOpen,
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  ReceiptPoundSterling,
  User,
} from "lucide-react";

export const STUDENT_NAV = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/student",
      },
    ],
  },
  {
    section: "Placement",
    items: [
      {
        label: "Placement Status",
        icon: <Briefcase size={18} />,
        path: "/student/placement",
      },
    ],
  },
  {
    section: "Internships",
    items: [
      {
        label: "Internship History",
        icon: <GraduationCap size={18} />,
        path: "/student/internships",
      },
    ],
  },
  {
    section: "Log Book",
    items: [
      {
        label: "Log Book",
        icon: <BookOpen size={18} />,
        path: "/student/logbook",
      },
    ],
  },

  {
    section: "Companies",
    items: [
      {
        label: "Available Companies",
        icon: <Briefcase size={18} />,
        path: "/student/companies",
      },
    ],
  },
  {
    section: "Reports",
    items: [
      {
        label: "Report",
        icon: <ReceiptPoundSterling size={18} />,
        path: "/student/report",
      },
    ],
  },
  {
    section: "Notifications",
    items: [
      {
        label: "Notifications",
        icon: <Bell size={18} />,
        path: "/student/notifications",
      },
    ],
  },

  {
    section: "Profile",
    items: [
      {
        label: "Profile",
        icon: <User size={18} />,
        path: "/student/profile",
      },
    ],
  },
];
