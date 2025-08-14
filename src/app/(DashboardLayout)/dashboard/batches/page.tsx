'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Cadres from '@/app/(DashboardLayout)/components/tables/JAMB';
import JAMB from '@/app/(DashboardLayout)/components/tables/JAMB';
import Batches from '../../components/tables/Batches';



const SamplePage = () => {
  return (
    <PageContainer title="Batches" description="All batches" allowedRoles={['ADMIN']}>
      <DashboardCard >
        <Batches/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

