// src/data/menu-items.ts
import { TablerIcon } from "@tabler/icons-react";
import {
  IconBox,
  IconLayoutDashboard,
  IconLogin,
  IconMedicalCross,
  IconMoneybag,
  IconPencilDown,
  IconReceiptTax,
  IconStack3,
  IconTypography,
  IconUsers,
} from "@tabler/icons-react";
import { uniqueId } from "lodash";

interface MenuItem {
  id: string;
  title: string;
  icon: TablerIcon;
  href: string;
  allowedStaffTypes?: string[];
  allowedRoles?: string[];
  navlabel?: boolean;
  subheader?: string;
}

const Menuitems: MenuItem[] = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard/",
    allowedStaffTypes: ["Admin", "Government Rep", "Supervisor", "Agent", "Onboarder"],
    
  },
  {
    id: uniqueId(),
    title: "Users",
    icon: IconUsers,
    href: "/dashboard/users/users",
    allowedStaffTypes: ["Admin"],
    allowedRoles: ["Administrator"],
  },
  {
    id: uniqueId(),
    title: "Beneficiaries",
    icon: IconMedicalCross,
    href: "/dashboard/beneficiaries/beneficiaries",
    allowedStaffTypes: ["Admin", "Government Rep", "Supervisor", "Agent", "Onboarder"],
    
  },
  {
    id: uniqueId(),
    title: "Ministries",
    icon: IconLogin,
    href: "/dashboard/ministries/ministries",
    allowedStaffTypes: ["Admin"],
  },
  {
    id: uniqueId(),
    title: "Cadres",
    icon: IconTypography,
    href: "/dashboard/cadres/cadres",
    allowedStaffTypes: ["Admin"],
    
  },
  {
    id: uniqueId(),
    title: "Products",
    icon: IconBox,
    href: "/dashboard/products/products",
    allowedStaffTypes: ["Admin", "Store Manager"],
    
  },
  {
    id: uniqueId(),
    title: "Product Requests",
    icon: IconPencilDown,
    href: "/dashboard/product_request/product_request",
    allowedStaffTypes: ["Admin", "Supervisor", "Store Manager", "Agent"],
    
  },
  {
    id: uniqueId(),
    title: "Stock",
    icon: IconStack3,
    href: "/dashboard/stock/stock",
    allowedStaffTypes: ["Admin", "Supervisor", "Store Manager", "Agent"],

  },
  {
    id: uniqueId(),
    title: "Transactions",
    icon: IconMoneybag,
    href: "/dashboard/transactions/transactions",
    allowedStaffTypes: ["Admin", "Agent", "Supervisor", "Agent"],
    
  },
  {
    id: uniqueId(),
    title: "Reports",
    icon: IconReceiptTax,
    href: "/dashboard/reports",
    allowedStaffTypes: ["Admin", "Government Rep", "Supervisor"],
  },
];

export const getFilteredMenuItems = (
  staffType: string | null,
//   role: string | null
): MenuItem[] => {
  if (!staffType) {
    return []; // No access if no staffType or role
  }

  return Menuitems.filter((item) => {
    const staffAllowed =
      !item.allowedStaffTypes ||
      (staffType && item.allowedStaffTypes.includes(staffType));
    // const roleAllowed =
    //   !item.allowedRoles || (role && item.allowedRoles.includes(role));
    return staffAllowed;
  });
};

export default Menuitems;