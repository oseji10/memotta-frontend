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
} from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import WarningIcon from "@mui/icons-material/Warning";

interface Lecture {
  id: number;
  title: string;
  url: string; // Video link
  date: string;
}

const LectureArchive = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchLectures = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/lecture-archives");
      setLectures(response.data);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch lecture archive";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

// const lectures = [
//   {
//     "id": 1,
//     "title": "Introduction Class",
//     "url": "https://memotta.com.ng/resources/VADA/VADAIntroductoryClass.mp4",
//     "date": "2025-08-14"
//   },
//   {
//     "id": 2,
//     "title": "Master Class 1 - Data Analysis (Intro To Excel)",
//     "url": "https://memotta.com.ng/resources/VADA/Class1.mp4",
//     "date": "2025-08-21"
//   },

//     {
//     "id": 3,
//     "title": "Master Class 2 - Data Analysis (IF Functions, Conditional Formatting)",
//     "url": "https://memotta.com.ng/resources/VADA/Class2.mp4",
//     "date": "2025-08-22"
//   },
//    {
//     "id": 4,
//     "title": "Master Class 3 - Data Analysis (Understanding Basic SQL)",
//     "url": "https://memotta.com.ng/resources/VADA/Class3.webm",
//     "date": "2025-08-28"
//   }
// ];


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleWatchClick = (url: string) => {
    window.open(url, "_blank"); // Open video in new tab
  };

  return (
    <DashboardCard title="Lecture Archive">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<WarningIcon />}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : lectures.length > 0 ? (
        <Paper
          elevation={3}
          sx={{ p: 2, borderRadius: 2, overflowX: "auto", mb: 3 }}
        >
          <Table size="small" sx={{ minWidth: isMobile ? 300 : 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lectures.map((lecture) => (
                <TableRow key={lecture.id} hover>
                  <TableCell sx={{ wordBreak: "break-word" }}>
                    {lecture.title}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatDate(lecture.date)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<PlayCircleIcon color="primary" />}
                      onClick={() => handleWatchClick(lecture.url)}
                    >
                      Watch
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No lectures available in the archive yet
          </Typography>
        </Box>
      )}
    </DashboardCard>
  );
};

export default LectureArchive;
