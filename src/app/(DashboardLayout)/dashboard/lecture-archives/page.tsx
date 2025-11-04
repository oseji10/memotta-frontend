'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import Courses from '../../components/tables/Courses';
import LectureArchive from '../../components/tables/LectureArchive';



const SamplePage = () => {
  return (
    <PageContainer title="Courses" description="Lecture Archives">
      <DashboardCard >
        <LectureArchive/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

