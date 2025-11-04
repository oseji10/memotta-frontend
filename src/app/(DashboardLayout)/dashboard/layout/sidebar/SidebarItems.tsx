import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Box, List, Typography } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { getApplicationType, getRole } from "../../../../../lib/auth";
import { IconArchive, IconBook, IconBooks, IconBuildingArch, IconCreditCard, IconDeviceDesktop, IconFilePencil, IconFingerprint, IconHeadphones, IconHelp, IconHome2, IconPencil, IconPrinter, IconRecycle, IconRecycleOff, IconSchool, IconShoppingBag, IconTie, IconUsersGroup, IconVersionsFilled } from "@tabler/icons-react";

interface SidebarItemsProps {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

// Local menu data based on role
const MENU_CONFIG: Record<string, any[]> = {
  admin: [
    // { id: "dashboard", title: "Dashboard", icon: "dashboard", href: "/admin/dashboard" },
    { subheader: "Admin Dashboard", href: "/dashboard", id: 'admin' },
   {
      id: "home",
      title: "Home",
      icon: IconHome2,
      href: "/dashboard",
    },
    {
      id: "cohorts",
      title: "Cohorts",
      icon: IconUsersGroup,
      href: "/dashboard/cohorts",
    },
    {
      id: "courses",
      title: "Courses",
      icon: IconBooks,
      href: "/dashboard/courses",
    },
       {
      id: "applications",
      title: "Applications",
      icon: IconFilePencil,
      href: "/dashboard/",
    },
       {
      id: "batches",
      title: "Clusters",
      icon: IconRecycle,
      href: "/dashboard/",
    },
    //  {
    //   id: "halls",
    //   title: "Halls",
    //   icon: IconBuildingArch,
    //   href: "/dashboard/halls",
    // },
    //    {
    //   id: "rebatched-applicants",
    //   title: "Rebatched Applicants",
    //   icon: IconRecycleOff,
    //   href: "/dashboard/rebatched-applicants",
    // },

      {
      id: "payments",
      title: "Payments",
      icon: IconShoppingBag,
      href: "/dashboard/payments",
    },
       {
      id: "verification",
      title: "Assignments",
      icon: IconFingerprint,
      href: "/dashboard/",
    },
       {
      id: "attendance",
      title: "Exams",
      icon: IconUsersGroup,
      href: "/dashboard/",
    },

     

       {
      id: "admissions",
      title: "Admissions",
      icon: IconSchool,
      href: "#",
    },
  ],
  student: [
    // { id: "overview", title: "Overview", icon: "home", href: "/client/overview" },
    { subheader: "Student Dashboard", href: "/dashboard", id: 'student' },
      {
      id: "home",
      title: "Home",
      icon: IconHome2,
      href: "/dashboard",
    },
    {
      id: "profile",
      title: "My Profile",
      icon: IconFingerprint,
      href: "/dashboard/my-profile",
    },
     {
      id: "courses",
      title: "My Courses",
      icon: IconBook,
      href: "/dashboard/my-courses",
    },
     {
      id: "my-payments",
      title: "My Payments",
      icon: IconCreditCard,
      href: "/dashboard/my-payments",
    },
    {
      id: "resources",
      title: "Resources",
      icon: IconVersionsFilled,
      href: "/dashboard/",
    },
    
    {
      id: "lecture-archives",
      title: "Lecture Archive",
      icon: IconArchive,
      href: "/dashboard/lecture-archives",
    },
    {
      id: "assignments",
      title: "Assessments",
      icon: IconPencil,
      href: "/dashboard/my-assessments",
    },
       {
      id: "certificates",
      title: "Certificates",
      icon: IconSchool,
      href: "/dashboard/my-certificates",
    },
     {
      id: "job-opportunities",
      title: "Job Opportunities",
      icon: IconTie,
      href: "/dashboard/",
    },
       {
      id: "help",
      title: "Help",
      icon: IconHelp,
      href: "/dashboard/",
    },
       {
      id: "support",
      title: "Support",
      icon: IconHeadphones,
      href: "/dashboard/",
    },
  ],

  staff: [
    { id: "panel", title: "Panel", icon: "work", href: "/staff/panel" },
    {
      subheader: "Operations",
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: "task",
      href: "/staff/tasks",
    },
  ],
};

const SidebarItems: React.FC<SidebarItemsProps> = ({ toggleMobileSidebar }) => {
  const pathname = usePathname();
  const pathDirect = pathname;

  const [applicationType, setApplicationType] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const storedApplicationType = getApplicationType();
    const storedRole = getRole();

    setApplicationType(storedApplicationType);
    setRole(storedRole);

    // Use switch-case to select the menu based on role
    let selectedMenu: any[] = [];
    switch (storedRole) {
      case "ADMIN":
        selectedMenu = MENU_CONFIG.admin;
        break;
      case "STUDENT":
        selectedMenu = MENU_CONFIG.student;
        break;
      case "STAFF":
        selectedMenu = MENU_CONFIG.staff;
        break;
      default:
        selectedMenu = [];
        break;
    }

    setMenuItems(selectedMenu);
  }, []);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {role === null ? (
          <Box sx={{ px: 3, py: 1, color: "text.secondary" }}>
            <Typography>Loading menu...</Typography>
          </Box>
        ) : menuItems.length === 0 ? (
          <Box sx={{ px: 3, py: 1, color: "text.secondary" }}>
            <Typography>No menu items available for your role</Typography>
          </Box>
        ) : (
          menuItems.map((item) => {
            if (item.subheader) {
              return <NavGroup item={item} key={item.subheader} />;
            } else {
              return (
                <NavItem
                  item={item}
                  key={item.id}
                  pathDirect={pathDirect}
                  onClick={toggleMobileSidebar}
                />
              );
            }
          })
        )}
      </List>
    </Box>
  );
};

export default SidebarItems;
