const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

const validateName = (name) => {
  if (!name) return true;
  const nameRegex = /^[a-zA-Z\s]{1,50}$/;
  return nameRegex.test(name);
};

const validateRegistration = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  const errors = [];

  if (!username) {
    errors.push({
      field: 'username',
      message: 'Username is required'
    });
  } else if (!validateUsername(username)) {
    errors.push({
      field: 'username',
      message: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores'
    });
  }

  if (!email) {
    errors.push({
      field: 'email',
      message: 'Email is required'
    });
  } else if (!validateEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  } else if (!validatePassword(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number'
    });
  }

  if (firstName && !validateName(firstName)) {
    errors.push({
      field: 'firstName',
      message: 'First name can only contain letters and spaces'
    });
  }

  if (lastName && !validateName(lastName)) {
    errors.push({
      field: 'lastName',
      message: 'Last name can only contain letters and spaces'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push({
      field: 'username',
      message: 'Username is required'
    });
  }

  if (!password || password.length === 0) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push({
      field: 'currentPassword',
      message: 'Current password is required'
    });
  }

  if (!newPassword) {
    errors.push({
      field: 'newPassword',
      message: 'New password is required'
    });
  } else if (!validatePassword(newPassword)) {
    errors.push({
      field: 'newPassword',
      message: 'New password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number'
    });
  }

  if (!confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Password confirmation is required'
    });
  } else if (newPassword !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Password confirmation does not match new password'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { email, firstName, lastName } = req.body;
  const errors = [];

  if (email && !validateEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (firstName && !validateName(firstName)) {
    errors.push({
      field: 'firstName',
      message: 'First name can only contain letters and spaces'
    });
  }

  if (lastName && !validateName(lastName)) {
    errors.push({
      field: 'lastName',
      message: 'Last name can only contain letters and spaces'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateEmail,
  validateUsername,
  validatePassword,
  validateName
};