export const setUserSession = (walletAddress, userInfo) => {
  let sessionData = {
    walletAddress,
    name: userInfo.name,
    role: userInfo.role,
    isAuthenticated: true
  };

  if (userInfo.role === "patient") {
    sessionData = {
      ...sessionData,
      age: userInfo.age?.toString?.() ?? "",
      bloodGroup: userInfo.bloodGroup,
      contactNumber: userInfo.contactNumber
    };
  } else if (userInfo.role === "provider") {
    sessionData = {
      ...sessionData,
      hospital: userInfo.hospital,
      specialization: userInfo.specialization,
      licenseNumber: userInfo.licenseNumber,
      contactNumber: userInfo.contactNumber
    };
  }

  sessionStorage.setItem('userSession', JSON.stringify(sessionData));
};

export const getUserSession = () => {
  const session = sessionStorage.getItem('userSession');
  return session ? JSON.parse(session) : null;
};

export const clearUserSession = () => {
  sessionStorage.removeItem('userSession');
};

export const isValidSession = () => {
  const session = getUserSession();
  return session && session.isAuthenticated && session.walletAddress && session.role;
};
