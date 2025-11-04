"use client";

import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Alert,
  useMediaQuery,
  useTheme,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GradingIcon from "@mui/icons-material/Grading";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FeedbackIcon from "@mui/icons-material/Feedback";

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  dueDate: string;
  maxScore: number;
  courseId: number;
  createdBy: number;
  created_at: string | null;
  updated_at: string | null;
  status: "not_started" | "downloaded" | "submitted" | "graded";
  score: number | null;
  feedback: string | null;
  submission_url: string | null;
}

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/assignments`);
      setAssignments(response.data);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch assignments";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownloadClick = (assignment: Assignment) => {
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/assignments/${assignment.id}/download`;
    console.log("Downloading from URL:", downloadUrl);
    window.location.href = downloadUrl;
  };

  const handleUploadClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedAssignment || !uploadFile) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment.id.toString());
      formData.append("file", uploadFile);

      const response = await api.post(`/assignments/${selectedAssignment.id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update the assignment status to submitted
      const updatedAssignments = assignments.map(a => 
        a.id === selectedAssignment.id ? {
          ...a, 
          status: "submitted",
          submission_url: URL.createObjectURL(uploadFile)
        } : a
      );
      
      setAssignments(updatedAssignments);
      setSuccess(response?.data?.message || 'Assignment uploaded successfully');
      setUploadDialogOpen(false);
      setSelectedAssignment(null);
      setUploadFile(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload assignment');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeedback = (assignmentId: number) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(assignmentId);
    }
  };

  const getStatusChip = (assignment: Assignment) => {
  switch (assignment.status) {
    case "not_started":
      return <Chip label="Not Started" color="default" size="small" />;
    case "downloaded":
      return <Chip label="Downloaded" color="info" size="small" />;
    case "submitted":
      return <Chip label="Submitted" color="warning" size="small" />;
    case "graded":
      const isFail = assignment.score !== null && assignment.score < 50;
      return (
        <Box display="flex" alignItems="center">
          <Chip 
            label={`Scored: ${assignment.score}/${assignment.maxScore}`} 
            sx={{
              bgcolor: isFail ? "error.main" : "success.main",
              color: "white",
              fontWeight: "bold"
            }}
            size="small" 
          />
          <CheckCircleIcon 
            sx={{ ml: 1, color: isFail ? "error.main" : "success.main" }} 
          />
        </Box>
      );
    default:
      return <Chip label="Unknown" color="default" size="small" />;
  }
};

const getScoreDisplay = (assignment: Assignment) => {
  if (assignment.status === "graded" && assignment.score !== null) {
    const isFail = assignment.score < 50;
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          color: isFail ? "error.main" : "success.main", 
          fontWeight: "bold" 
        }}
      >
        {assignment.score}/{assignment.maxScore}
      </Typography>
    );
  } else if (assignment.status === "submitted") {
    return "Not Graded";
  } else {
    return "-";
  }
};


  return (
    <DashboardCard title="My Assignments">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<WarningIcon />} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : assignments.length > 0 ? (
        <Paper
          elevation={3}
          sx={{ p: 2, borderRadius: 2, overflowX: "auto", mb: 3 }}
        >
          <Table size="small" sx={{ minWidth: isMobile ? 300 : 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Assignment</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <>
                  <TableRow key={assignment.id} hover>
                    <TableCell sx={{ wordBreak: "break-word" }}>
                      <Box display="flex" alignItems="center">
                        <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                        {assignment.title}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatDate(assignment.dueDate)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {getStatusChip(assignment)}
                    </TableCell>
                   <TableCell>
  {getScoreDisplay(assignment)}
</TableCell>

                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleDownloadClick(assignment)}
                          title="Download Assignment"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleUploadClick(assignment)}
                          disabled={assignment.status === "submitted" || assignment.status === "graded"}
                          title={assignment.status === "submitted" || assignment.status === "graded" ? 
                            "Already submitted" : "Upload Submission"}
                        >
                          <UploadIcon />
                        </IconButton>
                        {assignment.feedback && (
                          <IconButton 
                            color="info"
                            onClick={() => toggleFeedback(assignment.id)}
                            title="View Feedback"
                          >
                            <FeedbackIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  {assignment.feedback && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 0 }}>
                        <Collapse in={expandedAssignment === assignment.id}>
                          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Instructor Feedback:
                            </Typography>
                            <Typography variant="body2">
                              {assignment.feedback}
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No assignments available yet
          </Typography>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Completed Assignment
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              type="file"
              fullWidth
              onChange={handleFileSelect}
              inputProps={{ accept: ".pdf,.doc,.docx,.zip,.xlsx,.csv,.ppt,.pptx" }}
            />
          </Box>
          {selectedAssignment && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Upload your completed assignment for: <strong>{selectedAssignment.title}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUploadSubmit} 
            disabled={!uploadFile || isLoading}
            variant="contained"
          >
            {isLoading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardCard>
  );
};

export default AssignmentPage;