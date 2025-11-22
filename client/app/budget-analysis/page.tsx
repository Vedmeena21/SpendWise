"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const CATEGORIES = [
  "food",
  "transportation",
  "entertainment",
  "shopping",
  "utilities",
  "healthcare",
  "others",
];

function getMonthRange(selectedDate: string) {
  const [year, month] = selectedDate.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

const BudgetAnalysisPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [categoryTotals, setCategoryTotals] = useState<{ [key: string]: number }>({});
  const [budgets, setBudgets] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgetAnalysis();
    // eslint-disable-next-line
  }, [selectedDate]);

  const fetchBudgetAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getMonthRange(selectedDate);
      const res = await axios.get("https://smart-expense-analyser-backend.onrender.com/api/analytics/monthly", {
        params: { startDate, endDate },
      });
      // Map budgets
      const budgetMap: { [key: string]: number } = {};
      (res.data.budgets || []).forEach((b: any) => {
        budgetMap[b.category] = b.amount;
      });
      setBudgets(budgetMap);
      setCategoryTotals(res.data.categoryTotals || {});
    } catch (err) {
      setError("Failed to fetch budget analysis");
      console.log(err);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Budget Analysis</h1>
      <p className="text-gray-500 text-center mb-6">See your spending vs. budget for each category this month.</p>
      <div className="mb-6 flex items-center gap-4 justify-center bg-white rounded-lg shadow p-4">
        <label htmlFor="month" className="font-medium">Select Month:</label>
        <input
          type="month"
          id="month"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
      </div>
      {error && <div className="text-red-500 mb-4 text-center font-semibold">{error}</div>}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 font-semibold text-gray-700">Category</th>
                <th className="text-left py-2 font-semibold text-gray-700">Budget</th>
                <th className="text-left py-2 font-semibold text-gray-700">Spent</th>
                <th className="text-left py-2 font-semibold text-gray-700">Progress</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => {
                const budget = budgets[cat] || 0;
                const spent = categoryTotals[cat] || 0;
                const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                const over = spent > budget;
                return (
                  <tr key={cat} className="border-t">
                    <td className="py-2 font-medium capitalize text-gray-800">{cat}</td>
                    <td className="py-2">${budget.toFixed(2)}</td>
                    <td className={`py-2 ${over ? "text-red-600 font-bold" : ""}`}>${spent.toFixed(2)}</td>
                    <td className="py-2">
                      <div className="w-full bg-gray-200 rounded h-4">
                        <div
                          className={`h-4 rounded ${over ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-1 text-gray-600">{budget > 0 ? `${Math.round(percent)}% used` : "No budget set"}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BudgetAnalysisPage; 