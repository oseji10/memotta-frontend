"use client";

import { Grid, Box, Card, Stack, Typography, Button, FormControlLabel, Checkbox, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, MenuItem, Select, FormControl, InputLabel, Paper, Divider, Chip, LinearProgress, Radio, RadioGroup, FormLabel, Alert } from "@mui/material";
import { Home as HomeIcon, CalendarToday, AccessTime, MonetizationOn, ArrowForward, ArrowBack, CreditCard, AccountBalance, CheckCircle } from "@mui/icons-material";
import Logo from "./(DashboardLayout)/dashboard/layout/shared/logo/Logo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

const Home = () => {
  const [checked, setChecked] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    otherNames: '',
    maritalStatus: '',
    gender: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    stateOfOrigin: '',
    email: '',
    password: '',
    educationalQualification: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Nigerian states for dropdown
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 
    'Zamfara'
  ];

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const router = useRouter();
  const handleLoginClick = () => router.push("/authentication/login");
  const handleCreateAccountClick = () => router.push("/authentication/create-account");

  // Fetch courses from API endpoint
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses/available');
        const formattedCourses = response.data.map(item => ({
          id: item.cohortCourseId,
          cohort: item.cohorts.cohortName,
          cohortId: item.cohorts.cohortId,
          name: item.courses.courseName,
          cost: parseFloat(item.courses.cost),
          startDate: item.startDate,
          duration: item.courses.duration,
          description: item.courses.description,
          endDate: item.endDate
        }));
        setCourses(formattedCourses);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Generate transaction reference when payment method is selected
  useEffect(() => {
    if (selectedCourse && paymentMethod === 'transfer') {
      setTransactionReference(`MEMOTTA-${selectedCourse.id}-${Date.now()}`);
    } else {
      setTransactionReference('');
    }
  }, [paymentMethod, selectedCourse]);

  const handleRegisterClick = (course) => {
    setSelectedCourse(course);
    setFormError('');
    setSuccessMessage('');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setPaymentMethod('');
    setPaymentProof(null);
    setPreviewUrl(null);
    setFormError('');
    setSuccessMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setPaymentProof(null);
    setPreviewUrl(null);
    setFormError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
        setFormError("Please upload a valid file (JPEG, PNG, or PDF).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError("File size must be less than 5MB.");
        return;
      }
      setPaymentProof(file);
      setFormError("");
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const copyTransactionReference = () => {
    if (transactionReference) {
      navigator.clipboard.writeText(transactionReference);
      setSuccessMessage('Transaction reference copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    // Basic validation
    if (!paymentMethod) {
        setFormError("Please select a payment method");
        setIsSubmitting(false);
        return;
    }

    try {
        let response;
        const payload = {
            ...formData,
            courseId: selectedCourse.id,
            cohortId: selectedCourse.cohortId,
            courseName: selectedCourse.name,
            amount: selectedCourse.cost,
            paymentMethod,
            transactionReference
        };

        if (paymentMethod === 'transfer') {
            // For transfer method only
            response = await api.post('/payment/notify-transfer', payload);
            
            // Handle successful response
            const userData = {
              firstName: response.data.user.firstName,
              lastName: response.data?.user?.lastName,
              otherNames: response.data?.user?.otherNames,
              email: response.data?.user?.email,
              phoneNumber: response.data?.user?.phoneNumber,
              role: response.data?.user?.user_role?.roleName,
              access_token: response.data?.access_token,
            };
            
            if (response.data.access_token) {
                localStorage.setItem('user', JSON.stringify(userData));
                
                setSuccessMessage("Payment notification sent successfully! You're now logged in.");
                router.push('/dashboard');
            } else {
                setSuccessMessage("Payment notification sent successfully! Please login with your credentials.");
            }
        }
    } catch (err) {
        console.error("Payment error:", err);
        let errorMessage = "Payment processing failed. Please try again.";
        
        if (err.response) {
            if (err.response.data?.errors?.email) {
                errorMessage = err.response.data.errors.email[0];
            } else if (err.response.data?.errors?.phoneNumber) {
                errorMessage = err.response.data.errors.phoneNumber[0];
            } else if (err.response.data?.message) {
                errorMessage = err.response.data.message;
            }
        }
        
        setFormError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (selectedCourse) {
    return (
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
          p: { xs: 2, md: 4 },
        }}
      >
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Card
              elevation={4}
              sx={{
                p: { xs: 3, md: 6 },
                mb: 4,
                background: "#fff",
                borderRadius: 4,
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Box display="flex" justifyContent="center" mb={4}>
                <Logo />
              </Box>

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  textAlign: "center",
                  mb: 4,
                  background: "linear-gradient(90deg, #1976d2, #2196f3)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Course Registration
              </Typography>

              <Paper elevation={0} sx={{ mb: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: 3, borderLeft: "4px solid #1976d2" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "primary.dark", display: "flex", alignItems: "center", gap: 1 }}>
                  <ArrowForward color="primary" /> Course Summary
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Course" color="primary" size="small" /> {selectedCourse.name}
                  </Typography>
                  <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Cohort" color="secondary" size="small" /> {selectedCourse.cohort}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" /> 
                      <strong>Starts:</strong> {new Date(selectedCourse.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" /> 
                      <strong>Ends:</strong> {new Date(selectedCourse.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime fontSize="small" color="action" /> 
                      <strong>Duration:</strong> {selectedCourse.duration}
                    </Typography>
                  </Box>
                  {selectedCourse.description && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Description:</Typography>
                      <Typography variant="body2">{selectedCourse.description}</Typography>
                    </Box>
                  )}
                  <Typography variant="body1" sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <MonetizationOn fontSize="small" color="success" /> 
                    <strong>Cost:</strong> ₦{selectedCourse.cost.toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>

              <form onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.secondary", mb: 3 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={3}>
                  {/* Personal Info Fields */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Other Names"
                      name="otherNames"
                      value={formData.otherNames}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  
                  {/* Contact Info Fields */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.secondary" }}>
                      Contact Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Alternate Phone Number"
                      name="alternatePhoneNumber"
                      type="tel"
                      value={formData.alternatePhoneNumber}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>State of Origin</InputLabel>
                      <Select
                        name="stateOfOrigin"
                        value={formData.stateOfOrigin}
                        label="State of Origin"
                        onChange={handleInputChange}
                        required
                      >
                        {nigerianStates.map(state => (
                          <MenuItem key={state} value={state}>{state}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Additional Info Fields */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.secondary" }}>
                      Additional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Marital Status</InputLabel>
                      <Select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        label="Marital Status"
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Married">Married</MenuItem>
                        <MenuItem value="Divorced">Divorced</MenuItem>
                        <MenuItem value="Widowed">Widowed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        label="Gender"
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Educational Qualification</InputLabel>
                      <Select
                        name="educationalQualification"
                        value={formData.educationalQualification}
                        label="Educational Qualification"
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="SSCE">SSCE</MenuItem>
                        <MenuItem value="OND">OND</MenuItem>
                        <MenuItem value="HND">HND</MenuItem>
                        <MenuItem value="BSc">BSc</MenuItem>
                        <MenuItem value="MSc">MSc</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  
                  {/* Payment Section - Only Bank Transfer enabled */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.secondary" }}>
                      Payment Method
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        {/* Pay Online option commented out */}
                        {/* <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                          <FormControlLabel
                            value="online"
                            control={<Radio color="primary" />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CreditCard color="primary" />
                                <Typography>Pay Online (Credit/Debit Card)</Typography>
                              </Box>
                            }
                          />
                          {paymentMethod === 'online' && (
                            <Typography variant="body2" sx={{ mt: 1, ml: 4, color: 'text.secondary' }}>
                              You will be redirected to our secure payment gateway
                            </Typography>
                          )}
                        </Paper> */}

                        {/* Bank Transfer option - only active payment method */}
                        <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                          <FormControlLabel
                            value="transfer"
                            control={<Radio color="primary" />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccountBalance color="primary" />
                                <Typography>Bank Transfer</Typography>
                              </Box>
                            }
                          />
                          {paymentMethod === 'transfer' && (
                            <Box sx={{ mt: 2, ml: 4 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>Bank Details:</Typography>
                              <Typography variant="body2">Bank: Zenith Bank</Typography>
                              <Typography variant="body2">Account Name: Memotta N Nig Ltd</Typography>
                              <Typography variant="body2">Account Number: 1228905566</Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Reference:</strong> {transactionReference}
                                <Button 
                                  size="small" 
                                  onClick={copyTransactionReference}
                                  sx={{ ml: 1 }}
                                >
                                  Copy
                                </Button>
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                Please include the reference in your transfer
                              </Typography>
                            </Box>
                          )}
                        </Paper>

                        {/* Already Paid option commented out */}
                        {/* <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                          <FormControlLabel
                            value="paid"
                            control={<Radio color="primary" />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle color="primary" />
                                <Typography>Already Paid</Typography>
                              </Box>
                            }
                          />
                          {paymentMethod === 'paid' && (
                            <Box sx={{ mt: 2, ml: 4 }}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Upload proof of payment (screenshot or receipt)
                              </Typography>
                              <input
                                accept="image/*,.pdf"
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="payment-proof-upload"
                              />
                              <label htmlFor="payment-proof-upload">
                                <Button variant="outlined" component="span">
                                  Upload Proof
                                </Button>
                              </label>
                              {previewUrl && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2">Preview:</Typography>
                                  <img 
                                    src={previewUrl} 
                                    alt="Payment proof" 
                                    style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '8px' }}
                                  />
                                </Box>
                              )}
                              {paymentProof && !previewUrl && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  PDF file uploaded
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Paper> */}

                        <Paper elevation={0} sx={{ p: 3, mt: 4, backgroundColor: '#fff8e1', borderRadius: 3, borderLeft: "4px solid #ffc107" }}>
                          <Typography variant="body1" paragraph sx={{ fontWeight: 600 }}>
                            Note: All payments are secure and processed through Flutterwave payment gateway.
                          </Typography>
                          <Typography variant="body1">
                            For any inquiries, please contact support@memotta.com.ng or call +234 703 433 3837 or +234 813 705 4875.
                          </Typography>
                        </Paper>
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Success Message */}
                {successMessage && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {successMessage}
                  </Alert>
                )}

                {/* Error Message */}
                {formError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {formError}
                  </Alert>
                )}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackToCourses}
                    sx={{ px: 4, borderRadius: 2 }}
                    startIcon={<ArrowBack />}
                  >
                    Back to Courses
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ px: 4, borderRadius: 2, boxShadow: 'none' }}
                    disabled={isSubmitting}
                    endIcon={<ArrowForward />}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Registration'}
                  </Button>
                </Box>
              </form>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
        p: { xs: 2, md: 4 },
      }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <Card
            elevation={4}
            sx={{
              p: { xs: 3, md: 6 },
              mb: 4,
              background: "#fff",
              borderRadius: 4,
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Box display="flex" justifyContent="center" mb={4}>
              <Logo />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 4,
                background: "linear-gradient(90deg, #1976d2, #2196f3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to Memotta Digital Skills Academy
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
              Transform your career with our industry-leading digital skills training programs
            </Typography>

            <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#f8fafc', borderRadius: 3 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: "primary.dark",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <ArrowForward color="primary" /> Application Process
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
                {[
                  "Review available courses and select your program",
                  "Click Register Now for your chosen course",
                  "Complete the registration form with your details",
                  "Select payment method and complete payment",
                  "Receive confirmation email with enrollment details"
                ].map((step, index) => (
                  <Paper key={index} elevation={0} sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, borderLeft: "3px solid #1976d2" }}>
                    <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label={index + 1} color="primary" size="small" /> {step}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>

            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: "primary.dark",
                mt: 4,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <ArrowForward color="primary" /> Available Courses
            </Typography>

            {loading ? (
              <Box sx={{ width: '100%', py: 4 }}>
                <LinearProgress />
                <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>Loading courses...</Typography>
              </Box>
            ) : error ? (
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffebee', borderRadius: 2, mb: 4 }}>
                <Typography variant="body1" color="error" textAlign="center">
                  Error: {error}
                </Typography>
              </Paper>
            ) : courses.length === 0 ? (
              <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fff8e1', borderRadius: 2, mb: 4 }}>
                <Typography variant="body1" textAlign="center">
                  No courses available at the moment. Please check back later.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #e0e0e0" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Cohort</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Course Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Chip label={course.cohort} color="secondary" size="small" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{course.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CalendarToday fontSize="small" color="action" />
                            {new Date(course.startDate).toLocaleDateString()}
                          </Box>
                        </TableCell>
                        <TableCell>{course.duration}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <MonetizationOn fontSize="small" color="success" />
                            ₦{course.cost.toLocaleString()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleRegisterClick(course)}
                            endIcon={<ArrowForward />}
                            sx={{ borderRadius: 2, boxShadow: 'none' }}
                          >
                            Register
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ mt: 6, textAlign: "center" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ px: 4, borderRadius: 2 }}
                  onClick={handleLoginClick}
                  startIcon={<HomeIcon />}
                >
                  Login
                </Button>
              </Stack>
            </Box>
          </Card>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: "text.secondary", mt: 2 }}
          >
            © 2025. Memotta Digital Skills Academy.
            <br />
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              Empowering the digital workforce of tomorrow.
            </Typography>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;