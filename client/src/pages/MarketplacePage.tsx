import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Avatar,
  Divider,
  Rating,
  Alert,
  Snackbar,
  useTheme,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import {
  ShoppingCart,
  Info,
  Download,
  Star,
  LocalOffer,
  Security,
  Speed,
  Support,
  CheckCircle,
  Add,
  Remove,
  Close,
  ShoppingBag,
  Payment,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import StandaloneUserRegistration from '@/components/StandaloneUserRegistration';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

// Product data structure
interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  features: string[];
  requirements: string[];
  rating: number;
  reviewCount: number;
  downloads: number;
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
  fileSize: string;
  version: string;
  lastUpdated: string;
  developer: string;
  compatibility: string[];
  support: {
    email: boolean;
    documentation: boolean;
    updates: boolean;
    community: boolean;
  };
}

// Standalone Backbone Tools
const products: Product[] = [
  {
    id: 'backbone-callsheet-pro',
    name: 'Backbone Call Sheet Pro',
    description: 'Professional call sheet management system with advanced scheduling, personnel management, and production workflow integration. Perfect for film, TV, and commercial production teams.',
    shortDescription: 'Professional call sheet management with production workflow integration',
    price: 199.99,
    originalPrice: 299.99,
    category: 'Production Management',
    image: '/images/callsheet-dashboard-thumbnail.png',
    features: [
      'Advanced call sheet creation and editing',
      'Personnel and crew management',
      'Location and schedule management',
      'Real-time collaboration',
      'Template system with 20+ templates',
      'Daily call sheet records',
      'Integration with timecard systems',
      'Export to PDF and other formats',
      'Mobile-responsive design',
      'Offline capability',
      'Weather integration',
      'Hospital and emergency info',
      'Walkie-talkie channel management',
      'Vendor and equipment tracking',
      'Analytics and reporting'
    ],
    requirements: [
      'Modern web browser (Chrome, Firefox, Safari, Edge)',
      'Internet connection for cloud sync',
      '2GB RAM minimum (4GB recommended)',
      '50MB free disk space for offline data',
      'JavaScript enabled'
    ],
    rating: 4.9,
    reviewCount: 156,
    downloads: 2340,
    tags: ['call-sheets', 'production', 'scheduling', 'collaboration', 'film', 'tv'],
    isPopular: false,
    fileSize: '50 MB',
    version: '1.0.0',
    lastUpdated: '2024-01-20',
    developer: 'BackboneLogic, Inc.',
    compatibility: ['Web', 'Desktop (Electron)', 'Mobile'],
    support: {
      email: true,
      documentation: true,
      updates: true,
      community: true
    }
  },
  {
    id: 'backbone-edl-converter-pro',
    name: 'Backbone EDL Converter Pro',
    description: 'Professional EDL and XML to CSV converter with advanced parsing, validation, and export capabilities. Perfect for post-production workflows, editing teams, and media professionals.',
    shortDescription: 'Professional EDL/XML to CSV converter with validation and analytics',
    price: 149.99,
    originalPrice: 199.99,
    category: 'Post-Production',
    image: '/images/edlconverter-dashboard-thumbnail.png',
    features: [
      'EDL file parsing and validation',
      'XML format support',
      'CSV/Excel/PDF export options',
      'Advanced analytics and reporting',
      'Batch file processing',
      'Data verification and error detection',
      'Custom export templates',
      'Real-time processing status',
      'File management and organization',
      'Offline processing capability',
      'Cross-platform compatibility',
      'API integration support',
      'Data visualization tools',
      'Automated report generation',
      'Cloud sync and backup'
    ],
    requirements: [
      'Modern web browser (Chrome, Firefox, Safari, Edge)',
      'Internet connection for cloud sync',
      '4GB RAM minimum (8GB recommended)',
      '100MB free disk space for processing',
      'JavaScript enabled',
      'File upload support'
    ],
    rating: 4.8,
    reviewCount: 89,
    downloads: 1240,
    tags: ['edl', 'xml', 'csv', 'converter', 'post-production', 'editing'],
    isPopular: false,
    fileSize: '75 MB',
    version: '1.0.0',
    lastUpdated: '2024-01-20',
    developer: 'BackboneLogic, Inc.',
    compatibility: ['Web', 'Desktop (Electron)', 'Mobile'],
    support: {
      email: true,
      documentation: true,
      updates: true,
      community: true
    }
  }
];

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showRegistration, setShowRegistration] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  const cartItems = Object.keys(cart).length;
  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return total + (product ? product.price * quantity : 0);
  }, 0);

  const handleAddToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    setSuccessMessage(`${products.find(p => p.id === productId)?.name} added to cart!`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowRegistration(true);
      return;
    }
    
    // Navigate to checkout with cart items
    const cartData = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { product, quantity };
    }).filter(item => item.product);
    
    navigate('/checkout/standalone', { 
      state: { 
        items: cartData,
        type: 'standalone'
      }
    });
  };

  const handleRegistrationSuccess = (userData: any) => {
    setShowRegistration(false);
    setSuccessMessage(`Welcome! Account created successfully. You can now proceed to checkout.`);
    
    // Navigate to checkout with cart items
    const cartData = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { product, quantity };
    }).filter(item => item.product);
    
    setTimeout(() => {
      navigate('/checkout/standalone', { 
        state: { 
          items: cartData,
          type: 'standalone'
        }
      });
    }, 2000);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <Zoom in timeout={300}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 20px 40px rgba(0, 212, 255, 0.2)'
              : '0 20px 40px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.image}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              gap: 1,
            }}
          >
            {product.isPopular && (
              <Chip
                label="Popular"
                color="warning"
                size="small"
                icon={<Star />}
              />
            )}
            {product.isNew && (
              <Chip
                label="New"
                color="success"
                size="small"
              />
            )}
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {product.shortDescription}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={product.rating} precision={0.1} size="small" readOnly />
              <Typography variant="body2" color="text.secondary">
                {product.rating} ({product.reviewCount} reviews)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                ${product.price}
              </Typography>
              {product.originalPrice && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textDecoration: 'line-through', 
                    color: 'text.secondary' 
                  }}
                >
                  ${product.originalPrice}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {product.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
              <Typography variant="caption">
                <Download sx={{ fontSize: 14, mr: 0.5 }} />
                {product.downloads.toLocaleString()} downloads
              </Typography>
              <Typography variant="caption">
                v{product.version}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              startIcon={<Info />}
              onClick={() => setSelectedProduct(product)}
              size="small"
              sx={{ 
                flex: 1,
                minHeight: '36px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.50',
                }
              }}
            >
              Details
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleAddToCart(product.id)}
              size="small"
              sx={{ 
                flex: 1,
                minHeight: '36px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              Add to Cart
            </Button>
          </Stack>
        </CardActions>
      </Card>
    </Zoom>
  );

  const ProductDetailsDialog: React.FC<{ product: Product | null; onClose: () => void }> = ({ 
    product, 
    onClose 
  }) => {
    if (!product) return null;

    return (
      <Dialog
        open={!!product}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {product.name}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                height="300"
                image={product.image}
                alt={product.name}
                sx={{ borderRadius: 2, mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating value={product.rating} precision={0.1} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {product.rating} ({product.reviewCount} reviews)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ${product.price}
                </Typography>
                {product.originalPrice && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textDecoration: 'line-through', 
                      color: 'text.secondary' 
                    }}
                  >
                    ${product.originalPrice}
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => {
                  handleAddToCart(product.id);
                  onClose();
                }}
                sx={{ width: '100%', mb: 2 }}
              >
                Add to Cart - ${product.price}
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {product.description}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Key Features
              </Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                {product.features.map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                ))}
              </Stack>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                System Requirements
              </Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                {product.requirements.map((req, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {req}
                  </Typography>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {product.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    File Size
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.fileSize}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.version}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Developer
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.developer}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.lastUpdated}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4, pt: { xs: 12, md: 16 }, pb: 32 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6, pt: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 2,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Backbone Marketplace
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
          >
            Discover and purchase standalone Backbone tools. Professional-grade software 
            for every creative workflow.
          </Typography>

          {/* Cart Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ShoppingBag />}
              onClick={() => setShowCart(true)}
              sx={{ position: 'relative' }}
            >
              Cart
              {cartItems > 0 && (
                <Badge
                  badgeContent={cartItems}
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>

        {/* Category Filter */}
        <Box sx={{ mb: 6, mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category === 'all' ? 'All Products' : category}
                onClick={() => setFilter(category)}
                variant={filter === category ? 'filled' : 'outlined'}
                color={filter === category ? 'primary' : 'default'}
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Stack>
        </Box>

        {/* Products Grid - Centered for 2 tools */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
          <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: { xs: '100%', md: '800px', lg: '1000px' } }}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={5} lg={4} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found in this category.
            </Typography>
          </Box>
        )}

        {/* Product Details Dialog */}
        <ProductDetailsDialog
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />

        {/* Cart Dialog */}
        <Dialog
          open={showCart}
          onClose={() => setShowCart(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Shopping Cart</Typography>
              <IconButton onClick={() => setShowCart(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {cartItems === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Your cart is empty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add some products to get started
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {Object.entries(cart).map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <Paper key={productId} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${product.price} each
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFromCart(productId)}
                          >
                            <Remove />
                          </IconButton>
                          <Typography variant="body1" sx={{ minWidth: 24, textAlign: 'center' }}>
                            {quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleAddToCart(productId)}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ${cartTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            )}
          </DialogContent>
          {cartItems > 0 && (
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setShowCart(false)}>
                Continue Shopping
              </Button>
              <Button
                variant="contained"
                startIcon={<Payment />}
                onClick={handleCheckout}
                sx={{ minWidth: 120 }}
              >
                Checkout
              </Button>
            </DialogActions>
          )}
        </Dialog>

        {/* Registration Dialog */}
        <Dialog
          open={showRegistration}
          onClose={() => setShowRegistration(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <StandaloneUserRegistration
              onSuccess={handleRegistrationSuccess}
              onClose={() => setShowRegistration(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Success Message */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSuccessMessage(null)} 
            severity="success"
            variant="filled"
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </Box>
  );
};

export default MarketplacePage;
