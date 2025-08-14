import {
    Typography, Box,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Avatar,
    Paper,
    Grid,
    Checkbox,
    FormControlLabel,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';

interface Candidate {
    id: number;
    applicationId: string;
    jambId: string;
    firstName: string;
    lastName: string;
    otherNames: string | null;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    batch: string;
    passportPhoto: string;
    isPresent: boolean;
    hall: string | null;
    seatNumber: string | null;
}

const Verification = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMarkingPresent, setIsMarkingPresent] = useState(false);
    const [markPresent, setMarkPresent] = useState(false);
    const [hasChanged, setHasChanged] = useState(false); 

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setError("Please enter a JAMB ID or Application ID");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCandidate(null);

        try {
            const response = await api.get(`/applicant/verify/${searchTerm.trim()}`);
            if (response.data) {
                const candidateData = response.data;
                const isPresentBoolean = candidateData.isPresent === "true"; 
                setCandidate(candidateData);
                setMarkPresent(isPresentBoolean)
            } else {
                setError("Candidate not found");
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch candidate details');
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkPresent = async () => {
        if (!candidate) return;

        setIsMarkingPresent(true);
        try {
            const response = await api.post(`/applicant/mark-present`, {
                applicationId: candidate.applicationId,
                isPresent: markPresent
            });
            
            if (response.data) {
                setCandidate(response.data);
                setMarkPresent(true);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update attendance');
            console.error('Attendance update error:', error);
        } finally {
            setIsMarkingPresent(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatFullName = (candidate: Candidate) => {
        return `${candidate.firstName} ${candidate.lastName}${candidate.otherNames ? ' ' + candidate.otherNames : ''}`;
    };

    return (
        <DashboardCard title={
            <Typography variant="h4" component="h1" sx={{ 
                color: '#2c3e50',
                fontWeight: 'bold',
                textAlign: 'center',
                py: 1,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                Candidate Verification System
            </Typography>
        }>
            <Box mb={3} sx={{ 
                background: 'white',
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <Typography variant="body1" color="textSecondary" mb={2} sx={{ 
                    fontSize: '1.1rem',
                    color: '#5a6a85'
                }}>
                    Verify candidates by entering their <strong>JAMB ID</strong> or <strong>Application ID</strong>
                </Typography>
                
                <Box display="flex" gap={2} alignItems="center">
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter JAMB ID or Application ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={isLoading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': {
                                    borderColor: '#dfe6e9',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#74b9ff',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#0984e3',
                                },
                            },
                        }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleSearch}
                        disabled={isLoading || !searchTerm.trim()}
                        sx={{ 
                            height: '56px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            px: 4,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)',
                                boxShadow: '0 6px 8px rgba(0,0,0,0.15)'
                            }
                        }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                    </Button>
                </Box>
            </Box>

            {error && (
                <Box mb={2}>
                    <Alert severity="error" sx={{ 
                        borderRadius: '8px',
                        fontSize: '1rem'
                    }}>
                        {error}
                    </Alert>
                </Box>
            )}

            {candidate && (
                <Card sx={{ 
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e6ed',
                    overflow: 'hidden'
                }}>
                    <CardContent sx={{ p: 0 }}>
                        <Grid container spacing={0}>
                            <Grid item xs={12} md={3} sx={{ 
                                background: '#f8f9fa',
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRight: '1px solid #e0e6ed'
                            }}>
                                <Avatar 
                                    src={candidate.passportPhoto} 
                                    sx={{ 
                                        width: 200, 
                                        height: 200,
                                        border: '3px solid white',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        mb: 2
                                    }} 
                                />
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 'bold',
                                    color: '#2c3e50',
                                    mt: 1
                                }}>
                                    {formatFullName(candidate)}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    color: '#7f8c8d',
                                    mb: 1
                                }}>
                                    {candidate.applicationId}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={9} sx={{ p: 3 }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h5" sx={{ 
                                        fontWeight: 'bold',
                                        color: '#2c3e50',
                                        mb: 2,
                                        pb: 1,
                                        borderBottom: '2px solid #f1f3f5'
                                    }}>
                                        Candidate Information
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ 
                                                    color: '#7f8c8d',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    APPLICATION ID
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                                    {candidate.applicationId}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ 
                                                    color: '#7f8c8d',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    JAMB ID
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                                    {candidate.jambId}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ 
                                                    color: '#7f8c8d',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    BATCH
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                                    {candidate.batch}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ 
                                                    color: '#7f8c8d',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    EMAIL
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                                    {candidate.email}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ 
                                                    color: '#7f8c8d',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    PHONE NUMBER
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                                    {candidate.phoneNumber}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ 
                                                    color: '#7f8c8d',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    DATE OF BIRTH
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                                    {formatDate(candidate.dateOfBirth)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ my: 3, borderColor: '#e0e6ed' }} />

                                {candidate.hall && candidate.seatNumber ? (
                                    <Box sx={{ 
                                        background: '#f8f9fa',
                                        p: 3,
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #0984e3'
                                    }}>
                                        <Typography variant="h5" sx={{ 
                                            fontWeight: 'bold',
                                            color: '#2c3e50',
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <span style={{ color: '#0984e3' }}>✏️</span> Examination Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ 
                                                    background: 'white',
                                                    p: 2,
                                                    borderRadius: '6px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                                }}>
                                                    <Typography variant="subtitle2" sx={{ 
                                                        color: '#7f8c8d',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        EXAMINATION HALL
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 'bold',
                                                        color: '#2c3e50',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        {candidate.hall}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ 
                                                    background: 'white',
                                                    p: 2,
                                                    borderRadius: '6px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                                }}>
                                                    <Typography variant="subtitle2" sx={{ 
                                                        color: '#7f8c8d',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        SEAT NUMBER
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 'bold',
                                                        color: '#2c3e50',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        {candidate.seatNumber}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Box sx={{ 
                                        background: '#fff8e1',
                                        p: 3,
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #ffb300'
                                    }}>
                                        <Typography variant="h5" sx={{ 
                                            fontWeight: 'bold',
                                            color: '#5d4037',
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <span style={{ color: '#ffb300' }}>🖊️</span> Attendance Verification
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={markPresent}
                                                    onChange={(e) => setMarkPresent(e.target.checked)}
                                                    disabled={isMarkingPresent}
                                                    color="primary"
                                                    sx={{ 
                                                        '&.Mui-checked': {
                                                            color: '#0984e3'
                                                        }
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ 
                                                    fontWeight: '500',
                                                    color: '#5d4037'
                                                }}>
                                                    Confirm candidate is present for examination
                                                </Typography>
                                            }
                                            sx={{ ml: 0, mb: 2 }}
                                        />
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleMarkPresent}
                                                disabled={isMarkingPresent || !markPresent}
                                                startIcon={isMarkingPresent ? <CircularProgress size={20} color="inherit" /> : null}
                                                sx={{ 
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    px: 4,
                                                    py: 1.5,
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                                                        boxShadow: '0 6px 8px rgba(0,0,0,0.15)'
                                                    },
                                                    '&:disabled': {
                                                        background: '#b2bec3'
                                                    }
                                                }}
                                            >
                                                {isMarkingPresent ? 'Updating...' : 'Submit Attendance'}
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </DashboardCard>
    );
};

export default Verification;