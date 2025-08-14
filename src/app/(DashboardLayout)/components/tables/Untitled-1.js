import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import { 
  IconCurrencyDollar, 
  IconShoppingCart, 
  IconCreditCard, 
  IconCash, 
  IconUsers, 
  IconBox, 
  IconClock, 
  IconArrowDownRight
} from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

const MonthlyEarnings = () => {
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';
  const successlight = '#e6ffed';

  // Common chart options
  const getChartOptions = (color: string, lightColor: string) => ({
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 60,
      sparkline: { enabled: true },
      group: 'sparklines',
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: { colors: [lightColor], type: 'solid', opacity: 0.05 },
    markers: { size: 0 },
    tooltip: { theme: theme.palette.mode === 'dark' ? 'dark' : 'light' },
  });

  // Mock data for charts
  const chartData = {
    revenue: [30, 50, 20, 60, 40, 70, 25],
    orders: [10, 20, 15, 30, 25, 35, 20],
    creditSales: [5, 15, 10, 20, 15, 25, 10],
    cashSales: [25, 35, 30, 40, 35, 45, 30],
    activeUsers: [50, 60, 55, 70, 65, 80, 60],
    products: [100, 110, 105, 120, 115, 130, 110],
  };

  // Analytics data
  const analytics = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+12%',
      changePositive: true,
      icon: <IconCurrencyDollar width={24} />,
      color: secondary,
      lightColor: secondarylight,
      data: chartData.revenue,
    },
    {
      title: 'Total Orders',
      value: '1,230',
      change: '-3%',
      changePositive: false,
      icon: <IconShoppingCart width={24} />,
      color: theme.palette.primary.main,
      lightColor: '#e6f0ff',
      data: chartData.orders,
    },
    {
      title: 'Total Credit Sales',
      value: '$4,200',
      change: '+8%',
      changePositive: true,
      icon: <IconCreditCard width={24} />,
      color: theme.palette.warning.main,
      lightColor: '#fff5e6',
      data: chartData.creditSales,
    },
    {
      title: 'Total Cash Sales',
      value: '$8,250',
      change: '+15%',
      changePositive: true,
      icon: <IconCash width={24} />,
      color: theme.palette.success.main,
      lightColor: successlight,
      data: chartData.cashSales,
    },
    {
      title: 'Active Users',
      value: '2,500',
      change: '+5%',
      changePositive: true,
      icon: <IconUsers width={24} />,
      color: theme.palette.info.main,
      lightColor: '#e6faff',
      data: chartData.activeUsers,
    },
    {
      title: 'Total Products',
      value: '350',
      change: '-2%',
      changePositive: false,
      icon: <IconBox width={24} />,
      color: theme.palette.error.main,
      lightColor: errorlight,
      data: chartData.products,
    },
  ];

  // Mock recent orders
  const recentOrders = [
    { id: 'ORD001', customer: 'John Doe', amount: '$150', date: '2025-06-20' },
    { id: 'ORD002', customer: 'Jane Smith', amount: '$300', date: '2025-06-19' },
    { id: 'ORD003', customer: 'Bob Johnson', amount: '$75', date: '2025-06-18' },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
      {analytics.map((item, index) => (
        <DashboardCard
          key={index}
          title={item.title}
          action={
            <Fab color="inherit" size="medium" sx={{ bgcolor: item.color, color: '#ffffff' }}>
              {item.icon}
            </Fab>
          }
          footer={
            <Chart
              options={getChartOptions(item.color, item.lightColor)}
              series={[{ name: '', color: item.color, data: item.data }]}
              type="area"
              height={60}
              width="100%"
            />
          }
        >
          <Typography variant="h3" fontWeight="700" mt="-20px">
            {item.value}
          </Typography>
          <Stack direction="row" spacing={1} my={1} alignItems="center">
            <Avatar sx={{ bgcolor: item.changePositive ? successlight : errorlight, width: 27, height: 27 }}>
              <IconArrowDownRight width={20} color={item.changePositive ? theme.palette.success.main : '#FA896B'} />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {item.change}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              last year
            </Typography>
          </Stack>
        </DashboardCard>
      ))}

      {/* Recent Orders Card */}
      <DashboardCard
        title="Recent Orders"
        action={
          <Fab color="inherit" size="medium" sx={{ bgcolor: theme.palette.grey[500], color: '#ffffff' }}>
            <IconClock width={24} />
          </Fab>
        }
      >
        <List sx={{ maxHeight: 200, overflow: 'auto' }}>
          {recentOrders.map((order, index) => (
            <Box key={order.id}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="600">
                      {order.id} - {order.customer}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      {order.amount} • {order.date}
                    </Typography>
                  }
                />
              </ListItem>
              {index < recentOrders.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </DashboardCard>
    </Box>
  );
};

export default MonthlyEarnings;