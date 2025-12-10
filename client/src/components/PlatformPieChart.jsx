import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register the necessary Chart.js components for a Pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

const PlatformPieChart = ({ platforms }) => {
  // Handle the case where there's no data yet
  if (!platforms || platforms.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center text-gray-500">
        <p>No platform data to display yet.</p>
      </div>
    );
  }

  // Prepare data for the chart
  const data = {
    labels: platforms.map((p) => p.platform_name),
    datasets: [
      {
        label: "Problems Solved",
        data: platforms.map((p) => p.problems_solved),
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)", // Indigo
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(245, 158, 11, 0.8)", // Amber
          "rgba(239, 68, 68, 0.8)", // Red
          "rgba(139, 92, 246, 0.8)", // Purple
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: "#4B5563", // Gray-600
        },
      },
      tooltip: {
        backgroundColor: "#1E1B4B", // Dark indigo
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              // Calculate percentage
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.parsed / total) * 100);
              label += `${context.parsed} (${percentage}%)`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-gray-700 font-bold mb-4">Platform Contribution</h3>
      <div className="h-64 relative">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default PlatformPieChart;