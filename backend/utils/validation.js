const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(.{8,16})$/;

const validateUser = (data, isRegistration = false) => {
  const { name, email, password, address, role } = data;

  if (name && (name.length < 20 || name.length > 60)) {
    return 'Name must be between 20 and 60 characters.';
  }
  
  if (address && address.length > 400) {
    return 'Address cannot exceed 400 characters.';
  }

  if (isRegistration && !email) {
      return 'Email is required.';
  }
  
  if (isRegistration && password && !passwordRegex.test(password)) {
    return 'Password must be 8-16 characters long and include at least one uppercase letter and one special character.';
  }

  if (role && ![1, 2, 3].includes(role)) {
    return 'Invalid role specified.';
  }

  return null;
};

const validateStore = (data) => {
    const { name, email, address } = data;
    
    if (!name || !email || !address) {
        return 'Store name, email, and address are required.';
    }

    if (address.length > 400) {
        return 'Address cannot exceed 400 characters.';
    }
    
    return null;
}

module.exports = { validateUser, validateStore };