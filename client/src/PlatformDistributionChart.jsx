import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PlatformDistributionChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.platform),
    datasets: [
      {
        data: data.map(item => item.score),
        backgroundColor: data.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
        borderRadius: 6,
        spacing: 2,
      },
    ],
  };

  const total = data.reduce((sum, item) => sum + item.score, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      const { ctx } = chart;
      const { width, height } = chart;
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Total', width / 2, height / 2 - 10);
      
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillStyle = '#6366f1';
      ctx.fillText(total.toString(), width / 2, height / 2 + 15);
      ctx.restore();
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default PlatformDistributionChart;