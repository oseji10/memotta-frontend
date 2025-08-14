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
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import axios from "axios";
import Image from "next/image";
import logo from "@/assets/images/logos/logo.png";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
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
        maxWidth: 450,
        margin: '0 auto',
        padding: 4,
        boxShadow: theme.shadows[10],
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Box textAlign="center" mb={4}>
        <Box mb={2}>
          <Image src={logo} alt="logo" width={80} height={80} />
        </Box>
        {title && (
          <Typography 
            variant="h4" 
            fontWeight="700" 
            color="primary.main"
            gutterBottom
          >
            {title}
          </Typography>
        )}
        
        {subtext && (
          <Typography variant="subtitle1" color="textSecondary" mt={1}>
            {subtext}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="username" mb="8px">
              Email
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              id="username"
              placeholder="Enter your email"
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="8px">
              Password
            </Typography>
            <CustomTextField
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              id="password"
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
          </Box>

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
              borderRadius: 1,
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

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
          </Divider>

          <Typography textAlign="center" variant="body2">
            Don't have an account?{' '}
            <Link href="/" passHref>
              <Typography 
                component="a"
                sx={{
                  color: "secondary.main",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Sign Up
              </Typography>
            </Link>
          </Typography>
        </Stack>
      </form>

      {subtitle}
    </Box>
  );
};

export default AuthLogin;