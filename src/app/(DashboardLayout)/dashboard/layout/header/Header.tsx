import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import Link from 'next/link';
// components
import Profile from './Profile';
import { IconBellRinging, IconMapPinPin, IconMenu } from '@tabler/icons-react';
import { getStaffLga, getApplicationType, getRole } from '@/lib/auth';

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  // Retrieve staffType and staffLga from localStorage
  const applicationType = getApplicationType();
  const role = getRole();
 
  // Determine location message based on staffType


  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: 'none',
              xs: 'inline',
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        {/* <IconButton
          size="large"
          aria-label="show location"
          color="inherit"
          aria-controls="location-menu"
          aria-haspopup="true"
        >
          <Badge color="primary">
            <IconMapPinPin size="21" stroke="1.5" />
          </Badge>
        </IconButton> */}

        <Typography variant="h6" component="h2" sx={{ ml: 1, color: 'text.primary' }}>
          {/* {locationMessage} */}
        </Typography>

        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;