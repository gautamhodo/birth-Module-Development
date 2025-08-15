import React, { useState, useEffect } from "react";
import { Baby, Heart } from "lucide-react";
import "../styles/RecentActivities.css";
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'birth' | 'death';
  name: string;
  ipNumber: string;
  addedDate: Date;
  recordId: string;
}

const RecentActivities = () => {

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  // Fetch recent activities from birth and death records
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        console.log('Fetching recent activities from individual endpoints...');
        
        // Fetch both birth and death records
        const [birthResponse, deathResponse] = await Promise.all([
          fetch('http://192.168.50.171:5000/birthRecords'),
          fetch('http://192.168.50.171:5000/deathRecords')
        ]);

        let allActivities: Activity[] = [];

        // Process birth records
        if (birthResponse.ok) {
          const birthRecords = await birthResponse.json();
          const birthActivities = birthRecords
            .filter((record: any) => record.addedOn) // Only records with addedOn date
            .map((record: any) => ({
              id: `birth-${record.birthId}`,
              type: 'birth' as const,
              name: record.babyName || 'Unknown Baby',
              ipNumber: record.ipNumber || 'N/A',
              addedDate: new Date(record.addedOn),
              recordId: record.birthId
            }));
          allActivities = [...allActivities, ...birthActivities];
        }

        // Process death records
        if (deathResponse.ok) {
          const deathRecords = await deathResponse.json();
          const deathActivities = deathRecords
            .filter((record: any) => record.addedOn) // Only records with addedOn date
            .map((record: any) => ({
              id: `death-${record.deathId}`,
              type: 'death' as const,
              name: record.fullName || 'Unknown',
              ipNumber: record.ipNo || 'N/A',
              addedDate: new Date(record.addedOn),
              recordId: record.deathId
            }));
          allActivities = [...allActivities, ...deathActivities];
        }

        // Sort by addedDate (most recent first)
        allActivities.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());

        // Show latest 1 birth and latest 1 death
        const latestBirth = allActivities.find(activity => activity.type === 'birth');
        const latestDeath = allActivities.find(activity => activity.type === 'death');
        
        let filteredActivities: Activity[] = [];
        if (latestBirth) filteredActivities.push(latestBirth);
        if (latestDeath) filteredActivities.push(latestDeath);
        
        // Sort again to maintain chronological order
        filteredActivities.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
        
        console.log('Recent activities processed:', filteredActivities);
        setRecentActivities(filteredActivities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setRecentActivities([]);
      }
    };

    fetchRecentActivities();
  }, []); // Fetch once on component mount

  const formatDaysAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const handleActivityClick = (activity: Activity) => {
    const [type, recordId] = activity.id.split('-');
    if (type === 'death') {
      navigate(`/death-profile/${recordId}`);
    } else {
      navigate(`/profile/birth/${recordId}`);
    }
  };



  // Remove showAll, activitiesToShow, and more button logic

  return (
    <div className="recent-activities-card">
      <div className="recent-activities-header">
        <div>
          <span className="recent-activities-title">Recent Activity</span>
          <span className="recent-activities-subtitle">Latest Registrations</span>
        </div>
      </div>
      <div className="recent-activities-list">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="recent-activity-list-item"
              onClick={() => handleActivityClick(activity)}
            >
              {activity.type === 'birth' ? (
                <Baby className="recent-activity-list-icon birth-icon" />
              ) : (
                <Heart className="recent-activity-list-icon death-icon" />
              )}
              <div>
                <p className="recent-activity-list-text">
                  {activity.type === 'birth' ? 'New birth registered' : 'New death registered'}
                </p>
                <p className="recent-activity-list-subtext">
                  <span className="font-medium">IP: {activity.ipNumber}</span> • {activity.name} • {formatDaysAgo(activity.addedDate)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="recent-activities-empty">
            No recent activities
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
