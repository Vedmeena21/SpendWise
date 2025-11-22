
import UploadReceipt from "./component/UploadReceipt";
import Link from "next/link";
import { BarChart2, PieChart, Wallet, History } from "lucide-react";

const NAV_LINKS = [
  {
    href: "/analytics",
    label: "Analytics",
    icon: <BarChart2 className="w-5 h-5 mr-2" />,
  },
  {
    href: "/budget",
    label: "Set Budget",
    icon: <Wallet className="w-5 h-5 mr-2" />,
  },
  {
    href: "/budget-analysis",
    label: "Budget Analysis",
    icon: <PieChart className="w-5 h-5 mr-2" />,
  },
  {
    href: "/budget-history",
    label: "Budget History",
    icon: <History className="w-5 h-5 mr-2" />,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      {/* <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4 min-h-screen hidden md:flex">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-extrabold text-blue-600">Smart Expense Analyzer</h1>
          <p className="text-xs text-gray-400 mt-1">Your personal finance dashboard</p>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto text-center text-xs text-gray-300 pt-8">
          &copy; {new Date().getFullYear()} Smart Expense Analyzer
        </div>
      </aside> */}
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center md:hidden">
            <h1 className="text-2xl font-extrabold text-blue-600">Smart Expense Analyzer</h1>
            <p className="text-xs text-gray-400 mt-1">Your personal finance dashboard</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors border border-gray-200"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <UploadReceipt />
          </div>
        </div>
      </main>
    </div>
  );
}
