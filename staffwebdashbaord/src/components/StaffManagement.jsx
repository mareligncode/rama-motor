import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Shield,
  Building2,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';

export function StaffManagement({ showToast }) {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    roleId: '',
    department: 'operations',
    staffCode: '',
    status: 'active',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes, deptRes] = await Promise.all([
        api.getAllStaffs({
          department: departmentFilter,
          status: statusFilter,
          search,
        }),
        api.getAllRoles({ status: 'active' }),
        api.getDepartments(),
      ]);

      if (staffRes?.data?.staffs) setStaffList(staffRes.data.staffs);
      if (rolesRes?.data?.roles) setRoles(rolesRes.data.roles);
      if (deptRes?.data?.departments) setDepartments(deptRes.data.departments);
    } catch (err) {
      showToast(err.message || 'Failed to fetch staff directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, statusFilter, search]);

  const handleOpenCreateModal = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      roleId: roles[0]?._id || '',
      department: departments[0] || 'operations',
      staffCode: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.userId?.fullName || '',
      phoneNumber: staff.userId?.phoneNumber || '',
      roleId: staff.roleId?._id || staff.roleId || '',
      department: staff.department,
      staffCode: staff.staffCode,
      status: staff.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    if (!formData.roleId) {
      showToast('Please select a role', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStaff) {
        await api.updateStaff(editingStaff._id, {
          roleId: formData.roleId,
          department: formData.department,
          staffCode: formData.staffCode,
        });
        showToast('Staff profile updated successfully', 'success');
      } else {
        if (!formData.phoneNumber) {
          showToast('Phone number is required for staff account registration', 'error');
          setSubmitting(false);
          return;
        }
        await api.createStaff({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          roleId: formData.roleId,
          department: formData.department,
          staffCode: formData.staffCode || undefined,
          status: formData.status,
        });
        showToast('Staff member added successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save staff member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (staffId, nextStatus) => {
    try {
      await api.updateStaffStatus(staffId, nextStatus);
      showToast(`Staff status updated to ${nextStatus}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await api.deleteStaff(deleteCandidate._id);
      showToast(`Staff profile '${deleteCandidate.staffCode}' deactivated`, 'success');
      setDeleteCandidate(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to remove staff member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const activeStaff = staffList.filter((s) => s.status === 'active').length;
  const suspendedStaff = staffList.filter((s) => s.status === 'suspended').length;
  const uniqueDepts = new Set(staffList.map((s) => s.department)).size;

  return (
    <div>
      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: '#E6F4EE', color: '#00684A' }}
          >
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{staffList.length}</span>
            <span className="stat-label">Total Staff Members</span>
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
            <span className="stat-value">{activeStaff}</span>
            <span className="stat-label">Active & On-Duty</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: '#FEF3C7', color: '#D97706' }}
          >
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{suspendedStaff}</span>
            <span className="stat-label">Suspended Staff</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: '#F1F5F9', color: '#111827' }}
          >
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{uniqueDepts}</span>
            <span className="stat-label">Active Departments</span>
          </div>
        </div>
      </div>

      {/* Staff Table Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Staff Operations Directory</h2>
            <p className="panel-description">
              Collection 4 (staffs): Manage employee profiles, operational departments, and assigned roles
            </p>
          </div>

          <div className="toolbar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by code, name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <UserPlus size={16} />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Code</th>
                <th>Employee / User</th>
                <th>Phone Number</th>
                <th>Department</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Loading staff from backend...</div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Users size={28} />
                      </div>
                      <div className="empty-title">No Staff Members Registered</div>
                      <div className="empty-desc">
                        No staff records match your query or the staff directory is empty.
                      </div>
                      <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                        <UserPlus size={16} /> Register First Staff
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff._id}>
                    <td>
                      <span className="code-tag">{staff.staffCode}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="user-avatar" style={{ width: '30px', height: '30px' }}>
                          {staff.userId?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {staff.userId?.fullName || 'Unnamed Staff'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            ID: {staff.userId?._id?.slice(-6) || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Phone size={14} />
                        <span>{staff.userId?.normalizedPhone || staff.userId?.phoneNumber || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-dept">
                        {staff.department?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-role">
                        {staff.roleId?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={staff.status}
                        onChange={(e) => handleQuickStatusChange(staff._id, e.target.value)}
                        className={`select-filter badge badge-${staff.status}`}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn-icon"
                          title="Edit Staff"
                          onClick={() => handleOpenEditModal(staff)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          title="Deactivate Staff"
                          onClick={() => setDeleteCandidate(staff)}
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

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingStaff ? `Edit Staff: ${editingStaff.staffCode}` : 'Register New Staff Member'}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitStaff}>
              {!editingStaff && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Abebe Bikila"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number * (+251 / 09...)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 0911223344 or +251911223344"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Operational Department *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role *</label>
                <select
                  className="form-select"
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Role --</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Staff Code (Optional - auto-generated if left blank)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. STF-0042"
                  value={formData.staffCode}
                  onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                />
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
                  {submitting ? 'Saving...' : editingStaff ? 'Update Profile' : 'Register Staff'}
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
              <h3 className="modal-title">Deactivate Staff Profile?</h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                  marginTop: '0.5rem',
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to deactivate staff profile{' '}
                <strong>{deleteCandidate.staffCode}</strong> (
                {deleteCandidate.userId?.fullName})? Their access to administrative functions will be
                immediately revoked.
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
                onClick={handleDeleteStaff}
                disabled={submitting}
              >
                {submitting ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;
