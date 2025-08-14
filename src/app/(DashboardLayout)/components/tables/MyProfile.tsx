import {
    Typography, Box,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    TextField,
    Avatar,
    useTheme,
    Divider,
    IconButton
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useEffect, useState } from "react";
import api from '../../../../lib/api';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    profilePicture: string | null;
    dateOfBirth: string | null;
    gender: string;
    createdAt: string;
    updatedAt: string;
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const MyProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<UserProfile>>({});
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const theme = useTheme();

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/user/profile');
            setProfile(response.data);
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch profile');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleEditClick = () => {
        if (profile) {
            setEditData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                address: profile.address,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                postalCode: profile.postalCode,
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender
            });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
        setProfilePicture(null);
        setPreviewImage(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            
            // Append profile data
            Object.entries(editData).forEach(([key, value]) => {
                if (value !== undefined) {
                    formData.append(key, value);
                }
            });
            
            // Append profile picture if changed
            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }
            
            const response = await api.put('/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setProfile(response.data);
            setIsEditing(false);
            setEditData({});
            setProfilePicture(null);
            setPreviewImage(null);
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update profile');
            console.error('Update error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
};

    return (
        <DashboardCard title="My Profile">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : profile ? (
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        {!isEditing ? (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleEditClick}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <Box display="flex" gap={1}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveProfile}
                                    disabled={isLoading}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancelEdit}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        )}
                    </Box>

                    <Grid container spacing={3}>
                        {/* Profile Picture Column */}
                        <Grid item xs={12} md={4}>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                {isEditing ? (
                                    <>
                                        <Avatar
    src={previewImage || (profile.profilePicture || '')}
    sx={{
        width: 150,
        height: 150,
        fontSize: 60,
        mb: 2
    }}
>
    {!previewImage && !profile.profilePicture && 
        getInitials(profile.firstName || null, profile.lastName || null)}
</Avatar>
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                            sx={{ mb: 2 }}
                                        >
                                            Upload New Photo
                                            <VisuallyHiddenInput 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                        <Typography variant="caption" color="text.secondary">
                                            Recommended size: 300x300 pixels
                                        </Typography>
                                    </>
                                ) : (
                                    <Avatar
                                        src={profile.profilePicture || ''}
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            fontSize: 60
                                        }}
                                    >
                                        {!profile.profilePicture && 
                                            getInitials(profile.firstName, profile.lastName)}
                                    </Avatar>
                                )}
                            </Box>
                        </Grid>

                        {/* Profile Information Column */}
                        <Grid item xs={12} md={8}>
                            {isEditing ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            name="firstName"
                                            value={editData.firstName || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            name="lastName"
                                            value={editData.lastName || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={profile.email}
                                            margin="normal"
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            name="phoneNumber"
                                            value={editData.phoneNumber || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Date of Birth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={editData.dateOfBirth || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Gender"
                                            name="gender"
                                            value={editData.gender || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            name="address"
                                            value={editData.address || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            name="city"
                                            value={editData.city || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="State"
                                            name="state"
                                            value={editData.state || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Postal Code"
                                            name="postalCode"
                                            value={editData.postalCode || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Country"
                                            name="country"
                                            value={editData.country || ''}
                                            onChange={handleInputChange}
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Box>
                                    <Typography variant="h4" gutterBottom>
                                        {profile.firstName} {profile.lastName}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                        {profile.email}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Phone Number
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {profile.phoneNumber || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Date of Birth
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {formatDate(profile.dateOfBirth)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Gender
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {profile.gender || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Address
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {profile.address || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                City
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {profile.city || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                State
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {profile.state || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Postal Code
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {profile.postalCode || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Country
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {profile.country || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Member Since
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {formatDate(profile.createdAt)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            ) : (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No profile information found
                    </Typography>
                </Box>
            )}
        </DashboardCard>
    );
};

export default MyProfile;