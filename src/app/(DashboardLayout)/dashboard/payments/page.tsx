'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Payments from '../../components/tables/Payments';



const SamplePage = () => {
  return (
    <PageContainer title="Payments" description="All Payments" allowedRoles={['ADMIN']}>
      <DashboardCard >
        <Payments/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

