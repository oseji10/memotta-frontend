
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconCurrencyDollar } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import useAnalytics from "@/lib/analytics";

const SignedUp = () => {
  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

     const { analytics, loading } = useAnalytics();

  const signed_up = analytics?.signed_up || 0;



  return (
    <DashboardCard
      title="Pending Confirmations"
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
                 {loading ? 'Loading...' : signed_up}
        </Typography>
      </>
    </DashboardCard>
  );
};

export default SignedUp;
