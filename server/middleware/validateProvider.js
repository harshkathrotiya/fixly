const validateProviderRegistration = (req, res, next) => {
  const { email, password, firstName, lastName, serviceDescription, serviceCategory, availability } = req.body;
  
  if (!email || !password || !firstName || !lastName || !serviceDescription || !serviceCategory) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required information'
    });
  }

  if (availability && !['Weekdays', 'Weekends', 'All Days', 'Custom'].includes(availability)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid availability value'
    });
  }

  next();
};

module.exports = { validateProviderRegistration };