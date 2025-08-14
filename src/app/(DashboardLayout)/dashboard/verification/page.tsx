'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Applications from '../../components/tables/Applications';
import Verification from '../../components/tables/Verification';



const SamplePage = () => {
  return (
    <PageContainer title="Verification" description="All Applications" allowedRoles={['ADMIN', 'VERIFICATION']}>
      <DashboardCard >
        <Verification/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

