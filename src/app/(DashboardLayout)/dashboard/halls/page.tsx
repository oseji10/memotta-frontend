'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Halls from '../../components/tables/Halls';



const SamplePage = () => {
  return (
    <PageContainer title="Halls" description="All Halls" allowedRoles={['ADMIN']}>
      <DashboardCard >
        <Halls/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

