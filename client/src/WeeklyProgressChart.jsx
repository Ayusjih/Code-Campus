import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyProgressChart = ({ data }) => {
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Problems Solved',
        data: data,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(99, 102, 241, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(99, 102, 241)',
          'rgb(99, 102, 241)',
          'rgb(99, 102, 241)',
          'rgb(99, 102, 241)',
          'rgb(99, 102, 241)',
          'rgb(99, 102, 241)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Problems: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WeeklyProgressChart;