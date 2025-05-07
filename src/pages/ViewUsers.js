import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, Box, Chip, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Search, Edit, Delete, Add } from '@mui/icons-material';
import { ref, onValue, remove, update, set, get } from 'firebase/database';
import { database } from '../firebase'; // Adjust the import path as needed

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, admins: 0 });

  useEffect(() => {
    const usersRef = ref(database, 'Users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
      setUsers(userList);
      setFilteredUsers(userList);
      updateUserStats(userList);
    });
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (roleFilter === '' || user.role === roleFilter)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const updateUserStats = (userList) => {
    setUserStats({
      total: userList.length,
      active: userList.filter(user => user.status === 'active').length,
      admins: userList.filter(user => user.role === 'admin').length
    });
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData) => {
    if (selectedUser) {
      // Update existing user
      await update(ref(database, `Users/${selectedUser.id}`), userData);
    } else {
      // Add new user
      const nextIndex = await getNextUserIndex();
      await set(ref(database, `Users/${nextIndex}`), userData);
    }
    handleCloseDialog();
  };

  const getNextUserIndex = async () => {
    const usersRef = ref(database, 'Users');
    const snapshot = await get(usersRef);
    const data = snapshot.val();
    if (!data) return "1";
    const keys = Object.keys(data);
    const maxIndex = Math.max(...keys.map(Number));
    return (maxIndex + 1).toString();
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await remove(ref(database, `Users/${userId}`));
    }
  };

  return (
    <Container maxWidth="lg" className="standard-page">
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Chip label={`Total Users: ${userStats.total}`} color="primary" />
          <Chip label={`Active Users: ${userStats.active}`} color="success" style={{ marginLeft: 8 }} />
          <Chip label={`Admins: ${userStats.admins}`} color="secondary" style={{ marginLeft: 8 }} />
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New User
        </Button>
      </Box>

      <Box display="flex" mb={3}>
        <TextField
          label="Search Users"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search />
          }}
          style={{ marginRight: 16, flexGrow: 1 }}
        />
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar src={user.avatar} alt={user.name} style={{ marginRight: 8 }} />
                    {user.name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <UserDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </Container>
  );
}


function UserDialog({ open, onClose, onSave, user }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    avatar: ''
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(userData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          value={userData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email Address"
          type="email"
          fullWidth
          value={userData.email}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={userData.role}
            onChange={handleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={userData.status}
            onChange={handleChange}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="avatar"
          label="Avatar URL"
          type="text"
          fullWidth
          value={userData.avatar}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewUsers;