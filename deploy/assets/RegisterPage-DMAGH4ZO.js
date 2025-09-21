var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { j as jsxRuntimeExports, B as Box, b as Container, a as Button, A as ArrowBack, c as Paper, T as Typography, d as Alert, S as Stack, e as TextField, I as InputAdornment, f as PersonIcon, E as EmailIcon, g as IconButton, V as VisibilityOff, h as Visibility, L as Lock, i as LinearProgress, M as MenuItem, F as FormControlLabel, k as Link, l as Checkbox, m as CheckIcon, D as Divider } from "./mui-BbtiZaA3.js";
import { u as useNavigate, e as useLocation, r as reactExports, L as Link$1 } from "./vendor-Cu2L4Rr-.js";
import { u as useForm, C as Controller } from "./index.esm-aV5ahHn5.js";
import { u as useAuth, a as useLoading } from "./index-uGdp3V2z.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import "./stripe-rmDQXWB-.js";
const RegisterPage = () => {
  var _a, _b, _c;
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const selectedTier = (_a = location.state) == null ? void 0 : _a.selectedTier;
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      // Address information
      firstName: "",
      lastName: "",
      company: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      phone: "",
      acceptTerms: false,
      acceptPrivacy: false,
      marketingConsent: false
    }
  });
  const password = watch("password");
  const getPasswordStrength = (password2) => {
    if (!password2) return { score: 0, label: "", color: "error" };
    let score = 0;
    if (password2.length >= 8) score += 25;
    if (/[a-z]/.test(password2)) score += 25;
    if (/[A-Z]/.test(password2)) score += 25;
    if (/[0-9]/.test(password2)) score += 25;
    if (/[^A-Za-z0-9]/.test(password2)) score += 25;
    if (score <= 25) return { score, label: "Weak", color: "error" };
    if (score <= 50) return { score, label: "Fair", color: "warning" };
    if (score <= 75) return { score, label: "Good", color: "info" };
    return { score: Math.min(score, 100), label: "Strong", color: "success" };
  };
  const passwordStrength = getPasswordStrength(password);
  const onSubmit = (data) => __async(void 0, null, function* () {
    try {
      setError(null);
      setLoading(true);
      yield register({
        name: data.name,
        email: data.email,
        password: data.password,
        acceptTerms: data.acceptTerms,
        acceptPrivacy: data.acceptPrivacy,
        marketingConsent: data.marketingConsent,
        // Address information for KYC/billing purposes
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone
      });
      enqueueSnackbar("Account created successfully! Please check your email to verify your account.", {
        variant: "success",
        autoHideDuration: 7e3
      });
      if (selectedTier) {
        navigate("/verify-email", { state: { selectedTier } });
      } else {
        navigate("/verify-email");
      }
    } catch (err) {
      const errorMessage = err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", py: { xs: 4, md: 0 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
        onClick: () => navigate("/"),
        sx: {
          color: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            color: "primary.main",
            backgroundColor: "rgba(0, 212, 255, 0.1)"
          }
        },
        children: "Back to Home"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 10,
        sx: {
          p: { xs: 4, md: 6 },
          backgroundColor: "background.paper",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.1)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h4",
                sx: {
                  fontWeight: 700,
                  color: "#000"
                },
                children: "D"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h4",
                sx: {
                  fontWeight: 600,
                  mb: 1,
                  background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                },
                children: "Create Account"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h6",
                color: "text.secondary",
                sx: { mb: 4, maxWidth: 600, mx: "auto" },
                children: "Join thousands of professionals using BackboneLogic, Inc."
              }
            ),
            selectedTier && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "primary.main", children: [
              "Selected Plan: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedTier })
            ] }) })
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSubmit(onSubmit), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "name",
                control,
                rules: {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  },
                  maxLength: {
                    value: 50,
                    message: "Name must be less than 50 characters"
                  }
                },
                render: ({ field }) => {
                  var _a2;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "Full Name",
                      error: !!errors.name,
                      helperText: (_a2 = errors.name) == null ? void 0 : _a2.message,
                      InputProps: {
                        startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { sx: { color: "text.secondary" } }) })
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "email",
                control,
                rules: {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                },
                render: ({ field }) => {
                  var _a2;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "Email Address",
                      type: "email",
                      autoComplete: "email",
                      error: !!errors.email,
                      helperText: (_a2 = errors.email) == null ? void 0 : _a2.message,
                      InputProps: {
                        startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { sx: { color: "text.secondary" } }) })
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "password",
                control,
                rules: {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  },
                  validate: {
                    hasLowerCase: (value) => /[a-z]/.test(value) || "Password must contain a lowercase letter",
                    hasUpperCase: (value) => /[A-Z]/.test(value) || "Password must contain an uppercase letter",
                    hasNumber: (value) => /\d/.test(value) || "Password must contain a number"
                  }
                },
                render: ({ field }) => {
                  var _a2;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TextField,
                      __spreadProps(__spreadValues({}, field), {
                        fullWidth: true,
                        label: "Password",
                        type: showPassword ? "text" : "password",
                        autoComplete: "new-password",
                        error: !!errors.password,
                        helperText: (_a2 = errors.password) == null ? void 0 : _a2.message,
                        InputProps: {
                          startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { color: "text.secondary" } }) }),
                          endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            IconButton,
                            {
                              onClick: () => setShowPassword(!showPassword),
                              edge: "end",
                              sx: { color: "text.secondary" },
                              children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                            }
                          ) })
                        },
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                          }
                        }
                      })
                    ),
                    password && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Password strength:" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Typography,
                          {
                            variant: "caption",
                            color: `${passwordStrength.color}.main`,
                            sx: { fontWeight: 600 },
                            children: passwordStrength.label
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        LinearProgress,
                        {
                          variant: "determinate",
                          value: passwordStrength.score,
                          color: passwordStrength.color,
                          sx: {
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: "rgba(255, 255, 255, 0.1)"
                          }
                        }
                      )
                    ] })
                  ] });
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "confirmPassword",
                control,
                rules: {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match"
                },
                render: ({ field }) => {
                  var _a2;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "Confirm Password",
                      type: showConfirmPassword ? "text" : "password",
                      autoComplete: "new-password",
                      error: !!errors.confirmPassword,
                      helperText: (_a2 = errors.confirmPassword) == null ? void 0 : _a2.message,
                      InputProps: {
                        startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { color: "text.secondary" } }) }),
                        endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          IconButton,
                          {
                            onClick: () => setShowConfirmPassword(!showConfirmPassword),
                            edge: "end",
                            sx: { color: "text.secondary" },
                            children: showConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                          }
                        ) })
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4, mb: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, color: "primary.main" }, children: "Address Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Required for account verification and billing purposes" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "firstName",
                control,
                rules: {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters"
                  }
                },
                render: ({ field }) => {
                  var _a2;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "First Name",
                      error: !!errors.firstName,
                      helperText: (_a2 = errors.firstName) == null ? void 0 : _a2.message,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "lastName",
                control,
                rules: {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters"
                  }
                },
                render: ({ field }) => {
                  var _a2;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "Last Name",
                      error: !!errors.lastName,
                      helperText: (_a2 = errors.lastName) == null ? void 0 : _a2.message,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "company",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    fullWidth: true,
                    label: "Company (Optional)",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)"
                      }
                    }
                  })
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "addressLine1",
                control,
                rules: {
                  required: "Address is required"
                },
                render: ({ field }) => {
                  var _a2;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "Address Line 1",
                      error: !!errors.addressLine1,
                      helperText: (_a2 = errors.addressLine1) == null ? void 0 : _a2.message,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "addressLine2",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    fullWidth: true,
                    label: "Address Line 2 (Optional)",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)"
                      }
                    }
                  })
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "city",
                  control,
                  rules: {
                    required: "City is required"
                  },
                  render: ({ field }) => {
                    var _a2;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TextField,
                      __spreadProps(__spreadValues({}, field), {
                        fullWidth: true,
                        label: "City",
                        error: !!errors.city,
                        helperText: (_a2 = errors.city) == null ? void 0 : _a2.message,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                          }
                        }
                      })
                    );
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "state",
                  control,
                  rules: {
                    required: "State/Province is required"
                  },
                  render: ({ field }) => {
                    var _a2;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TextField,
                      __spreadProps(__spreadValues({}, field), {
                        fullWidth: true,
                        label: "State/Province",
                        error: !!errors.state,
                        helperText: (_a2 = errors.state) == null ? void 0 : _a2.message,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                          }
                        }
                      })
                    );
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "postalCode",
                  control,
                  rules: {
                    required: "Postal code is required"
                  },
                  render: ({ field }) => {
                    var _a2;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TextField,
                      __spreadProps(__spreadValues({}, field), {
                        fullWidth: true,
                        label: "Postal Code",
                        error: !!errors.postalCode,
                        helperText: (_a2 = errors.postalCode) == null ? void 0 : _a2.message,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                          }
                        }
                      })
                    );
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "country",
                  control,
                  rules: {
                    required: "Country is required"
                  },
                  render: ({ field }) => {
                    var _a2;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      TextField,
                      __spreadProps(__spreadValues({}, field), {
                        fullWidth: true,
                        select: true,
                        label: "Country",
                        error: !!errors.country,
                        helperText: (_a2 = errors.country) == null ? void 0 : _a2.message,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                          }
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "US", children: "United States" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CA", children: "Canada" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "GB", children: "United Kingdom" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "AU", children: "Australia" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "DE", children: "Germany" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "FR", children: "France" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "JP", children: "Japan" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "OTHER", children: "Other" })
                        ]
                      })
                    );
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "phone",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    fullWidth: true,
                    label: "Phone Number (Optional)",
                    type: "tel",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)"
                      }
                    }
                  })
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "acceptTerms",
                  control,
                  rules: {
                    required: "You must accept the Terms of Service"
                  },
                  render: ({ field: { value, onChange } }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FormControlLabel,
                    {
                      control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Checkbox,
                        {
                          checked: value,
                          onChange,
                          color: "primary",
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, border: "2px solid", borderColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 } }),
                          checkedIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, backgroundColor: "primary.main", color: "#000", borderRadius: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 14 } }) })
                        }
                      ),
                      label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                        "I agree to the",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Link,
                          {
                            component: Link$1,
                            to: "/terms",
                            target: "_blank",
                            sx: { color: "primary.main" },
                            children: "Terms of Service"
                          }
                        )
                      ] }),
                      sx: __spreadValues({
                        alignItems: "flex-start"
                      }, errors.acceptTerms && {
                        color: "error.main"
                      })
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "acceptPrivacy",
                  control,
                  rules: {
                    required: "You must accept the Privacy Policy"
                  },
                  render: ({ field: { value, onChange } }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FormControlLabel,
                    {
                      control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Checkbox,
                        {
                          checked: value,
                          onChange,
                          color: "primary",
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, border: "2px solid", borderColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 } }),
                          checkedIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, backgroundColor: "primary.main", color: "#000", borderRadius: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 14 } }) })
                        }
                      ),
                      label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                        "I agree to the",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Link,
                          {
                            component: Link$1,
                            to: "/privacy",
                            target: "_blank",
                            sx: { color: "primary.main" },
                            children: "Privacy Policy"
                          }
                        )
                      ] }),
                      sx: __spreadValues({
                        alignItems: "flex-start"
                      }, errors.acceptPrivacy && {
                        color: "error.main"
                      })
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "marketingConsent",
                  control,
                  render: ({ field: { value, onChange } }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FormControlLabel,
                    {
                      control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Checkbox,
                        {
                          checked: value,
                          onChange,
                          color: "primary",
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, border: "2px solid", borderColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 } }),
                          checkedIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, backgroundColor: "primary.main", color: "#000", borderRadius: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 14 } }) })
                        }
                      ),
                      label: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "I would like to receive product updates and marketing communications (optional)" })
                    }
                  )
                }
              ),
              (errors.acceptTerms || errors.acceptPrivacy) && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "error.main", sx: { mt: 1, display: "block" }, children: ((_b = errors.acceptTerms) == null ? void 0 : _b.message) || ((_c = errors.acceptPrivacy) == null ? void 0 : _c.message) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                fullWidth: true,
                variant: "contained",
                size: "large",
                disabled: isSubmitting,
                sx: {
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000",
                  "&:hover": {
                    background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)"
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)"
                  }
                },
                children: isSubmitting ? "Creating Account..." : "Create Account"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "OR" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "Already have an account?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  component: Link$1,
                  to: "/login",
                  sx: {
                    color: "primary.main",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline"
                    }
                  },
                  children: "Sign in here"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 2, display: "block" }, children: "🔒 Your data is secure and protected by industry-leading encryption" })
          ] })
        ]
      }
    )
  ] }) }) });
};
export {
  RegisterPage as default
};
