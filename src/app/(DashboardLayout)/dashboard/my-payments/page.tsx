'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import MyPayments from '../../components/tables/MyPayments';



const SamplePage = () => {
  return (
    <PageContainer title="My Payments" description="All payments">
      <DashboardCard >
        <MyPayments/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

