import {
    Typography, Box,
    Button,
    TextField,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Avatar,
    Grid,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useRouter } from 'next/navigation';
import { getApplicationType, getCandidateName, getEmail, getPhoneNumber, getRole } from '@/lib/auth';
const steps = ['Biodata', 'Exam Details', 'Photo Upload', 'Summary', 'Payment', 'Exam Slip'];

const Apply = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [rrr, setRrr] = useState<string | null>(null);
    const router = useRouter();
    const [isPaymentVerified, setIsPaymentVerified] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // Mock user data - replace with actual auth functions
    const fullname = getCandidateName();
    
    const email = getEmail();
    const phone = getPhoneNumber();

    // Form data state
    // const [formData, setFormData] = useState({
    //     gender: "",
    //     maritalStatus: "",
    //     dateOfBirth: "",
    //     olevelResults: Array(5).fill({ subject: "", grade: "", examYear: "", examType: "" }),
    //     photo: null as File | null,
    // });

    // Update the initial formData state
const [formData, setFormData] = useState({
    gender: "",
    maritalStatus: "",
    dateOfBirth: "",
    olevelResults: [
        { subject: "Mathematics", grade: "", examYear: "", examType: "" },
        { subject: "English", grade: "", examYear: "", examType: "" },
        { subject: "Biology", grade: "", examYear: "", examType: "" },
        { subject: "Chemistry", grade: "", examYear: "", examType: "" },
        { subject: "Physics", grade: "", examYear: "", examType: "" },
    ],
    photo: null as File | null,
});

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
    const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Geography', 'Government'];
    const grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
    const examTypes = ['WAEC', 'NECO', 'NABTEB', 'GCE'];

// Check payment status
const [isLoading, setIsLoading] = useState(true);
   useEffect(() => {
        const checkPaymentStatus = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/application/status');
                // setPaymentStatus(response.data.status);
                // setApplicationId(response.data.applicationId);
                
                // Redirect to appropriate page based on payment status
                if (response.data.status === 'payment_pending') {
                    router.push('/dashboard/my-payments');
                } else if (response.data.status === 'payment_completed') {
                    router.push('/dashboard/my-exam-slip');
                }
                // If status is 'not_submitted', we remain on this page
            } catch (error: any) {
                setError(error.response?.data?.message || 'Failed to check payment status');
            } finally {
                setIsLoading(false);
            }
        };

        checkPaymentStatus();
    }, [router]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleOlevelChange = (index: number, field: string, value: string) => {
        const newResults = [...formData.olevelResults];
        newResults[index] = { ...newResults[index], [field]: value };
        setFormData({ ...formData, olevelResults: newResults });
    };

    // const addOlevelSubject = () => {
    //     setFormData({
    //         ...formData,
    //         olevelResults: [...formData.olevelResults, { subject: "", grade: "", examYear: "", examType: "" }],
    //     });
    // };

    const addOlevelSubject = () => {
    setFormData({
        ...formData,
        olevelResults: [...formData.olevelResults, { subject: "", grade: "", examYear: "", examType: "" }],
    });
};

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormData({ ...formData, photo: file });
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target) {
                    setPreviewImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const validateBiodata = () => {
        if (!formData.gender) {
            setError('Gender is required');
            return false;
        }
        if (!formData.maritalStatus) {
            setError('Marital Status is required');
            return false;
        }
        if (!formData.dateOfBirth) {
            setError('Date of Birth is required');
            return false;
        }
        return true;
    };

    const validateOlevelResults = () => {
        const requiredSubjects = ["Mathematics", "English", "Biology", "Chemistry", "Physics"];
    const missingRequiredFields = formData.olevelResults
        .filter(r => requiredSubjects.includes(r.subject))
        .some(r => !r.grade || !r.examYear || !r.examType);

    if (missingRequiredFields) {
        setError('Please complete all required subjects (Mathematics, English, Biology, Chemistry, Physics) with grade, exam year and exam type.');
        return false;
    }

        const validResults = formData.olevelResults.filter(
            (r) => r.subject && r.grade && r.examYear && r.examType
        );
        if (validResults.length === 0) {
            setError('At least one complete O\'Level result (Subject, Grade, Exam Year, Exam Type) is required.');
            return false;
        }
        const incompleteResults = formData.olevelResults.filter(
            (r) => (r.subject || r.grade || r.examYear || r.examType) && !(r.subject && r.grade && r.examYear && r.examType)
        );
        if (incompleteResults.length > 0) {
            setError('All O\'Level result entries must have Subject, Grade, Exam Year, and Exam Type filled.');
            return false;
        }
        const subjects = validResults.map((r) => r.subject);
        const uniqueSubjects = new Set(subjects);
        if (uniqueSubjects.size < subjects.length) {
            const duplicates = subjects.filter((item, index) => subjects.indexOf(item) !== index);
            setError(`Duplicate subjects detected: ${duplicates.join(', ')}. Please ensure each subject is entered only once.`);
            return false;
        }
        const examYears = validResults.map((r) => r.examYear);
        const uniqueExamYears = new Set(examYears);
        if (uniqueExamYears.size > 2) {
            setError('You cannot enter results from more than two different exam years.');
            return false;
        }
        const examTypes = validResults.map((r) => r.examType);
        const uniqueExamTypes = new Set(examTypes);
        if (uniqueExamTypes.size > 1) {
            if (uniqueExamTypes.has('NABTEB') && (uniqueExamTypes.has('WAEC') || uniqueExamTypes.has('NECO'))) {
                setError('Invalid exam type combination. NABTEB cannot be combined with WAEC or NECO. Allowed combinations are: WAEC only, NECO only, NABTEB only, or WAEC and NECO.');
                return false;
            }
            if (!uniqueExamTypes.has('WAEC') && !uniqueExamTypes.has('NECO')) {
                setError('Invalid exam type combination. Allowed combinations are: WAEC only, NECO only, NABTEB only, or WAEC and NECO.');
                return false;
            }
        }
        return true;
    };

    
    const handleNext = () => {
        setError(null);
        if (activeStep === 0 && !validateBiodata()) return;
        if (activeStep === 1 && !validateOlevelResults()) return;
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setError(null);
    };

    const handleSubmitRegistration = async () => {
        if (!validateOlevelResults()) return;
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            const formDataToSend = new FormData();
            const completeOlevelResults = formData.olevelResults.filter(
                (r) => r.subject && r.grade && r.examYear && r.examType
            );
            
            // Append all form data
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('maritalStatus', formData.maritalStatus);
            formDataToSend.append('dateOfBirth', formData.dateOfBirth);
            formDataToSend.append('olevelResults', JSON.stringify(completeOlevelResults));
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }
            
            // Include user info
            // formDataToSend.append('fullname', fullname);
            formDataToSend.append('email', email);
            formDataToSend.append('phone', phone);

            const response = await api.post('/apply', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 'success') {
                setApplicationId(response.data.applicationId);
                setSuccess('Application submitted successfully!');
                setIsSubmitted(true);
                handleNext();
            } else {
                throw new Error(response.data.message || 'Submission failed');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to submit application'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const initiatePayment = async () => {
        if (!applicationId) {
            setError('No application ID found. Please submit the form first.');
            setIsPaying(false);
            return;
        }
        
        setIsPaying(true);
        setError(null);
        
        try {
            const response = await api.post('/payment/initiate', {
                applicationId,
            });

            if (response.data.status === 'success') {
                setRrr(response.data.rrr);
                setSuccess('RRR generated successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to initiate payment');
            }
        } catch (error: any) {
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to generate RRR'
            );
        } finally {
            setIsPaying(false);
        }
    };

    const verifyPayment = async () => {
    if (!rrr) {
        setError('No RRR found. Please generate an RRR first.');
        return;
    }
    
    setIsVerifying(true);
    setError(null);
    
    try {
        const response = await api.post('/payment/verify', {
            rrr,
            applicationId,
        });

        if (response.data.status === 'success') {
            setPaymentMessage(response.data.message || 'Payment verified successfully!');
            setSuccess('Payment verified successfully!');
            setIsPaymentVerified(true); // Add this line
            setTimeout(() => {
                handleNext();
            }, 2000);
        } else {
            throw new Error(response.data.message || 'Payment verification failed');
        }
    } catch (error: any) {
        setError(
            error.response?.data?.message || 
            error.message || 
            'Failed to verify payment'
        );
        setIsPaymentVerified(false); // Also handle failure case
    } finally {
        setIsVerifying(false);
    }
};

    const handlePayOnline = () => {
        if (rrr) {
            // window.open(`https://remitademo.net/remita/ecomm/finalize.reg?rrr=${rrr}`, '_blank');
            window.open(`${process.env.NEXT_PUBLIC_API_REMITA_ONLINE}/${rrr}/payment.spa`, '_blank');

        }
    };

    

    const copyToClipboard = () => {
        if (rrr) {
            navigator.clipboard.writeText(rrr);
            setSuccess('RRR copied to clipboard!');
        }
    };

    const downloadExamSlip = async () => {
    if (!applicationId) {
        setError('No application ID found.');
        return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
        const response = await api.get(`/application/slip/${applicationId}`, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setDownloadProgress(percentCompleted);
                }
            }
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ExamSlip-${applicationId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess('Exam slip downloaded successfully!');
    } catch (error: any) {
        setError(
            error.response?.data?.message || 
            error.message || 
            'Failed to download exam slip'
        );
    } finally {
        setIsDownloading(false);
        setDownloadProgress(0);
    }
};
    return (
        <DashboardCard title="Exam Registration">
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => {
                    const stepProps: { completed?: boolean } = {};
                    const labelProps: { optional?: React.ReactNode } = {};
                    
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* Step 1: Biodata */}
            {activeStep === 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Biodata Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={fullname}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={phone}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={email}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        label="Gender"
                                    >
                                        <MenuItem value="">Select Gender</MenuItem>
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Marital Status</InputLabel>
                                    <Select
                                        name="maritalStatus"
                                        value={formData.maritalStatus}
                                        onChange={handleInputChange}
                                        label="Marital Status"
                                    >
                                        <MenuItem value="">Select Status</MenuItem>
                                        {maritalStatuses.map(status => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Exam Details */}
            {activeStep === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            O'Level Results
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Grid container spacing={2} sx={{ mb: 1 }}>
                                <Grid item xs={3}>
                                    <Typography fontWeight="bold">Subject</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography fontWeight="bold">Grade</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography fontWeight="bold">Exam Year</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography fontWeight="bold">Exam Type</Typography>
                                </Grid>
                            </Grid>
                            
                        
{formData.olevelResults.map((result, index) => (
    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
        <Grid item xs={3}>
            <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                    value={result.subject}
                    onChange={(e) => handleOlevelChange(index, 'subject', e.target.value)}
                    label="Subject"
                    disabled={["Mathematics", "English", "Biology", "Chemistry", "Physics"].includes(result.subject)}
                >
                    <MenuItem value="">Select Subject</MenuItem>
                    {subjects.map(sub => (
                        <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
        {/* Rest of the fields remain editable */}
        <Grid item xs={2}>
            <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                    value={result.grade}
                    onChange={(e) => handleOlevelChange(index, 'grade', e.target.value)}
                    label="Grade"
                    required={["Mathematics", "English", "Biology", "Chemistry", "Physics"].includes(result.subject)}
                >
                    <MenuItem value="">Select Grade</MenuItem>
                    {grades.map(grade => (
                        <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={3}>
            <TextField
                fullWidth
                type="number"
                value={result.examYear}
                onChange={(e) => handleOlevelChange(index, 'examYear', e.target.value)}
                placeholder="e.g., 2023"
                required={["Mathematics", "English", "Biology", "Chemistry", "Physics"].includes(result.subject)}
                inputProps={{ min: 1980, max: new Date().getFullYear() }}
            />
        </Grid>
        <Grid item xs={4}>
            <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select
                    value={result.examType}
                    onChange={(e) => handleOlevelChange(index, 'examType', e.target.value)}
                    label="Exam Type"
                    required={["Mathematics", "English", "Biology", "Chemistry", "Physics"].includes(result.subject)}
                >
                    <MenuItem value="">Select Exam Type</MenuItem>
                    {examTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
    </Grid>
))}
                            
                            <Button
                                onClick={addOlevelSubject}
                                variant="outlined"
                                sx={{ mt: 1 }}
                            >

                                Add More Subjects
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Photo Upload */}
            {activeStep === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Upload Photograph
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {previewImage ? (
                                <Avatar
                                    src={previewImage}
                                    sx={{ width: 150, height: 150 }}
                                />
                            ) : (
                                <Avatar sx={{ width: 150, height: 150 }} />
                            )}
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="passport-upload"
                                type="file"
                                onChange={handlePhotoUpload}
                            />
                            <label htmlFor="passport-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Upload Passport
                                </Button>
                            </label>
                            <Typography variant="body2" color="textSecondary">
                                (Maximum size: 500KB, Recommended: 300x300 pixels)
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Summary */}
            {activeStep === 3 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Application Summary
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Personal Information
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Full Name:</strong> {fullname}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Email:</strong> {email}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Phone:</strong> {phone}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Gender:</strong> {formData.gender}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Marital Status:</strong> {formData.maritalStatus}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Date of Birth:</strong> {formData.dateOfBirth}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        O'Level Results
                        <Typography variant="caption" display="block" color="text.secondary">
                            * Required subjects
                        </Typography>
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={3}>
                                <Typography fontWeight="bold">Subject</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography fontWeight="bold">Grade</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography fontWeight="bold">Exam Year</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography fontWeight="bold">Exam Type</Typography>
                            </Grid>
                        </Grid>
                        
                        {formData.olevelResults
                            .filter(r => r.subject && r.grade && r.examYear && r.examType)
                            .map((result, index) => (
                                <Grid 
                                    container 
                                    spacing={2} 
                                    key={index} 
                                    sx={{ 
                                        mb: 1,
                                        backgroundColor: ["Mathematics", "English", "Biology", "Chemistry", "Physics"].includes(result.subject) 
                                            ? 'rgba(25, 118, 210, 0.08)' 
                                            : 'transparent',
                                        p: 1,
                                        borderRadius: 1
                                    }}
                                >
                                    <Grid item xs={3}>
                                        <Typography>
                                            {result.subject}
                                            {["Mathematics", "English", "Biology", "Chemistry", "Physics"].includes(result.subject) && (
                                                <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
                                            )}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography>{result.grade}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography>{result.examYear}</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography>{result.examType}</Typography>
                                    </Grid>
                                </Grid>
                            ))}
                    </Paper>
                </Grid>

                            {previewImage && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Passport Photograph
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Avatar
                                            src={previewImage}
                                            sx={{ width: 100, height: 100 }}
                                        />
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Step 5: Payment */}
            {activeStep === 4 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Payment
                        </Typography>
                        <Typography sx={{ mb: 2 }}>
                            Please complete your payment to finalize application.
                        </Typography>

                        {paymentMessage && (
                            <Alert 
                                severity={paymentMessage.includes('success') ? 'success' : 'error'}
                                sx={{ mb: 2 }}
                            >
                                {paymentMessage}
                            </Alert>
                        )}

                        {rrr ? (
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Your Remita Retrieval Reference (RRR)
                                </Typography>
                                <Paper elevation={3} sx={{ p: 2, display: 'inline-block', mb: 2 }}>
                                    <Typography variant="h5" color="primary">
                                        {rrr}
                                    </Typography>
                                </Paper>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={copyToClipboard}
                                    >
                                        Copy RRR
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={initiatePayment}
                                    disabled={isPaying}
                                    startIcon={isPaying ? <CircularProgress size={20} /> : <PaymentIcon />}
                                >
                                    {isPaying ? 'Generating RRR...' : 'Generate Remita RRR'}
                                </Button>
                            </Box>
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={handlePayOnline}
                                    disabled={!rrr}
                                    startIcon={<PaymentIcon />}
                                >
                                    Pay Online Now
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="primary"
                                    onClick={verifyPayment}
                                    disabled={!rrr || isVerifying}
                                    startIcon={isVerifying ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Payment'}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Step 6: Exam Slip */}
            {activeStep === 5 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Exam Slip
                        </Typography>
                        <Typography sx={{ mb: 3 }}>
                            Your application is complete. Download your exam slip below.
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>Name:</strong> {fullname}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>Application ID:</strong> {applicationId}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>Email:</strong> {email}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography><strong>Phone:</strong> {phone}</Typography>
                            </Grid>
                        </Grid>

                       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <Button
        variant="contained"
        color="primary"
        onClick={downloadExamSlip}
        disabled={isDownloading}
        startIcon={isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
        sx={{ px: 4 }}
    >
        {isDownloading ? 'Downloading...' : 'Download Exam Slip'}
    </Button>
    
    {isDownloading && (
        <Box sx={{ width: '100%', maxWidth: 360 }}>
            <LinearProgress 
                variant={downloadProgress > 0 ? "determinate" : "indeterminate"}
                value={downloadProgress}
                sx={{ height: 8, borderRadius: 4 }}
            />
            {downloadProgress > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {downloadProgress}% downloaded
                </Typography>
            )}
        </Box>
    )}
</Box>
                    </CardContent>
                </Card>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Button
                    color="inherit"
                    disabled={activeStep === 0 || isSubmitted} 
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                >
                    Back
                </Button>
                
                <Box sx={{ flex: '1 1 auto' }} />

                {activeStep === steps.length - 1 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => router.push('/dashboard')}
                    >
                        Return to Dashboard
                    </Button>
                ) : activeStep === 3 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitRegistration}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                ) : activeStep === 4 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={!isPaymentVerified}
                    >
                        View Exam Slip
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                )}
            </Box>
        </DashboardCard>
    );
};

export default Apply;