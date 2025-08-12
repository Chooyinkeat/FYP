"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { TotalRows } from "@/types/admin";

const getData = async () => {
  try {
    const response = await axios.get("/api/protected/getReportCountAPI", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const Dashboard = () => {
  const [data, setData] = useState<TotalRows[] | null>(null);

  useEffect(() => {
    getData().then((response) => {
      if (response.status === 200) {
        setData(response.data);
      }
    });
  }, []);

  return (
    <>
      <div>
        <h1 className="mb-4 text-2xl font-bold">Dashboard Overview</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded bg-white p-4 shadow">
            📊 Total Reports : {data?.[0]?.total_rows}
          </div>
          <div className="rounded bg-white p-4 shadow">
            🤖 AI Prompts Managed
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
