import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopNavBar from './components/TopNavBar';
import BirthRecords from './pages/BirthRecords.tsx';
import Certificates from './pages/Certificates.tsx';
import DeathRecords from './pages/DeathRecords.tsx';
import Profile from './pages/Profile.tsx';
import PatientProfile from './pages/PatientProfile';
import Header from './components/Header.tsx';
import SideBar from './components/SideBar';
import Page from './pages/Page.tsx';
import Table from './pages/Table.tsx';
import Footer from './components/Footer.tsx';
import BirthReportDownload from './pages/BirthReportDownload';
import EditPatientProfile from './pages/EditPatientProfile';
import DeathProfile from './pages/DeathProfile';
import DeathReportDownload from './pages/DeathReportDownload';
import EditDeathProfile from './pages/EditDeathProfile';
// Define the props interface for components that receive sidebar props
// interface SidebarProps {
//   sidebarCollapsed: boolean;
//   toggleSidebar: () => void;
// }

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setSidebarCollapsed(!sidebarCollapsed);
  };  // const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // const toggleSidebar = (): void => {
  //   setSidebarCollapsed(!sidebarCollapsed);
  // };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',backgroundColor:'#d9e0e7' }}>
        {/* Horizontal Top Nav Bar */}
        <TopNavBar />

        {/* Main content with Sidebar + Page content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* <SideBar collapsed={sidebarCollapsed} /> */}
          <SideBar collapsed={sidebarCollapsed}/>
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
            <Routes>
              <Route path="/" element={<Page sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar}/>} />
              <Route path="/birth-records" element={<BirthRecords sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/death-records" element={<DeathRecords sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/certificates" element={<Certificates sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/a" element={<Table/>} />
              <Route path="/profile/:type/:id" element={<Profile />} />
              <Route path="/profile/birth/:id" element={<PatientProfile />} />
              <Route path="/birth-report/:id" element={<BirthReportDownload />} />
              <Route path="/edit-patient/:id" element={<EditPatientProfile />} />
              <Route path="/death-profile/:id" element={<DeathProfile />} />
              <Route path="/death-report/:id" element={<DeathReportDownload />} />
              <Route path="/edit-death/:id" element={<EditDeathProfile />} />
            </Routes>
<Footer/>
          </div>
          
        </div>


      </div>

    </Router> 
    
  );
};

export default App; 