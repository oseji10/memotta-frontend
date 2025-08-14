'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Transactions from '@/app/(DashboardLayout)/components/tables/Transaction';

const SamplePage = () => {
  return (
    <PageContainer title="Transactions" description="List of all transactions">
      <DashboardCard >
        <Transactions/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

