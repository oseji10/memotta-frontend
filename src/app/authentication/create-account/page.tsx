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

  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Logo from "@/app/(DashboardLayout)/dashboard/layout/shared/logo/Logo";
import axios from "axios";

const Register2 = () => {
  const theme = useTheme();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

  const [applicationType, setApplicationType] = useState("");
  const [jambId, setJambId] = useState("");
  const [validatingJamb, setValidatingJamb] = useState(false);
  const [jambValidated, setJambValidated] = useState(false);
  const [jambData, setJambData] = useState({
    firstName: "",
    lastName: "",
    otherNames: "",
    state: "",
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
      firstName: "",
      lastName: "",
      otherNames: "",
      state: "",
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/verify-jamb`, { 
        jambId
      });

      if (response.data) {
        setJambData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          otherNames: response.data.otherNames || '',
          state: response.data.state,
          gender: response.data.gender
        });
        setJambValidated(true);
        setSuccess("JAMB ID validated successfully");
      } else {
        setError("Invalid JAMB ID");
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setError(error.response?.data?.message || 'Error validating JAMB ID. Please try again.');
    } finally {
      setValidatingJamb(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
     setErrors({});

    try {
      const payload = {
        applicationType,
        ...formData,
        ...(applicationType === "1" && { 
          jambId,
          firstName: jambData.firstName,
          lastName: jambData.lastName,
          otherNames: jambData.otherNames,
          stateOfOrigin: jambData.state,
          gender: jambData.gender
        })
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/users/register`,
        payload
      );

      if (response.data.status === "success") {
        // setSuccess("Registration successful! Redirecting to login...");
        // setTimeout(() => router.push("/authentication/login"), 2000);
        setSuccessMessage(response.data.message || "Registration successful!");
      setOpenSuccessModal(true);
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration failed:', error);if (error.response?.data?.errors) {
      // Handle validation errors from backend
      setErrors(error.response.data.errors);
    } else if (error.response?.data?.message) {
      // Handle other error messages
      setError(error.response.data.message);
    } else {
      setError('Registration failed. Please try again.');
    }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage: "url('/images/fctson33.png')",
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
          background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.95) 50%)",
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
          Create Account
        </Typography>

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
              <MenuItem value="2">Basic Midwifery</MenuItem>
              <MenuItem value="3">Post-Basic Nursing</MenuItem>
            </TextField>

            {applicationType === "1" && (
              <>
                <TextField
                  label="JAMB ID"
                  value={jambId}
                  onChange={(e) => setJambId(e.target.value)}
                  fullWidth
                  required
                  disabled={jambValidated}
                  variant="outlined"
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
                    <TextField
                      label="First Name"
                      value={jambData.firstName}
                      fullWidth
                      disabled
                      variant="outlined"
                    />
                    <TextField
                      label="Last Name"
                      value={jambData.lastName}
                      fullWidth
                      disabled
                      variant="outlined"
                    />
                    <TextField
                      label="Other Names"
                      value={jambData.otherNames}
                      fullWidth
                      disabled
                      variant="outlined"
                    />
                    <TextField
                      label="State of Origin"
                      value={jambData.state}
                      fullWidth
                      disabled
                      variant="outlined"
                    />
                    <TextField
                      label="Gender"
                      value={jambData.gender}
                      fullWidth
                      disabled
                      variant="outlined"
                    />
                  </>
                )}
              </>
            )}

            {(applicationType === "2" || applicationType === "3") && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Other Names"
                    value={formData.otherNames}
                    onChange={(e) => setFormData({...formData, otherNames: e.target.value})}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            )}

            {applicationType === "3" && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Year of Graduation"
                    type="number"
                    value={formData.yearOfGraduation}
                    onChange={(e) => setFormData({...formData, yearOfGraduation: e.target.value})}
                    fullWidth
                    required
                    variant="outlined"
                    inputProps={{ min: "1900", max: new Date().getFullYear() }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="License Number"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            )}

            {(applicationType && (applicationType !== "1" || jambValidated)) && (
              <>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!errors.email}
                  helperText={errors.email}
                />

                <TextField
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  fullWidth
                  required
                  variant="outlined"
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
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

                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  fullWidth
                  required
                  variant="outlined"
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
              sx={{ py: 1.5, fontWeight: 600, mt: 2 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Typography textAlign="center" sx={{ pb: 2 }}>
              Already have an account?{' '}
              <Link href="/authentication/login" passHref>
                <Typography 
                  component="a"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Sign In
                </Typography>
              </Link>
            </Typography>
          </Stack>
        </form>
      </Box>

      {/* Success Modal */}
<Dialog
  open={openSuccessModal}
  onClose={() => {
    setOpenSuccessModal(false);
    router.push("/authentication/login");
  }}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700 }}>
    Registration Successful
  </DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      {successMessage}
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => {
        setOpenSuccessModal(false);
        router.push("/authentication/login");
      }}
      color="primary"
      autoFocus
      variant="contained"
    >
      Continue to login
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default Register2;