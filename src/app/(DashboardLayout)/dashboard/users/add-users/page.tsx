'use client';
import { Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
// import NomineesTable from '../../components/tables/HospitalsTable';
// import AddNomineeForm from '../../components/forms/theme-elements/AddNominee';


const SamplePage = () => {
  return (
    <PageContainer title="Nominees" description="Nomination Form">
      <DashboardCard >
        {/* <Typography>All Nominees</Typography> */}
        {/* <AddNomineeForm/> */}
      </DashboardCard>
    </PageContainer>
  );
};

export default SamplePage;

