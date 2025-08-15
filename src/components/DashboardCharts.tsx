import React, { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import '../styles/DashboardCharts.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ChartData {
  birthsByMonth: { month: string; count: number }[];
  deathsByMonth: { month: string; count: number }[];
  genderDistribution: { male: number; female: number };
  deliveryTypes: { type: string; count: number }[];
  monthlyTrends: { month: string; births: number; deaths: number }[];
}

const DashboardCharts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    birthsByMonth: [],
    deathsByMonth: [],
    genderDistribution: { male: 0, female: 0 },
    deliveryTypes: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  // Memoized helper functions
  const processDataByMonth = useMemo(() => {
    return (records: any[], dateField: string) => {
      const monthCounts: { [key: string]: number } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Initialize all months with 0
      months.forEach(month => monthCounts[month] = 0);

      console.log(`Processing ${records.length} records for ${dateField}`);
      
      let processedCount = 0;
      records.forEach((record, index) => {
        // Try multiple possible date field names
        const dateValue = record[dateField] || record.addedOn || record.dateOfBirth || record.dateOfDeath || record.createdAt;
        if (dateValue) {
          try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              const monthIndex = date.getMonth();
              const month = months[monthIndex];
              if (month) {
                monthCounts[month]++;
                processedCount++;
                if (index < 5) { // Log first 5 records for debugging
                  console.log(`Record ${index}: ${dateValue} -> ${month} (month ${monthIndex + 1})`);
                }
              }
            }
          } catch (error) {
            console.warn('Invalid date value:', dateValue, error);
          }
        } else {
          if (index < 3) {
            console.log(`Record ${index}: No date value found in:`, Object.keys(record));
          }
        }
      });
      
      console.log(`Processed ${processedCount} out of ${records.length} records for ${dateField}`);

      const result = months.map(month => ({ month, count: monthCounts[month] }));
      console.log(`Processed ${dateField} data by month:`, result);
      return result;
    };
  }, []);

  const processGenderDistribution = useMemo(() => {
    return (birthRecords: any[]) => {
      let male = 0, female = 0, unknown = 0;
      
      console.log('Processing gender distribution for', birthRecords.length, 'records');
      
      birthRecords.forEach((record, index) => {
        const gender = record.gender;
        // Based on API data: 1 = Female, 2 = Male
        if (gender === 1) {
          female++;
        } else if (gender === 2) {
          male++;
        } else {
          unknown++;
          if (index < 3) {
            console.log(`Record ${index} has unknown gender:`, gender);
          }
        }
      });
      
      console.log('Gender distribution result:', { 
        male, 
        female, 
        unknown, 
        totalRecords: birthRecords.length,
        sampleRecord: birthRecords[0]
      });
      
      return { male, female };
    };
  }, []);

  const processDeliveryTypes = useMemo(() => {
    return (birthRecords: any[]) => {
      const deliveryTypeCounts: { [key: string]: number } = {};
      birthRecords.forEach(record => {
        // Handle deliveryType as string or number
        const deliveryType = record.deliveryType;
        let type = 'Other';

        if (deliveryType === 1 || deliveryType === '1') {
          type = 'Normal';
        } else if (deliveryType === 2 || deliveryType === '2') {
          type = 'C-Section';
        }

        deliveryTypeCounts[type] = (deliveryTypeCounts[type] || 0) + 1;
      });

      const result = Object.entries(deliveryTypeCounts).map(([type, count]) => ({ type, count }));
      console.log('Processed delivery types:', result);
      return result;
    };
  }, []);

  const processMonthlyTrends = useMemo(() => {
    return (birthRecords: any[], deathRecords: any[]) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const birthsByMonth = processDataByMonth(birthRecords, 'addedOn');
      const deathsByMonth = processDataByMonth(deathRecords, 'addedOn');

      return months.map((month, index) => ({
        month,
        births: birthsByMonth[index].count,
        deaths: deathsByMonth[index].count
      }));
    };
  }, [processDataByMonth]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        console.log('Fetching chart data directly from individual endpoints...');

        // Fetch data directly from working endpoints
        const [birthResponse, deathResponse] = await Promise.all([
          fetch('http://192.168.50.171:5000/birthRecords'),
          fetch('http://192.168.50.171:5000/deathRecords')
        ]);

        if (!birthResponse.ok || !deathResponse.ok) {
          throw new Error(`Failed to fetch data: Birth ${birthResponse.status}, Death ${deathResponse.status}`);
        }

        const birthRecords = await birthResponse.json();
        const deathRecords = await deathResponse.json();

        console.log('Raw data fetched:', {
          birthCount: birthRecords.length,
          deathCount: deathRecords.length,
          sampleBirth: birthRecords[0],
          sampleDeath: deathRecords[0]
        });

        // Process birth data by month
        console.log('Processing chart data with records:', {
          birthRecordsCount: birthRecords?.length || 0,
          deathRecordsCount: deathRecords?.length || 0
        });

        const birthsByMonth = processDataByMonth(birthRecords || [], 'addedOn');
        const deathsByMonth = processDataByMonth(deathRecords || [], 'addedOn');

        // Process gender distribution from birth records
        const genderDistribution = processGenderDistribution(birthRecords || []);

        // Process delivery types
        const deliveryTypes = processDeliveryTypes(birthRecords || []);

        // Process monthly trends
        const monthlyTrends = processMonthlyTrends(birthRecords || [], deathRecords || []);

        console.log('Processed chart data:', {
          birthsByMonth,
          deathsByMonth,
          genderDistribution,
          deliveryTypes,
          monthlyTrends
        });

        const processedChartData = {
          birthsByMonth,
          deathsByMonth,
          genderDistribution,
          deliveryTypes,
          monthlyTrends
        };

        console.log('Final processed chart data:', processedChartData);
        
        // Verify we have some data
        const hasMonthlyData = birthsByMonth.some(item => item.count > 0);
        const hasGenderData = genderDistribution.male > 0 || genderDistribution.female > 0;
        
        console.log('Data verification:', {
          hasMonthlyData,
          hasGenderData,
          monthlyDataSample: birthsByMonth.slice(0, 3),
          genderData: genderDistribution
        });
        
        setChartData(processedChartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Set empty data if fetch fails
        setChartData({
          birthsByMonth: [],
          deathsByMonth: [],
          genderDistribution: { male: 0, female: 0 },
          deliveryTypes: [],
          monthlyTrends: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [processDataByMonth, processGenderDistribution, processDeliveryTypes, processMonthlyTrends]);

  // Memoized chart configurations
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#222',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#222',
        bodyColor: '#222',
        borderColor: '#0d92ae',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#666',
          font: {
            size: 11
          }
        },
        grid: {
          color: '#f0f0f0'
        }
      },
      y: {
        ticks: {
          color: '#666',
          font: {
            size: 11
          }
        },
        grid: {
          color: '#f0f0f0'
        }
      }
    }
  }), []);

  // Memoized chart data
  const monthlyBirthsData = useMemo(() => ({
    labels: chartData.birthsByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Birth Records',
        data: chartData.birthsByMonth.map(item => item.count),
        backgroundColor: '#0d92ae',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  }), [chartData.birthsByMonth]);

  const genderDistributionData = useMemo(() => ({
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [chartData.genderDistribution.male, chartData.genderDistribution.female],
        backgroundColor: ['#0d92ae', '#b2e4f1'],
        borderWidth: 2,
      }
    ]
  }), [chartData.genderDistribution]);

  const monthlyTrendsData = useMemo(() => ({
    labels: chartData.monthlyTrends.map(item => item.month),
    datasets: [
      {
        label: 'Births',
        data: chartData.monthlyTrends.map(item => item.births),
        borderColor: '#0d92ae',
        backgroundColor: 'rgba(13, 146, 174, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0d92ae',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      },
      {
        label: 'Deaths',
        data: chartData.monthlyTrends.map(item => item.deaths),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#dc3545',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  }), [chartData.monthlyTrends]);

  const deliveryTypesData = useMemo(() => ({
    labels: chartData.deliveryTypes.map(item => item.type),
    datasets: [
      {
        label: 'Delivery Types',
        data: chartData.deliveryTypes.map(item => item.count),
        backgroundColor: [
          'rgba(13, 146, 174, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(40, 167, 69, 0.8)'
        ],
        borderColor: [
          '#0d92ae',
          '#17a2b8',
          '#28a745'
        ],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  }), [chartData.deliveryTypes]);

  // Debug logging
  useMemo(() => {
    console.log('Monthly births chart data:', {
      labels: monthlyBirthsData.labels,
      data: monthlyBirthsData.datasets[0].data,
      totalCount: monthlyBirthsData.datasets[0].data.reduce((a, b) => a + b, 0)
    });

    console.log('Gender distribution chart data:', {
      labels: genderDistributionData.labels,
      data: genderDistributionData.datasets[0].data,
      male: chartData.genderDistribution.male,
      female: chartData.genderDistribution.female
    });

    console.log('Chart data for rendering:', {
      birthsByMonth: chartData.birthsByMonth,
      genderDistribution: chartData.genderDistribution,
      monthlyTrends: chartData.monthlyTrends
    });

    const hasData = chartData.birthsByMonth.some(item => item.count > 0) ||
      chartData.genderDistribution.male > 0 ||
      chartData.genderDistribution.female > 0;
    console.log('Has chart data:', hasData);
  }, [monthlyBirthsData, genderDistributionData, chartData]);

  if (loading) {
    return (
      <div className="charts-container">
        <div className="chart-loading">Loading charts data...</div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Birth Records</h3>
            <p>Birth registrations by month</p>
          </div>
          <div className="chart-content">
            <Bar data={monthlyBirthsData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Gender Distribution</h3>
            <p>Birth records by gender</p>
          </div>
          <div className="chart-content">
            <Doughnut
              data={genderDistributionData}
              options={{
                ...chartOptions,
                scales: undefined,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'bottom' as const
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card chart-card-wide">
          <div className="chart-header">
            <h3>Monthly Trends</h3>
            <p>Birth and death records comparison</p>
          </div>
          <div className="chart-content">
            <Line data={monthlyTrendsData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;