import React, { useState, useEffect } from "react";
import { Baby, Heart } from "lucide-react";
import "../styles/RecentActivities.css";
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'birth' | 'death';
  name: string;
  date: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const RecentActivities = () => {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  // Mock data - replace with actual API call
  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const birthActivities = (data.birthRecords || []).map((record: any) => ({
          id: `birth-${record.id}`,
          type: 'birth',
          name: `${record.firstName} ${record.lastName}`,
          date: new Date(record.dateOfBirth),
          icon: Baby,
          color: 'text-success',
        }));
        const deathActivities = (data.deathRecords || []).map((record: any) => ({
          id: `death-${record.id}`,
          type: 'death',
          name: `${record.firstName} ${record.lastName}`,
          date: new Date(record.dateOfDeath),
          icon: Heart,
          color: 'text-danger',
        }));
        // Combine and sort by date descending
        const allActivities = [...birthActivities, ...deathActivities].sort((a, b) => b.date.getTime() - a.date.getTime());
        setRecentActivities(allActivities.slice(0, 1)); // Only keep the most recent
      });
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
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

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  // Remove showAll, activitiesToShow, and more button logic

  return (
    <div className="recent-activities-card">
      <div className="recent-activities-header">
        <div>
          <span className="recent-activities-title">Recent Activity</span>
          <span className="recent-activities-subtitle">Latest Registrations</span>
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={handleDateFilterChange}
          className="recent-activities-date-input"
        />
      </div>
      <div className="recent-activities-list">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="recent-activity-list-item"
              onClick={() => handleActivityClick(activity)}
            >
              <activity.icon className={`recent-activity-list-icon ${activity.color}`} />
              <div>
                <p className="recent-activity-list-text">
                  {activity.type === 'birth' ? 'New birth registered' : 'New death registered'}
                </p>
                <p className="recent-activity-list-subtext">
                  {activity.name} - {formatTimeAgo(activity.date)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="recent-activities-empty">
            {dateFilter ? "No activities found for selected date" : "No recent activities"}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
