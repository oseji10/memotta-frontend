"use client";

import { Grid, Box, Card, Stack, Typography, Button } from "@mui/material";


import Logo from "./(DashboardLayout)/dashboard/layout/shared/logo/Logo";
import AuthLogin from "./authentication/auth/AuthLogin";

const Login2 = () => {
  return (
    
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          backgroundImage: "url('/images/fctson33.png')",
          backgroundSize: "contain",
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            // background: "linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2))",
            zIndex: 0,
          },
        }}
      >
        <Grid
          container
          spacing={0}
          sx={{ height: "100vh" }}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Grid
            item
            xs={12}
            sm={10}
            md={6}
            lg={4}
            xl={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ pr: { xs: 2, md: 4 }, pl: { xs: 2, md: 0 } }}
          >
            <Card
              elevation={12}
              sx={{
                p: 4,
                zIndex: 1,
                width: "100%",
                maxWidth: "450px",
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ mb: 2 }}
              >
                <Logo />
              </Box>
              <Typography
                variant="h5"
                textAlign="center"
                color="primary.main"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Welcome Back!
              </Typography>
              {/* <Typography
                variant="subtitle1"
                textAlign="center"
                color="textSecondary"
                sx={{ mb: 3 }}
              >
                Sign in to continue your journey
              </Typography> */}
              <AuthLogin
                subtext={
                  <Typography
                    variant="body2"
                    textAlign="center"
                    color="textSecondary"
                    sx={{ mb: 2, fontStyle: "italic" }}
                  >
                    Enter your credentials to access your account
                  </Typography>
                }
                subtitle={
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    mt={3}
                  >
                    
                   
                  </Stack>
                }
              />
         
            </Card>
          </Grid>
        </Grid>
      </Box>
    
  );
};

export default Login2;