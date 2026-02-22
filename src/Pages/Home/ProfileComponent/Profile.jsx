import React, { useState } from 'react';
import { User, FileText, ShieldCheck, Lock , Briefcase , Users} from 'lucide-react';
import MainInformation from '../tabs/MainInformation.jsx';
import KycInformation from '../tabs/KycInformation.jsx';
import Conditions from '../tabs/Conditions.jsx';
import Password from '../tabs/Password.jsx';
import Roles from '../tabs/Roles.jsx';
import Members from '../tabs/Members.jsx';


//  const Members = () => <div className="p-6 text-center">Members Component Coming Soon...</div>;

export default function Profile() {
  const [activeTab, setActiveTab] = useState('main');

  const tabs = [
    { id: 'main', label: 'Main Information', icon: User, component: MainInformation },
    { id: 'kyc', label: 'KYC Information', icon: FileText, component: KycInformation },
    { id: 'conditions', label: 'Conditions', icon: ShieldCheck, component: Conditions },
    { id: 'password', label: 'Password', icon: Lock, component: Password },
    { id: 'roles', label: 'Roles & Permissions', icon: Briefcase, component: Roles },
    { id: 'members', label: 'Team Members', icon: Users, component: Members },
  ];

  // 🔹 نجيب التب الحالي
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Company Profile
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* --- Sidebar --- */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <nav className="flex flex-col">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors border-l-4 ${
                        isActive
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* --- Main Content Area --- */}
          <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
            <div className="p-6">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}