import React, { useEffect, useState } from 'react';
import '../styles/page.css';
import Cards from '../components/Cards';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import RecentActivities from '../components/RecentActivities';
import QuickActions from '../components/QuickActions';
import DashboardCharts from '../components/DashboardCharts';
import ApiStatus from '../components/ApiStatus';
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
  const [birthCount, setBirthCount] = useState<number | string>('Loading...');
  const [deathCount, setDeathCount] = useState<number | string>('Loading...');
  const [totalCount, setTotalCount] = useState<number | string>('Loading...');
  const [certCount, setCertCount] = useState<number | string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        console.log('Fetching statistics from individual endpoints (primary method)...');
        
        try {
          // Use individual endpoints as primary method since they're working
          console.log('Using individual endpoints for statistics...');
          const endpoints = [
            { birth: 'http://192.168.50.171:5000/birthRecords', death: 'http://192.168.50.171:5000/deathRecords' },
            { birth: '/api/birthRecords', death: '/api/deathRecords' },
            { birth: 'http://localhost:5000/birthRecords', death: 'http://localhost:5000/deathRecords' }
          ];
          
          let birthData = null;
          let deathData = null;
          
          for (const endpointSet of endpoints) {
            try {
              const [birthResponse, deathResponse] = await Promise.all([
                fetch(endpointSet.birth),
                fetch(endpointSet.death)
              ]);
              
              if (birthResponse.ok && deathResponse.ok) {
                birthData = await birthResponse.json();
                deathData = await deathResponse.json();
                console.log('Individual endpoints successful:', endpointSet);
                console.log('Data counts:', { 
                  births: Array.isArray(birthData) ? birthData.length : 0,
                  deaths: Array.isArray(deathData) ? deathData.length : 0
                });
                break;
              }
            } catch (err) {
              console.log(`Failed to fetch from ${endpointSet.birth} and ${endpointSet.death}:`, err);
              continue;
            }
          }
          
          if (birthData && deathData) {
            const birthCount = Array.isArray(birthData) ? birthData.length : 0;
            const deathCount = Array.isArray(deathData) ? deathData.length : 0;
            
            setBirthCount(birthCount);
            setDeathCount(deathCount);
            const total = birthCount + deathCount;
            setTotalCount(total);
            setCertCount(total);
            
            console.log('Statistics loaded from individual endpoints:', { birthCount, deathCount, total });
            setIsLoading(false);
            return;
          }
          
          throw new Error('All individual endpoints failed');
          
        } catch (individualError) {
          console.error('Individual endpoints failed:', individualError);
          console.log('Using local db.json as final fallback...');
          
          try {
            // Final fallback to local db.json
            const response = await fetch('/db.json');
            if (response.ok) {
              const localData = await response.json();
              const birthCount = Array.isArray(localData.BirthRecords) ? localData.BirthRecords.length : 0;
              const deathCount = Array.isArray(localData.DeathRecords) ? localData.DeathRecords.length : 0;
              
              setBirthCount(birthCount);
              setDeathCount(deathCount);
              const total = birthCount + deathCount;
              setTotalCount(total);
              setCertCount(total);
              
              console.log('Local db.json data loaded:', { birthCount, deathCount, total });
              setIsLoading(false);
              return;
            }
          } catch (localError) {
            console.error('Local db.json also failed:', localError);
          }
          
          // Set error state if everything fails
          setBirthCount('Error');
          setDeathCount('Error');
          setTotalCount('Error');
          setCertCount('Error');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error in fetchStatistics:', error);
        // Set error state if everything fails
        setBirthCount('Error');
        setDeathCount('Error');
        setTotalCount('Error');
        setCertCount('Error');
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <>
    <ApiStatus />
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
          <Cards key={index} title={card.title} subtitle={card.subtitle} />
        ))}
      </div>
      
      {/* Charts Section */}
      <DashboardCharts />
      
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
