'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Applications from '../../components/tables/Applications';



const SamplePage = () => {
  return (
    <PageContainer title="Applications" description="All Applications" allowedRoles={['ADMIN']}>
      <DashboardCard >
        <Applications/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

