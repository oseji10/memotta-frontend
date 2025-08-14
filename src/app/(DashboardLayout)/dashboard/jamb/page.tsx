'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Cadres from '@/app/(DashboardLayout)/components/tables/JAMB';
import JAMB from '@/app/(DashboardLayout)/components/tables/JAMB';



const SamplePage = () => {
  return (
    <PageContainer title="JAMB Data" description="JAMB Uploaded Data" allowedRoles={['ADMIN']}>
      <DashboardCard >
        <JAMB/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

