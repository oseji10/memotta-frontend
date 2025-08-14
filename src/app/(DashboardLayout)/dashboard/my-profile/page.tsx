'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import MyProfile from '../../components/tables/MyProfile';



const SamplePage = () => {
  return (
    <PageContainer title="My Profile" description="Profile page">
      <DashboardCard >
        <MyProfile/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

