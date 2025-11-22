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

const BudgetPage = () => {
  const [budgets, setBudgets] = useState<{ [key: string]: number }>({});
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://smart-expense-analyser-backend.onrender.com/api/budget/all");
      const budgetMap: { [key: string]: number } = {};
      res.data.forEach((b: any) => {
        budgetMap[b.category] = b.amount;
      });
      setBudgets(budgetMap);
      setInputs({});
      setError(null);
    } catch (err) {
      setError("Failed to fetch budgets");
      console.log(err);
      
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (cat: string, value: string) => {
    setInputs((prev) => ({ ...prev, [cat]: value }));
  };

  const handleSetBudget = async (cat: string) => {
    const amount = parseFloat(inputs[cat]);
    if (isNaN(amount) || amount < 0) {
      setError("Please enter a valid amount");
      return;
    }
    try {
      await axios.post("https://smart-expense-analyser-backend.onrender.com/api/budget/set", {
        category: cat,
        amount,
      });
      setSuccess(`Budget for ${cat} set!`);
      setTimeout(() => setSuccess(null), 2000);
      fetchBudgets();
    } catch (err: unknown) {
      setError("Failed to set budget");
      console.log(err);
      
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Set Your Budgets</h1>
  
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-600 mb-4">{success}</div>}
  
          <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Current Budget</th>
                  <th className="text-left py-2">Set New Budget</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat) => (
                  <tr key={cat} className="border-t">
                    <td className="py-2 font-medium capitalize">{cat}</td>
                    <td className="py-2">${budgets[cat]?.toFixed(2) || "-"}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={inputs[cat] || ""}
                        onChange={(e) => handleInputChange(cat, e.target.value)}
                        className="px-2 py-1 border rounded w-24"
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => handleSetBudget(cat)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Set
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
  
  
};

export default BudgetPage; 