export const generateUserId = (role: 'faculty' | 'student', existingUsers: any[]) => {
  const prefix = role === 'faculty' ? 'FAC' : 'STU';
  const existingIds = existingUsers
    .filter(u => u.id.startsWith(prefix))
    .map(u => parseInt(u.id.slice(3)))
    .filter(id => !isNaN(id));
  
  const nextId = Math.max(0, ...existingIds) + 1;
  return `${prefix}${nextId.toString().padStart(3, '0')}`;
};

export const generateUsername = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0).toUpperCase()}${lastName}${Math.floor(Math.random() * 1000)}`;
};

export const generatePassword = (firstName: string) => {
  return `${firstName}123!`;
};

export const filterUsers = (users: any[], searchTerm: string, roleFilter: string) => {
  let filtered = users;

  if (searchTerm) {
    filtered = filtered.filter(u =>
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (roleFilter !== 'all') {
    filtered = filtered.filter(u => u.role === roleFilter);
  }

  return filtered;
};

export const updateUserPassword = (userId: string, newPassword: string) => {
  const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
  const updatedUsers = users.map((u: any) =>
    u.id === userId ? { ...u, password: newPassword } : u
  );
  localStorage.setItem('xenjonUsers', JSON.stringify(updatedUsers));
  return updatedUsers;
};

export const createNewUser = (formData: any, role: string, existingUsers: any[]) => {
  const newId = generateUserId(role as 'faculty' | 'student', existingUsers);
  const username = generateUsername(formData.firstName, formData.lastName);
  const password = generatePassword(formData.firstName);

  const newUser = {
    id: newId,
    username,
    email: formData.email,
    password,
    role,
    firstName: formData.firstName,
    lastName: formData.lastName,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [...existingUsers, newUser];
  localStorage.setItem('xenjonUsers', JSON.stringify(updatedUsers));
  
  return { newUser, updatedUsers };
};