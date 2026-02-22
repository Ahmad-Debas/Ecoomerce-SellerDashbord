import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Plus, Users, Search, MoreVertical, Edit, Trash2, Check, X, Loader2, Shield, Phone, Mail, Lock, User 
} from 'lucide-react';
import api from "../../../services/api.js";

export default function Members() {
  const queryClient = useQueryClient();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  // 1. Fetch Members
  const { data: membersData, isLoading, isError } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.get('/seller/team/members');
      return res.data.data.items || [];
    }
  });

  // 2. Fetch Roles (عشان نستخدمهم في الـ Dropdown وقت الإضافة/التعديل)
  const { data: rolesList } = useQuery({
    queryKey: ['rolesList'],
    queryFn: async () => {
      const res = await api.get('/seller/team/roles');
      return res.data.data?.items || res.data.data || [];
    },
    staleTime: 1000 * 60 * 10 // Cache roles for 10 mins
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/seller/team/members/${id}`),
    onSuccess: () => {
      toast.success("Member deleted successfully");
      setDeleteId(null);
      queryClient.invalidateQueries(['members']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete member");
    }
  });

  // 4. Status Update Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => 
        api.put(`/seller/team/members/${id}/status?status=${newStatus}`),
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries(['members']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  });

  // Handlers
  const handleCreate = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const handleStatusToggle = (member) => {
      const newStatus = member.status.toLowerCase() === 'active' ? 'inactive' : 'active';
      statusMutation.mutate({ id: member.id, newStatus });
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-500" size={20}/> Team Members
          </h2>
          <p className="text-sm text-gray-500">Manage your team access and roles.</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-sm whitespace-nowrap text-sm"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* --- Members List (Table) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">Failed to load members.</div>
        ) : membersData?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-gray-400" size={32} />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">No team members yet</h3>
             <p className="text-gray-500 text-sm mt-1">Invite your team to collaborate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {membersData.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {member.first_name[0]}{member.last_name[0]}
                          </div>
                          <div>
                              <div className="font-semibold text-gray-900">{member.first_name} {member.last_name}</div>
                              <div className="text-xs text-gray-400">ID: {member.id}</div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                         <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-gray-400"/> {member.email}
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-gray-400"/> {member.phone_number}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                         <Shield size={12} /> {member.role?.name || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <button 
                            onClick={() => handleStatusToggle(member)}
                            disabled={statusMutation.isPending}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition cursor-pointer hover:opacity-80 ${
                                member.status.toLowerCase() === 'active'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${member.status.toLowerCase() === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            {member.status}
                        </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleEdit(member)}
                             className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" 
                             title="Edit"
                           >
                              <Edit size={16} />
                           </button>
                           <button 
                             onClick={() => setDeleteId(member.id)}
                             className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" 
                             title="Delete"
                           >
                              <Trash2 size={16} />
                           </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Member Modal (Create & Edit) --- */}
      {isModalOpen && (
        <MemberModal 
           isOpen={isModalOpen} 
           onClose={() => setIsModalOpen(false)} 
           initialData={editingMember}
           rolesList={rolesList || []}
        />
      )}

      {/* --- Delete Confirmation Dialog --- */}
      {deleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl text-center">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Member?</h3>
                  <p className="text-sm text-gray-500 mt-2">Are you sure you want to remove this member from your team?</p>
                  
                  <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => setDeleteId(null)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                          {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : 'Delete'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

// --- Unified Member Modal Component ---
function MemberModal({ onClose, initialData, rolesList }) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
     first_name: '',
     last_name: '',
     email: '',
     phone_number: '',
     phone_code: '+20', // Default based on screenshot
     role_id: '',
     password: '',
     password_confirmation: ''
  });

  // Populate data for Edit
  useEffect(() => {
      if (initialData) {
          setFormData({
              first_name: initialData.first_name || '',
              last_name: initialData.last_name || '',
              email: initialData.email || '',
              phone_number: initialData.phone_number || '',
              phone_code: initialData.phone_code || '+20',
              role_id: initialData.role?.id || '',
              password: '', // Password resets on edit unless filled
              password_confirmation: ''
          });
      }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data) => {
        // تنظيف البيانات: إذا كنا في التعديل ولم يكتب باسورد، نحذفه من الـ Payload
        const payload = { ...data };
        if (isEditMode && !payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        if (isEditMode) {
            return api.put(`/seller/team/members/${initialData.id}`, payload);
        } else {
            return api.post('/seller/team/members', payload);
        }
    },
    onSuccess: () => {
      toast.success(`Member ${isEditMode ? 'updated' : 'added'} successfully`);
      queryClient.invalidateQueries(['members']);
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) {
         // Show first error
         toast.error(Object.values(errors)[0][0]);
      } else {
         toast.error(err.response?.data?.message || "Operation failed");
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditMode && !formData.password) return toast.error("Password is required for new members");
    if (formData.password && formData.password !== formData.password_confirmation) {
        return toast.error("Passwords do not match");
    }
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
         
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-bold text-gray-800">
                {isEditMode ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
         </div>

         <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="member-form" onSubmit={handleSubmit} className="space-y-5">
               
               {/* Name Row */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">First Name <span className="text-red-500">*</span></label>
                     <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Last Name <span className="text-red-500">*</span></label>
                     <input name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
               </div>

               {/* Contact Row */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Email <span className="text-red-500">*</span></label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Phone <span className="text-red-500">*</span></label>
                     <div className="flex gap-2">
                        <input name="phone_code" placeholder="+20" value={formData.phone_code} onChange={handleChange} className="w-16 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input name="phone_number" required value={formData.phone_number} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Role Select */}
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Assign Role <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <select 
                        name="role_id" 
                        required 
                        value={formData.role_id} 
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                     >
                        <option value="">Select Role</option>
                        {rolesList.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                     </select>
                  </div>
               </div>

               {/* Password Row */}
               <div className="pt-2 border-t border-gray-100">
                   <p className="text-xs text-gray-400 mb-3 uppercase font-medium">Security</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                         <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password {isEditMode && <span className="font-normal text-gray-400 lowercase">(leave blank to keep current)</span>}</label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Confirm Password</label>
                         <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" />
                      </div>
                   </div>
               </div>

            </form>
         </div>

         <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
            <button 
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition"
            >
               Cancel
            </button>
            <button 
               type="submit" form="member-form"
               disabled={mutation.isPending}
               className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-70"
            >
               {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
               {isEditMode ? 'Update Member' : 'Add Member'}
            </button>
         </div>

      </div>
    </div>
  );
}