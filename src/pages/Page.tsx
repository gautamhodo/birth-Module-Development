import React, { useEffect, useState } from 'react';
import '../styles/page.css';
import Cards from '../components/Cards';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import RecentActivities from '../components/RecentActivities';
import QuickActions from '../components/QuickActions';
import db from '../../db.json';

// import Searchbar from '../components/Searchbar';
// import Table from '../components/Table';
// import vehicleData from '../../db.json';

interface PageProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const stats = db.statistics;

const Page: React.FC<PageProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [stats, setStats] = useState<any>({});
  const [birthCount, setBirthCount] = useState(0);
  const [deathCount, setDeathCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [certCount, setCertCount] = useState(0);

  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        setBirthCount((data.birthRecords || []).length);
        setDeathCount((data.deathRecords || []).length);
        setTotalCount((data.birthRecords || []).length + (data.deathRecords || []).length);
        setCertCount((data.birthRecords || []).length + (data.deathRecords || []).length); // Assuming certificates = all records
      });
  }, []);

  return (
    <>
    {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}

    {/* <div className="page-container"> */}
    <PageContainer>
    <SectionHeading title="Dashboard" subtitle="Overview of registration system statistics" />
      <div className="dashboard-summary-cards">
        {[
          { title: 'Total Birth Count', subtitle: birthCount },
          { title: 'Total Death Count', subtitle: deathCount },
          { title: 'Total Records', subtitle: totalCount },
          { title: 'Certificates Available', subtitle: certCount },
        ].map((card, index) => (
          <Cards key={index} title={card.title} subtitle={card.subtitle && card.subtitle !== 0 ? card.subtitle : undefined} />
        ))}
      </div>
      
      {/* Container for Recent Activities and Quick Actions side by side */}
      <div className="dashboard-components-container">
        <RecentActivities/>
        <QuickActions />
      </div>

      </PageContainer>
      {/* <Searchbar /> */}
      {/* <Table /> */}
    {/* </div> */}
    {/* <Footer/> */}
    </>
  );
};

export default Page;
