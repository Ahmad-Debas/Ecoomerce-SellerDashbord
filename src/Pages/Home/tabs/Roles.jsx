import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Plus, Briefcase, Shield, Edit, Trash2, X, Check, Loader2, AlertTriangle 
} from 'lucide-react';
import api from "../../../Services/api.js";

export default function Roles() {
  const queryClient = useQueryClient();
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  // 1. Fetch Roles
  const { data: rolesData, isLoading, isError } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/seller/team/roles');
      // حسب صورتك، الـ API يرجع data.items
      return res.data?.data?.items || res.data?.data || [];
    }
  });

  // 2. Fetch Available Permissions (للاستخدام داخل المودال)
  const { data: permissionsList } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await api.get('/seller/team/roles/permissions');
      // الـ API يرجع مصفوفة نصوص مباشرة
      return res.data.data || [];
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/seller/team/roles/${id}`),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      setDeleteId(null);
      queryClient.invalidateQueries(['roles']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete role");
    }
  });

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-blue-500" size={20}/> Roles & Permissions
          </h2>
          <p className="text-sm text-gray-500">Create custom roles and assign specific permissions to your team members.</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-sm whitespace-nowrap text-sm"
        >
          <Plus size={16} /> Create Role
        </button>
      </div>

      {/* --- Roles List (Table) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">Failed to load roles.</div>
        ) : rolesData?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Shield size={32} />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">No roles defined yet</h3>
             <p className="text-gray-500 text-sm mt-1">Create your first role to start delegating tasks securely.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-1/4">Role Name</th>
                  <th className="px-6 py-4 w-1/2">Permissions</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rolesData.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 capitalize">{role.name}</div>
                      {/* {role.created_at && <div className="text-xs text-gray-400 mt-1">{role.created_at}</div>} */}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                         {role.permissions?.length > 0 ? (
                            // عرض أول 4 صلاحيات فقط، والباقي نكتب +عدد
                            <>
                               {role.permissions.slice(0, 4).map(perm => (
                                  <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-mono border border-gray-200">
                                     {perm}
                                  </span>
                               ))}
                               {role.permissions.length > 4 && (
                                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-medium border border-blue-100">
                                     +{role.permissions.length - 4} more
                                  </span>
                               )}
                            </>
                         ) : (
                            <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleEdit(role)}
                             className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" 
                             title="Edit"
                           >
                              <Edit size={16} />
                           </button>
                           <button 
                             onClick={() => setDeleteId(role.id)}
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

      {/* --- Unified Create/Edit Modal --- */}
      {isModalOpen && (
        <RoleModal 
           isOpen={isModalOpen} 
           onClose={() => setIsModalOpen(false)} 
           initialData={editingRole}
           permissionsList={permissionsList}
        />
      )}

      {/* --- Delete Confirmation Dialog --- */}
      {deleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl text-center">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Role?</h3>
                  <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this role? Users assigned to this role might lose access.</p>
                  
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

// --- Unified Role Modal (Create & Edit) ---
function RoleModal({ onClose, initialData, permissionsList = [] }) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [selectedPermissions, setSelectedPermissions] = useState(initialData?.permissions || []);

  // 🔹 تجميع الصلاحيات (Grouping Logic)
  // تحويل ["products.view", "products.create", "finance.view"] 
  // إلى { products: ["products.view", "products.create"], finance: ["finance.view"] }
  const groupedPermissions = useMemo(() => {
     if (!permissionsList.length) return {};
     return permissionsList.reduce((acc, perm) => {
        const groupName = perm.split('.')[0]; // أخذ الكلمة قبل النقطة
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(perm);
        return acc;
     }, {});
  }, [permissionsList]);

  const mutation = useMutation({
    mutationFn: (data) => {
        if (isEditMode) {
            return api.put(`/seller/team/roles/${initialData.id}`, data);
        } else {
            return api.post('/seller/team/roles', data);
        }
    },
    onSuccess: () => {
      toast.success(`Role ${isEditMode ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['roles']);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Role name is required");
    if (selectedPermissions.length === 0) return toast.error("Select at least one permission");

    mutation.mutate({
        name,
        permissions: selectedPermissions
    });
  };

  const handleTogglePermission = (perm) => {
      setSelectedPermissions(prev => 
         prev.includes(perm) 
            ? prev.filter(p => p !== perm) 
            : [...prev, perm]
      );
  };

  // Toggle all permissions within a group
  const handleToggleGroup = (groupPerms) => {
      const allSelected = groupPerms.every(p => selectedPermissions.includes(p));
      if (allSelected) {
          // Remove all from group
          setSelectedPermissions(prev => prev.filter(p => !groupPerms.includes(p)));
      } else {
          // Add all from group
          const newPerms = new Set([...selectedPermissions, ...groupPerms]);
          setSelectedPermissions(Array.from(newPerms));
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
         
         {/* Modal Header */}
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-lg font-bold text-gray-800">
                    {isEditMode ? 'Edit Role' : 'Create New Role'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Define access levels for your team members.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
         </div>

         {/* Modal Body */}
         <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <form id="role-form" onSubmit={handleSubmit} className="space-y-8">
               
               {/* Role Name */}
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Role Name <span className="text-red-500">*</span></label>
                  <div className="relative max-w-md">
                     <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input 
                        type="text" required
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Accountant, Store Manager"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                     />
                  </div>
               </div>

               {/* Permissions Grid */}
               <div>
                   <div className="flex items-center justify-between mb-4">
                       <label className="text-xs font-semibold text-gray-500 uppercase">
                          Permissions Access <span className="text-red-500">*</span>
                       </label>
                       <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                           {selectedPermissions.length} selected
                       </span>
                   </div>

                   {Object.keys(groupedPermissions).length === 0 ? (
                       <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
                           Loading permissions...
                       </div>
                   ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {Object.entries(groupedPermissions).map(([group, perms]) => {
                               // Check if all perms in this group are selected
                               const isAllSelected = perms.every(p => selectedPermissions.includes(p));
                               
                               return (
                                 <div key={group} className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col">
                                     {/* Group Header */}
                                     <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                         <h4 className="font-semibold text-sm text-gray-800 capitalize">{group}</h4>
                                         <button 
                                            type="button" 
                                            onClick={() => handleToggleGroup(perms)}
                                            className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 hover:text-blue-800"
                                         >
                                            {isAllSelected ? 'Deselect All' : 'Select All'}
                                         </button>
                                     </div>
                                     {/* Group Items */}
                                     <div className="p-4 space-y-3 flex-1">
                                         {perms.map(perm => {
                                             // Extract the action part (e.g., "view" from "products.view")
                                             const actionName = perm.split('.')[1];
                                             const isChecked = selectedPermissions.includes(perm);
                                             
                                             return (
                                                 <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                                                     <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                                        {isChecked && <Check size={12} className="text-white" />}
                                                     </div>
                                                     <span className="text-sm text-gray-700 capitalize group-hover:text-gray-900">
                                                        {actionName}
                                                     </span>
                                                 </label>
                                             );
                                         })}
                                     </div>
                                 </div>
                               );
                           })}
                       </div>
                   )}
               </div>

            </form>
         </div>

         {/* Modal Footer */}
         <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
            <button 
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition"
            >
               Cancel
            </button>
            <button 
               type="submit" form="role-form"
               disabled={mutation.isPending}
               className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-70"
            >
               {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
               {isEditMode ? 'Update Role' : 'Create Role'}
            </button>
         </div>

      </div>
    </div>
  );
}