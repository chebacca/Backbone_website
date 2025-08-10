import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Link,
} from '@mui/material';
import {
  ExpandMore,
  Business,
  Person,
  Check,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

interface BillingDetailsStepProps {
  billingAddress: any;
  taxInformation: any;
  businessProfile: any;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  onUpdate: (updates: any) => void;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  // Add more countries as needed
];

const usStates = [
  { code: 'AL', name: 'Alabama' },
  { code: 'CA', name: 'California' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
  // Add more states as needed
];

export const BillingDetailsStep: React.FC<BillingDetailsStepProps> = ({
  billingAddress,
  taxInformation,
  businessProfile,
  acceptTerms,
  acceptPrivacy,
  onUpdate,
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      billingAddress,
      taxInformation,
      businessProfile,
      acceptTerms,
      acceptPrivacy,
    },
  });

  const watchedValues = watch();
  const selectedCountry = watchedValues.billingAddress?.country;
  // Use a typed view of react-hook-form errors to avoid TS index errors
  const fieldErrors: any = errors as any;

  React.useEffect(() => {
    onUpdate(watchedValues);
  }, [watchedValues, onUpdate]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Billing Information
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please provide your billing details for invoicing and compliance.
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> Contact Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="billingAddress.firstName"
            control={control}
            rules={{ required: 'First name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="First Name"
                error={!!fieldErrors.billingAddress?.firstName}
                helperText={fieldErrors.billingAddress?.firstName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="billingAddress.lastName"
            control={control}
            rules={{ required: 'Last name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Last Name"
                error={!!fieldErrors.billingAddress?.lastName}
                helperText={fieldErrors.billingAddress?.lastName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="billingAddress.company"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Company (Optional)"
                helperText="If purchasing for a business"
              />
            )}
          />
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Billing Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="billingAddress.addressLine1"
            control={control}
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Address Line 1"
                error={!!fieldErrors.billingAddress?.addressLine1}
                helperText={fieldErrors.billingAddress?.addressLine1?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="billingAddress.addressLine2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Address Line 2 (Optional)"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="billingAddress.city"
            control={control}
            rules={{ required: 'City is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="City"
                error={!!fieldErrors.billingAddress?.city}
                helperText={fieldErrors.billingAddress?.city?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="billingAddress.postalCode"
            control={control}
            rules={{ required: 'Postal code is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Postal Code"
                error={!!fieldErrors.billingAddress?.postalCode}
                helperText={fieldErrors.billingAddress?.postalCode?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="billingAddress.country"
            control={control}
            rules={{ required: 'Country is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                label="Country"
                error={!!fieldErrors.billingAddress?.country}
                helperText={fieldErrors.billingAddress?.country?.message}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {(selectedCountry === 'US' || selectedCountry === 'CA') && (
          <Grid item xs={12} sm={6}>
            <Controller
              name="billingAddress.state"
              control={control}
              rules={{ required: 'State/Province is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label={selectedCountry === 'US' ? 'State' : 'Province'}
                  error={!!fieldErrors.billingAddress?.state}
                  helperText={fieldErrors.billingAddress?.state?.message}
                >
                  {usStates.map((state) => (
                    <MenuItem key={state.code} value={state.code}>
                      {state.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        )}

        {/* Business Information */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Business Information (Optional)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="businessProfile.companyName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Company Name"
                        helperText="Required for business purchases and volume discounts"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="businessProfile.companyType"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Company Type"
                      >
                        <MenuItem value="SOLE_PROPRIETORSHIP">Sole Proprietorship</MenuItem>
                        <MenuItem value="PARTNERSHIP">Partnership</MenuItem>
                        <MenuItem value="LLC">LLC</MenuItem>
                        <MenuItem value="CORPORATION">Corporation</MenuItem>
                        <MenuItem value="NON_PROFIT">Non-Profit</MenuItem>
                        <MenuItem value="GOVERNMENT">Government</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="taxInformation.taxId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Tax ID / VAT Number"
                        helperText="For tax exemption and business verification"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="businessProfile.businessDescription"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label="Business Description"
                        helperText="Brief description of your business (optional)"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Terms and Conditions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Legal Agreements
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="acceptTerms"
            control={control}
            rules={{ required: 'You must accept the Terms of Service' }}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value}
                    onChange={onChange}
                    color="primary"
                    icon={
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          border: '2px solid', 
                          borderColor: 'rgba(255,255,255,0.3)', 
                          borderRadius: 0.5 
                        }} 
                      />
                    }
                    checkedIcon={
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: 'primary.main', 
                          color: '#000', 
                          borderRadius: 0.5, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <Check sx={{ fontSize: 14 }} />
                      </Box>
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link
                      component={RouterLink}
                      to="/terms"
                      target="_blank"
                      sx={{ color: 'primary.main' }}
                    >
                      Terms of Service (v{import.meta.env?.VITE_TERMS_VERSION || '1.0'})
                    </Link>
                    {' '}and{' '}
                    <Link
                      component={RouterLink}
                      to="/sla"
                      target="_blank"
                      sx={{ color: 'primary.main' }}
                    >
                      Service Level Agreement
                    </Link>
                  </Typography>
                }
                sx={{
                  alignItems: 'flex-start',
                  ...(errors.acceptTerms && {
                    color: 'error.main',
                  }),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="acceptPrivacy"
            control={control}
            rules={{ required: 'You must accept the Privacy Policy' }}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value}
                    onChange={onChange}
                    color="primary"
                    icon={
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          border: '2px solid', 
                          borderColor: 'rgba(255,255,255,0.3)', 
                          borderRadius: 0.5 
                        }} 
                      />
                    }
                    checkedIcon={
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: 'primary.main', 
                          color: '#000', 
                          borderRadius: 0.5, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <Check sx={{ fontSize: 14 }} />
                      </Box>
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link
                      component={RouterLink}
                      to="/privacy"
                      target="_blank"
                      sx={{ color: 'primary.main' }}
                    >
                      Privacy Policy
                    </Link>
                    {' '}and consent to data processing for billing and service delivery
                  </Typography>
                }
                sx={{
                  alignItems: 'flex-start',
                  ...(errors.acceptPrivacy && {
                    color: 'error.main',
                  }),
                }}
              />
            )}
          />
        </Grid>

        {(errors.acceptTerms || errors.acceptPrivacy) && (
          <Grid item xs={12}>
            <Typography variant="caption" color="error.main">
              {errors.acceptTerms?.message || errors.acceptPrivacy?.message}
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Compliance Notice */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Privacy & Compliance Notice</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your information is collected in accordance with GDPR, CCPA, and other applicable privacy laws.
          We use industry-standard encryption and security measures to protect your data.
          Tax information is used solely for compliance and billing purposes.
        </Typography>
      </Box>
    </Box>
  );
};
