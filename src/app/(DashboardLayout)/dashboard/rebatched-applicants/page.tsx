'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Applications from '../../components/tables/Applications';
import RebatchedApplicants from '../../components/tables/RebatchedApplicants';



const SamplePage = () => {
  return (
    <PageContainer title="Rebatched Applicants" description="All Rebatched Applications" allowedRoles={['ADMIN']}>
      <DashboardCard >
        <RebatchedApplicants/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

