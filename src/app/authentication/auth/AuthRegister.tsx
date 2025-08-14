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
  MenuItem,
  TextField,
  Grid,
} from "@mui/material";
import Link from "next/link";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import axios from "axios";

interface registerType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [applicationType, setApplicationType] = useState("");
  const [jambId, setJambId] = useState("");
  const [validatingJamb, setValidatingJamb] = useState(false);
  const [jambValidated, setJambValidated] = useState(false);
  const [jambData, setJambData] = useState({
    fullName: "",
    stateOfOrigin: "",
    gender: ""
  });

  // Form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherNames: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    yearOfGraduation: "",
    licenseNumber: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleApplicationTypeChange = (e) => {
    setApplicationType(e.target.value);
    setJambValidated(false);
    setJambId("");
    setJambData({
      fullName: "",
      stateOfOrigin: "",
      gender: ""
    });
  };

  const validateJambId = async () => {
    if (!jambId) {
      setError("Please enter JAMB ID");
      return;
    }

    setValidatingJamb(true);
    setError(null);

    try {
      // Replace with your actual endpoint
      const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/validate-jamb`, { 
        jambId,
        applicationType 
      });

      if (response.data.success) {
        setJambData({
          fullName: response.data.fullName,
          stateOfOrigin: response.data.stateOfOrigin,
          gender: response.data.gender
        });
        setJambValidated(true);
        setSuccess("JAMB ID validated successfully");
      } else {
        setError(response.data.message || "Invalid JAMB ID");
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setError('Error validating JAMB ID. Please try again.');
    } finally {
      setValidatingJamb(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        applicationType,
        ...formData,
        ...(applicationType === "1" && { jambId, ...jambData })
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/register`,
        payload
      );

      if (response.data.success) {
        setSuccess("Registration successful! You can now login.");
        setFormData({
          firstName: "",
          lastName: "",
          otherNames: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
          yearOfGraduation: "",
          licenseNumber: ""
        });
        setApplicationType("");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 450,
        margin: '0 auto',
      }}
    >
      <Box textAlign="center" mb={4}>
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
        
        {subtext}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            select
            label="Application Type"
            value={applicationType}
            onChange={handleApplicationTypeChange}
            fullWidth
            required
            variant="outlined"
          >
            <MenuItem value="">Select Application Type</MenuItem>
            <MenuItem value="1">ND Nursing</MenuItem>
            <MenuItem value="2">Basic Nursing</MenuItem>
            <MenuItem value="3">Post-Basic Nursing</MenuItem>
          </TextField>

          {applicationType === "1" && (
            <>
              <CustomTextField
                label="JAMB ID"
                value={jambId}
                onChange={(e) => setJambId(e.target.value)}
                fullWidth
                required
                disabled={jambValidated}
              />

              {!jambValidated && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={validateJambId}
                  disabled={validatingJamb || !jambId}
                  startIcon={validatingJamb ? <CircularProgress size={20} /> : null}
                  sx={{ py: 1.5 }}
                >
                  {validatingJamb ? "Validating..." : "Validate JAMB ID"}
                </Button>
              )}

              {jambValidated && (
                <>
                  <CustomTextField
                    label="Full Name"
                    value={jambData.fullName}
                    fullWidth
                    disabled
                  />
                  <CustomTextField
                    label="State of Origin"
                    value={jambData.stateOfOrigin}
                    fullWidth
                    disabled
                  />
                  <CustomTextField
                    label="Gender"
                    value={jambData.gender}
                    fullWidth
                    disabled
                  />
                </>
              )}
            </>
          )}

          {(applicationType === "2" || applicationType === "3") && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  label="Other Names"
                  value={formData.otherNames}
                  onChange={(e) => setFormData({...formData, otherNames: e.target.value})}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}

          {applicationType === "3" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Year of Graduation"
                  type="number"
                  value={formData.yearOfGraduation}
                  onChange={(e) => setFormData({...formData, yearOfGraduation: e.target.value})}
                  fullWidth
                  required
                  inputProps={{ min: "1900", max: new Date().getFullYear() }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          )}

          {(applicationType && (applicationType !== "1" || jambValidated)) && (
            <>
              <CustomTextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                fullWidth
                required
              />

              <CustomTextField
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                fullWidth
                required
              />

              <CustomTextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <CustomTextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          <Button
            type="submit"
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting || 
              !applicationType || 
              (applicationType === "1" && !jambValidated) ||
              (applicationType !== "1" && (!formData.firstName || !formData.lastName)) ||
              !formData.email || 
              !formData.phoneNumber || 
              !formData.password || 
              formData.password !== formData.confirmPassword
            }
            sx={{
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </Stack>
      </form>

      {subtitle}
    </Box>
  );
};

export default AuthRegister;