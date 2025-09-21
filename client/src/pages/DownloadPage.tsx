import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Download,
  CheckCircle,
  Error,
  Refresh,
  ArrowBack,
  Security,
  Schedule,
  CloudDownload,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface DownloadData {
  valid: boolean;
  downloadUrl: string;
  productId: string;
  orderId: string;
  product?: {
    name: string;
    version: string;
    fileSize: string;
    description: string;
  };
}

const DownloadPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  
  const [downloadData, setDownloadData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!productId || !token) {
      setError('Invalid download link');
      setLoading(false);
      return;
    }

    validateDownloadToken();
  }, [productId, token]);

  const validateDownloadToken = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/standalone-payments/validate-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate download token');
      }

      setDownloadData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate download');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadData) return;

    try {
      setDownloading(true);
      
      // In a real implementation, this would trigger the actual download
      // For now, we'll simulate the download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Open the download URL
      window.open(downloadData.downloadUrl, '_blank');
      
    } catch (err) {
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    validateDownloadToken();
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Validating download link...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pt: 8 }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Error sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Download Error
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              {error}
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRetry}
              >
                Try Again
              </Button>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/marketplace')}
              >
                Back to Marketplace
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!downloadData?.valid) {
    return (
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pt: 8 }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Error sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Invalid Download Link
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              This download link is invalid or has expired.
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/marketplace')}
            >
              Back to Marketplace
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pt: 8 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/marketplace')}
            sx={{ mb: 2 }}
          >
            Back to Marketplace
          </Button>
          
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Download Ready
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your Backbone tool is ready for download
          </Typography>
        </Box>

        {/* Success Alert */}
        <Alert 
          severity="success" 
          sx={{ mb: 4 }}
          icon={<CheckCircle />}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Download link validated successfully!
          </Typography>
          <Typography variant="body2">
            Your product is ready for download. Click the button below to start downloading.
          </Typography>
        </Alert>

        {/* Download Card */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <CloudDownload sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {downloadData.product?.name || 'Backbone Tool'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {downloadData.product?.description || 'Professional Backbone tool'}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {downloadData.product?.version || 'Latest'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  File Size
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {downloadData.product?.fileSize || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {downloadData.orderId}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                onClick={handleDownload}
                disabled={downloading}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  minWidth: 200,
                }}
              >
                {downloading ? 'Preparing Download...' : 'Download Now'}
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Information Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Security sx={{ color: 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Secure Download
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Your download is protected by SSL encryption and secure authentication. 
                The file is verified and safe to download.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Schedule sx={{ color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Download Expires
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                This download link is valid for 30 days from your purchase date. 
                Keep your purchase receipt for future downloads.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Support Information */}
        <Paper sx={{ p: 3, mt: 4, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            If you're experiencing issues with your download or need assistance, 
            our support team is here to help.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label="support@backbone-logic.com"
              variant="outlined"
              clickable
              onClick={() => window.open('mailto:support@backbone-logic.com')}
            />
            <Chip
              label="Documentation"
              variant="outlined"
              clickable
              onClick={() => navigate('/documentation')}
            />
            <Chip
              label="Contact Support"
              variant="outlined"
              clickable
              onClick={() => navigate('/support')}
            />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default DownloadPage;

