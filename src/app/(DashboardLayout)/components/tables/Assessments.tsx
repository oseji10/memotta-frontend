'use client'
import { Grid, Box, Typography, Button } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components

import { getRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ArrowForward, Assessment } from '@mui/icons-material';


const Assessments = () => {
  const role = getRole(); // Get role from auth context
  const router = useRouter();
  
  const studentButtons = [
    {
      title: "My Assignments",
      description: "View and upload my assignments",
      url: "/dashboard/my-assignments",
      color: "secondary",
      icon: <ArrowForward />
    },
    {
      title: "Group Assignments",
      description: "View all group assignments",
      url: "/dashboard/group-assignments",
      color: "primary",
      icon: <ArrowForward />
    },
    {
      title: "Quizzes",
      description: "View all my quizzes",
      url: "/dashboard/my-quizzes",
      color: "secondary",
      icon: <ArrowForward />
    },
    {
      title: "Exams",
      description: "View all my exams",
      url: "/dashboard/my-exams",
      color: "secondary",
      icon: <ArrowForward />
    },
   
  ];

  // Define which components to show based on role
  const getDashboardCards = () => {
    switch(role) {
      
      
      
      
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

export default Assessments;