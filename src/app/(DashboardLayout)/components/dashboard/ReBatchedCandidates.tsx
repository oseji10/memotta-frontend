
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconCurrencyDollar } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import useAnalytics from "@/lib/analytics";

const ReBatchedCandidates = () => {
  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

    const { analytics, loading } = useAnalytics();

  const rebatched_candidates = analytics?.rebatched_candidates || 0;


  return (
    <DashboardCard
      title="Total Re-Batched"
    >
      <>
       <Typography variant="h3" fontWeight="700" mt="-20px">
                 {loading ? 'Loading...' : rebatched_candidates}
        </Typography>
      </>
    </DashboardCard>
  );
};

export default ReBatchedCandidates;
