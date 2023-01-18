import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import Chart from "chart.js/auto";

import { Button, Modal } from "antd";
import { Bar } from "react-chartjs-2";

const ModalChart = ({ tableData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    if (tableData.length) {
      const showData = tableData.filter((data) => data.completed);
      const chartDataSets = {};
      const colorSets = [];
      showData.forEach((user) => {
        if (chartDataSets[user.userId]) {
          chartDataSets[user.userId].push(user.title);
        } else {
          const randomColor = Math.floor(Math.random() * 16777215).toString(16);
          chartDataSets[user.userId] = [user.title];
          colorSets.push("#" + randomColor);
        }
      });
      const labels = Object.keys(chartDataSets);
      setChartData({
        labels: labels.map(
          (label) => "userID: " + label + chartDataSets[label].join("\n")
        ),
        datasets: labels.map((key, index) => ({
          type: "bar",
          label: "data" + key,
          key,
          backgroundColor: colorSets[index],
          borderWidth: 1,
          data: (() => {
            return labels.map((label) =>
              label == key ? chartDataSets[label].length : 0
            );
          })(),
        })),
        data: chartDataSets,
        lavelArray: labels,
      });
    }
  }, [tableData]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={showModal}
        style={{ float: " right", margin: 10, marginBottom: 0 }}
      >
        Open Chart
      </Button>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        <h2 style={{ textAlign: "center" }}>Bar Chart</h2>

        {chartData.labels && (
          <Bar
            data={chartData}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: "Number of Tasks completed task ",
                },
                legend: {
                  position: "right",
                  labels: {
                    usePointStyle: true,
                    fontColor: "#006192",
                  },
                },
              },
              scales: {
                x: {
                  stacked: true,
                  grid: {
                    display: false,
                  },
                  ticks: {
                    callback: (index) => {
                      const userId = chartData.lavelArray[index];
                      return "data " + userId;
                    },
                  },
                },
                y: {
                  stacked: true,
                },
              },
              responsive: true,
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default ModalChart;
