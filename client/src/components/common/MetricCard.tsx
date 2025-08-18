import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  showArrow?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'primary',
  onClick,
  showArrow = true
}) => {
  // Define gradient backgrounds based on color prop
  const getGradientBackground = (colorProp: string) => {
    switch (colorProp) {
      case 'success':
        return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)';
      case 'secondary':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)';
      case 'primary':
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  // Define hover shadow colors based on color prop
  const getHoverShadow = (colorProp: string) => {
    switch (colorProp) {
      case 'success':
        return '0 8px 25px rgba(17, 153, 142, 0.3)';
      case 'warning':
        return '0 8px 25px rgba(252, 74, 26, 0.3)';
      case 'secondary':
        return '0 8px 25px rgba(79, 172, 254, 0.3)';
      case 'error':
        return '0 8px 25px rgba(255, 65, 108, 0.3)';
      case 'primary':
      default:
        return '0 8px 25px rgba(102, 126, 234, 0.3)';
    }
  };

  return (
    <Box>
      <Card
        onClick={onClick}
        sx={{
          background: getGradientBackground(color),
          color: 'white',
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: onClick ? 'translateY(-4px)' : 'translateY(-2px)',
            boxShadow: onClick ? getHoverShadow(color) : '0 8px 32px rgba(0,0,0,0.3)',
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {React.cloneElement(icon as React.ReactElement, { 
                sx: { fontSize: 24, color: 'white' } 
              })}
            </Box>
            {trend && (
              <Chip
                label={`${trend.direction === 'up' ? '+' : '-'}${trend.value}%`}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '& .MuiChip-label': {
                    color: 'white'
                  }
                }}
              />
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
              {title}
            </Typography>
            {onClick && showArrow && (
              <ArrowForward 
                sx={{ 
                  fontSize: 16, 
                  opacity: 0.6,
                  color: 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': { opacity: 1, transform: 'translateX(2px)' }
                }} 
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MetricCard;
