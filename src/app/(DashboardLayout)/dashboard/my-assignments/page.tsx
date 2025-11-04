'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';


import Cadres from '@/app/(DashboardLayout)/components/tables/JAMB';
import Apply from '../../components/tables/Apply';
import MyExamSlips from '../../components/tables/MySlips';
import Assessments from '../../components/tables/Assessments';
import AssignmentPage from '../../components/tables/MyAssignment';



const SamplePage = () => {
  return (
    <PageContainer title="My Assignments" description="My assignments page">
      <DashboardCard >
        <AssignmentPage/>
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

