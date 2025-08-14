"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Logo from "@/app/(DashboardLayout)/dashboard/layout/shared/logo/Logo";
import axios from "axios";

const AuthLogin = () => {
  const theme = useTheme();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/signin`,
        { username, password },
        { withCredentials: true }
      );
      
      const userData = {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        otherNames: response.data.otherNames,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        role: response.data.role,
        applicationType: response.data.applicationType,
        access_token: response.data.access_token,
        // lga: response.data.lga,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage: "url('/images/memotta3.jpg')",
        backgroundSize: "contain",
        backgroundPosition: "left bottom",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        p: 4,
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.95) 50%)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          maxWidth: 500,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "rgba(255, 255, 255, 0.98)",
          borderRadius: 4,
          boxShadow: theme.shadows[10],
          p: 4,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.primary.main,
            borderRadius: "3px",
          },
        }}
      >
        <Box display="flex" justifyContent="center" mb={4}>
          <Logo sx={{ width: 180, height: 'auto' }} />
        </Box>

        <Typography variant="h4" fontWeight="700" textAlign="center" mb={2}>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <Stack spacing={3}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter your Email"
            />

            <TextField
              type={showPassword ? "text" : "password"}
              label="Password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter your password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="right">
              <Link href="/authentication/forgot-password" passHref>
                <Typography 
                  component="a"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Forgot Password?
                </Typography>
              </Link>
            </Box>

            <Button
              type="submit"
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting || !username || !password}
              sx={{
                py: 1.5,
                fontWeight: 600,
                mt: 2,
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Typography textAlign="center" sx={{ pb: 2 }}>
              Don't have an account?{' '}
              <Link href="/" passHref>
                <Typography 
                  component="a"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Create one
                </Typography>
              </Link>
            </Typography>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default AuthLogin;