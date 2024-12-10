// AdminUser.js

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles/AdminUser.css';

const AdminUser = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'GET',
        });
        const data = await response.json();

        if (response.ok) {
          setUsers(data);
        } else {
          console.error('Error en la respuesta:', data);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsAddingUser(false);
    setName(user.name);
    setEmail(user.email);
    setPermissions(user.permissions || []);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setMessage('No hay usuario seleccionado para actualizar.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/usersUpdate/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          permissions,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
        setMessage('Usuario actualizado correctamente.');
        setSelectedUser(null);  // Restablecer selección después de actualizar
      } else {
        console.error('Error al actualizar el usuario:', response.statusText);
        setMessage('Error al actualizar el usuario.');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      setMessage('Error al realizar la solicitud.');
    }
  };

  // Handle adding a new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddingUser(true);
    setName('');
    setEmail('');
    setPermissions([]);
    setMessage('');
  };

  // Handle creating a user
  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          permissions,
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setMessage('Usuario creado correctamente.');
        setIsAddingUser(false);
      } else {
        console.error('Error al crear el usuario:', response.statusText);
        setMessage('Error al crear el usuario.');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      setMessage('Error al realizar la solicitud.');
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/usersDelete/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Usuario eliminado correctamente.');
        setUsers(users.filter((user) => user.id !== userId));
        setSelectedUser(null);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Error al eliminar el usuario.');
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      setMessage('Error al realizar la solicitud.');
    }
  };

  // Handle cancelling the editing or adding of a user
  const handleCancelEdit = () => {
    setSelectedUser(null);
    setIsAddingUser(false);
    setName('');
    setEmail('');
    setPermissions([]);
    setMessage('');
  };

  return (
    <div className="list-container-admin-user">
      <h2 className="list-title-admin-user">Listado de Usuarios</h2>
      {message && <p className="message-admin-user">{message}</p>}
      {!isAddingUser && !selectedUser && (
        <>
          <ul className="user-list-admin-user">
            {users.length > 0 ? (
              users.map((user) => (
                <li key={user.id} className="user-list-item-admin-user" onClick={() => handleEditUser(user)}>
                  <div className="user-info-admin-user">
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                  <div className="user-permissions-admin-user">
                    <p><strong>Permisos:</strong> {user.permissions 
                      ? (Array.isArray(user.permissions) 
                          ? user.permissions.join(', ') 
                          : user.permissions.split(',').join(', ')) 
                      : 'Sin permisos'}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p className="no-users-admin-user">No hay usuarios disponibles.</p>
            )}
          </ul>
          <div className="list-button-container-admin-user">
            <button className="form-button-add-user-admin-user" onClick={handleAddUser}>Añadir Usuario</button>
          </div>
        </>
      )}
      {(selectedUser || isAddingUser) && (
        <div className="form-container-admin-user">
          <h2 className="form-title-admin-user">{selectedUser ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
          <form onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} className="register-form-admin-user">
            <div className="form-group-admin-user">
              <label>Nombre:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input-admin-user"
                required
              />
            </div>
            <div className="form-group-admin-user">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input-admin-user"
                required
              />
            </div>
            <div className="form-group-admin-user">
              <label>Permisos:</label>
              <Select
                isMulti
                options={[
                  { value: 'Administrador', label: 'Administrador' }, // Tiene todos los permisos.
                  { value: 'Usuario Basico', label: 'Usuario Basico' }, // Puede visualizar dashboardm ver ecxcels o descargarlos.
                ]}
                value={permissions.map((permission) => ({ value: permission, label: permission }))}
                onChange={(selectedOptions) => setPermissions(selectedOptions.map((option) => option.value))}
                className="form-select-multiple-admin-user"
                placeholder="--- Selecciona sus permisos ---"
              />
            </div>
            <div className="form-buttons-container-admin-user">
              <button type="submit" className="form-button-add-user-admin-user">
                {selectedUser ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
              {selectedUser && (
                <button type="button" onClick={() => handleDeleteUser(selectedUser.id)} className="form-button-delete-user-admin-user">
                  Borrar
                </button>
              )}
              <button type="button" onClick={handleCancelEdit} className="form-button-cancel-admin-user">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUser;
