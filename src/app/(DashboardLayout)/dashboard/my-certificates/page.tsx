'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Certificates from '../../components/tables/MyCertificates';



const SamplePage = () => {
  return (
    <PageContainer title="My Courses" description="Courses page">
      <DashboardCard >
        <Certificates/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

