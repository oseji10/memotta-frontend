'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Courses from '../../components/tables/Courses';



const SamplePage = () => {
  return (
    <PageContainer title="Courses" description="All Courses" allowedRoles={['ADMIN']}>
      <DashboardCard >
        <Courses/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

