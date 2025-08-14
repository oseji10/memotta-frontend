'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import AttendancePage from '../../components/tables/Attendance';



const SamplePage = () => {
  return (
    <PageContainer title="Applications" description="All Applications" allowedRoles={['ADMIN', 'VERIFICATION']}>
      <DashboardCard >
        <AttendancePage/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

