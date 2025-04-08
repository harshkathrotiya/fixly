import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import '../../styles/admin/admin.css';
import '../../styles/admin/users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <AdminLayout title="User Management">
      <div className="admin-table-container">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
          <Link to="/admin/users/create" className="admin-button-primary">
            Create User
          </Link>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table-header">Name</th>
              <th className="admin-table-header">Email</th>
              <th className="admin-table-header">Role</th>
              <th className="admin-table-header">Status</th>
              <th className="admin-table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="admin-table-cell">{user.name}</td>
                <td className="admin-table-cell">{user.email}</td>
                <td className="admin-table-cell">
                  <span className="user-role-badge">{user.role}</span>
                </td>
                <td className="admin-table-cell">
                  <span className={user.status === 'active' ? 'user-status-active' : 'user-status-inactive'}>
                    {user.status}
                  </span>
                </td>
                <td className="admin-table-cell">
                  <div className="user-actions">
                    <button className="admin-button-secondary">Edit</button>
                    <button className="admin-button-secondary text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default Users;