import dynamic from "next/dynamic";
import { useTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import useAnalytics from "@/lib/analytics";

const CashGenerated = () => {
  const theme = useTheme();
  const { analytics, loading } = useAnalytics();

  const amount_generated = analytics?.total || 0;

  return (
    <DashboardCard title="Total Generated">
      <Typography variant="h3" fontWeight="700" mt="-20px">
  ₦{loading ? 'Loading...' : Number(amount_generated ?? 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</Typography>

    </DashboardCard>
  );
};

export default CashGenerated;
