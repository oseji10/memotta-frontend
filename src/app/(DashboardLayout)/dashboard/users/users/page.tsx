'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Users from '@/app/(DashboardLayout)/components/tables/Users';

const SamplePage = () => {
  return (
    <PageContainer title="Users" description="List of Users">
      <DashboardCard >
        <Users/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

