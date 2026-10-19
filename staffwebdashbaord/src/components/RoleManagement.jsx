import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  KeyRound,
  X,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';

export function RoleManagement({ showToast }) {
  const [roles, setRoles] = useState([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    permissions: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.getAllRoles({ search, status: statusFilter }),
        api.getPermissions(),
      ]);

      if (rolesRes?.data?.roles) {
        setRoles(rolesRes.data.roles);
      }
      if (permsRes?.data?.permissions) {
        setPermissionsCatalog(permsRes.data.permissions);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      permissions: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      status: role.status,
      permissions: role.permissions || [],
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (perm) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleSelectAllPerms = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [...permissionsCatalog],
    }));
  };

  const handleClearPerms = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a role name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRole) {
        await api.updateRole(editingRole._id, formData);
        showToast(`Role '${formData.name}' updated successfully`, 'success');
      } else {
        await api.createRole(formData);
        showToast(`Role '${formData.name}' created successfully`, 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await api.deleteRole(deleteCandidate._id);
      showToast(`Role '${deleteCandidate.name}' deleted`, 'success');
      setDeleteCandidate(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const activeCount = roles.filter((r) => r.status === 'active').length;
  const totalStaffAssigned = roles.reduce((sum, r) => sum + (r.staffCount || 0), 0);

  return (
    <div>
      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: '#E6F4EE', color: '#00684A' }}
          >
            <ShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{roles.length}</span>
            <span className="stat-label">Defined System Roles</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: '#E6F4EE', color: '#008E5E' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-label">Active Roles</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: '#FEF3C7', color: '#D97706' }}
          >
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalStaffAssigned}</span>
            <span className="stat-label">Assigned Staff Profiles</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: '#F1F5F9', color: '#111827' }}
          >
            <KeyRound size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{permissionsCatalog.length}</span>
            <span className="stat-label">Available Permissions</span>
          </div>
        </div>
      </div>

      {/* Main Roles Table Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Role Definitions & Access Matrix</h2>
            <p className="panel-description">
              Collection 3 (roles): Configure granular permissions and operational roles across staff
            </p>
          </div>

          <div className="toolbar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by role or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={16} />
              <span>Create New Role</span>
            </button>
          </div>
        </div>

        {/* Roles Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Permissions Catalog ({permissionsCatalog.length})</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Loading roles from backend...</div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon">
                        <ShieldCheck size={28} />
                      </div>
                      <div className="empty-title">No Roles Found</div>
                      <div className="empty-desc">
                        No roles match your search filters or the roles collection is empty.
                      </div>
                      <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                        <Plus size={16} /> Create Standard Role
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{role.name}</div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {role.description || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${role.status}`}>{role.status}</span>
                    </td>
                    <td>
                      <span className="code-tag">{role.staffCount || 0} members</span>
                    </td>
                    <td>
                      <div className="perm-pill-container">
                        {(role.permissions || []).slice(0, 5).map((perm) => (
                          <span key={perm} className="perm-pill">
                            {perm}
                          </span>
                        ))}
                        {(role.permissions || []).length > 5 && (
                          <span className="perm-pill" style={{ color: 'var(--primary)' }}>
                            +{(role.permissions || []).length - 5} more
                          </span>
                        )}
                        {(role.permissions || []).length === 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            No permissions assigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn-icon"
                          title="Edit Role"
                          onClick={() => handleOpenEditModal(role)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          title="Delete Role"
                          onClick={() => setDeleteCandidate(role)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Role Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New System Role'}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRole}>
              <div className="form-group">
                <label className="form-label">Role Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Operations Dispatcher"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Summarize the operational purpose of this role..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <label className="form-label">
                    Permissions Assignment ({formData.permissions.length} selected)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                      onClick={handleSelectAllPerms}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                      onClick={handleClearPerms}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="perm-checkbox-grid">
                  {permissionsCatalog.map((perm) => (
                    <label key={perm} className="perm-checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => handleTogglePermission(perm)}
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--accent-rose-bg)',
                  color: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <AlertTriangle size={28} />
              </div>
              <h3 className="modal-title">Delete Role?</h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                  marginTop: '0.5rem',
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to delete <strong>{deleteCandidate.name}</strong>?
                {deleteCandidate.staffCount > 0 && (
                  <span
                    style={{
                      display: 'block',
                      color: '#f43f5e',
                      marginTop: '0.5rem',
                      fontWeight: 600,
                    }}
                  >
                    Warning: {deleteCandidate.staffCount} staff member(s) are currently assigned
                    to this role. The deletion will be rejected by backend guardrails until they are reassigned.
                  </span>
                )}
              </p>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteCandidate(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteRole}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;
