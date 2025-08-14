'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Ministries from '@/app/(DashboardLayout)/components/tables/Ministries';
import ProductRequests from '@/app/(DashboardLayout)/components/tables/ProductRequest';
import Transactions from '@/app/(DashboardLayout)/components/tables/Transactions';



const SamplePage = () => {
  return (
    <PageContainer title="Transactions" description="List of all transactions">
      <DashboardCard >
        {/* <Typography>All Nominees</Typography> */}
        {/* <NomineesTable/> */}
        <Transactions/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

