'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Cadres from '@/app/(DashboardLayout)/components/tables/JAMB';
import Apply from '../../components/tables/Apply';
import MyExamSlips from '../../components/tables/MySlips';
import MyCourses from '../../components/tables/MyCourses';



const SamplePage = () => {
  return (
    <PageContainer title="My Courses" description="Courses page">
      <DashboardCard >
        <MyCourses/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

