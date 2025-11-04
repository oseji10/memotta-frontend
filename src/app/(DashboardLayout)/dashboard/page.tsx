'use client'
import { Grid, Box, Typography, Button } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components
import SignedUp from '../components/dashboard/SignedUp';
import CompletedForms from '../components/dashboard/CompletedForms';
import CompletedPayments from '../components/dashboard/CompletedPayments';
import CashGenerated from '../components/dashboard/CashGenerated';
import BatchedCandidates from '../components/dashboard/BatchedCandidates';
import ReBatchedCandidates from '../components/dashboard/ReBatchedCandidates';
import RecentPayments from '../components/dashboard/RecentPayments';
import { getRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ArrowForward } from '@mui/icons-material';
import UpcomingAssessments from '../components/dashboard/UpcomingAssessments';

const Dashboard = () => {
  const role = getRole(); // Get role from auth context
  const router = useRouter();
  
  const studentButtons = [
    {
      title: "My Profile",
      description: "View and edit my profile",
      url: "/dashboard/my-profile",
      color: "secondary",
      icon: <ArrowForward />
    },
    {
      title: "My Courses",
      description: "View all my courses",
      url: "/dashboard/my-courses",
      color: "primary",
      icon: <ArrowForward />
    },
    {
      title: "My Payments",
      description: "View payment records and transactions",
      url: "/dashboard/my-payments",
      color: "secondary",
      icon: <ArrowForward />
    },
    {
      title: "Resources",
      description: "View all available resources",
      url: "/dashboard/",
      color: "secondary",
      icon: <ArrowForward />
    },
    {
      title: "Lecture Archive",
      description: "View all lecture recordings",
      url: "/dashboard/lecture-archives",
      color: "secondary",
      icon: <ArrowForward />
    },
    {
      title: "Assessments",
      description: "View all my assessments",
      url: "/dashboard/my-assessments",
      color: "secondary",
      icon: <ArrowForward />
    },
   
    
    {
      title: "Certificates",
      description: "View and download my certificates",
      url: "/dashboard/my-certificates",
      color: "secondary",
      icon: <ArrowForward />
    },
     {
      title: "Job Opportunities",
      description: "View job opportunities and applications",
      url: "/dashboard/",
      color: "secondary",
      icon: <ArrowForward />
    },
  ];

  // Define which components to show based on role
  const getDashboardCards = () => {
    switch(role) {
      case 'ADMIN':
        return (
          <>
            <Grid item xs={12} lg={4}>
              <SignedUp />
            </Grid>
            <Grid item xs={12} lg={4}>
              <CompletedForms />
            </Grid>
            <Grid item xs={12} lg={4}>
              <CompletedPayments />
            </Grid>
            {/* <Grid item xs={12} lg={4}>
              <CashGenerated />
            </Grid>
            <Grid item xs={12} lg={4}>
              <BatchedCandidates />
            </Grid>
            <Grid item xs={12} lg={4}>
              <ReBatchedCandidates />
            </Grid> */}
            <Grid item xs={12} lg={12}>
              <RecentPayments />
            </Grid>
          </>
        );
      
      case 'STAFF':
        return (
          <>
            <Grid item xs={12} lg={6}>
              <SignedUp />
            </Grid>
            <Grid item xs={12} lg={6}>
              <CompletedForms />
            </Grid>
            <Grid item xs={12} lg={6}>
              <CompletedPayments />
            </Grid>
            <Grid item xs={12} lg={6}>
              <CashGenerated />
            </Grid>
            <Grid item xs={12} lg={12}>
              <RecentPayments />
            </Grid>
          </>
        );
      
      case 'STUDENT':
        return (
          <>
            {studentButtons.map((button, index) => (
              <Grid item xs={12} lg={6} key={index}>
                <Button
                  fullWidth
                  variant="contained"
                  color={button.color}
                  onClick={() => router.push(button.url)}
                  sx={{
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    p: 4,
                    textTransform: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  <Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {button.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {button.description}
                    </Typography>
                  </Box>
                  <Box sx={{ alignSelf: 'flex-end' }}>
                    {button.icon}
                  </Box>
                </Button>
              </Grid>
            ))}
            <Grid item xs={12} lg={12}>
              <UpcomingAssessments />
            </Grid>
          </>
        );
      
      default:
        return (
          <Grid item xs={12}>
            <Box p={4} textAlign="center">
              <Typography variant="h6">No dashboard content available for your role</Typography>
            </Box>
          </Grid>
        );
    }
  };

  return (
    <PageContainer title="Dashboard" description="Memotta Dashboard">
      <Box>
        <Grid container spacing={3}>
          {getDashboardCards()}
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;