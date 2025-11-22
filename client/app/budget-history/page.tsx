"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowDown, ArrowUp } from "lucide-react";

const CATEGORIES = [
  "food",
  "transportation",
  "entertainment",
  "shopping",
  "utilities",
  "healthcare",
  "others",
];

function getDefaultPeriod() {
  const now = new Date();
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const past = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const start = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}`;
  return { start, end };
}

const BudgetHistoryPage = () => {
  const [period, setPeriod] = useState(getDefaultPeriod());
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<{ year: number; month: number }[]>([]);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [period]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://smart-expense-analyser-backend.onrender.com/api/budget/history", {
        params: { start: period.start, end: period.end },
      });
      setStats(res.data.stats || {});
      setMonths(res.data.months || []);
    } catch (err) {
      setError("Failed to fetch budget history");
      console.log(err);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-center">Budget History Analysis</h1>
      <p className="text-gray-500 text-center mb-8">Track your budget discipline over time for each category.</p>
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label className="font-medium text-gray-700">From</label>
          <input
            type="month"
            value={period.start}
            onChange={(e) => setPeriod((p) => ({ ...p, start: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label className="font-medium text-gray-700">To</label>
          <input
            type="month"
            value={period.end}
            onChange={(e) => setPeriod((p) => ({ ...p, end: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <span className="text-gray-400 text-sm mt-2 sm:mt-0">({months.length} months)</span>
      </div>
      {error && <div className="text-red-500 mb-4 text-center font-semibold">{error}</div>}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
            const s = stats[cat] || {};
            return (
              <div
                key={cat}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold capitalize text-gray-800">{cat}</span>
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500">Months Under</span>
                    <span className="text-2xl font-bold text-green-600 flex items-center gap-1">
                      <ArrowDown className="inline-block w-5 h-5" />{s.monthsUnder || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500">Months Over</span>
                    <span className="text-2xl font-bold text-red-500 flex items-center gap-1">
                      <ArrowUp className="inline-block w-5 h-5" />{s.monthsOver || 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-between mt-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500">Avg % Under</span>
                    <span className="text-lg font-semibold text-green-700">{s.avgUnderPct ? `${s.avgUnderPct.toFixed(1)}%` : "-"}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500">Avg % Over</span>
                    <span className="text-lg font-semibold text-red-700">{s.avgOverPct ? `${s.avgOverPct.toFixed(1)}%` : "-"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetHistoryPage;
