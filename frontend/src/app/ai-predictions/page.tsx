"use client";
import React from "react";
import { TrendingUp, ShoppingCart, AlertTriangle, Star, Users, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";

const predictions = [
  { id: 1, type: "purchase", customer: "Rahul Sharma", prediction: "Premium Package", probability: 78, timeframe: "Next 3 days", icon: ShoppingCart, color: "green" },
  { id: 2, type: "churn", customer: "Amit Kumar", prediction: "Business chhod raha hai", probability: 65, timeframe: "Next 2 weeks", icon: AlertTriangle, color: "red" },
  { id: 3, type: "vip", customer: "Sneha Gupta", prediction: "VIP banega", probability: 82, timeframe: "Next 1 month", icon: Star, color: "yellow" },
  { id: 4, type: "product", customer: "Marketing Team", prediction: "Product X agle month chalega", probability: 71, timeframe: "Next 30 days", icon: Package, color: "blue" },
  { id: 5, type: "customer", customer: "Priya Patel", prediction: "Repeat purchase", probability: 89, timeframe: "Next 5 days", icon: Users, color: "purple" },
  { id: 6, type: "revenue", customer: "Sales Team", prediction: "Revenue spike expected", probability: 76, timeframe: "Next week", icon: TrendingUp, color: "indigo" },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; iconBg: string }> = {
    green: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", iconBg: "bg-green-100 dark:bg-green-900/40" },
    red: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/40" },
    yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400", iconBg: "bg-yellow-100 dark:bg-yellow-900/40" },
    blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/40" },
    purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", iconBg: "bg-purple-100 dark:bg-purple-900/40" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/40" },
  };
  return colors[color] || colors.blue;
};

export default function AIPredictionsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" /> AI Predictions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">AI bolega - Ye customer kal kharidega, Ye customer business chhod raha hai, Ye product agle month chalega</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2"><ArrowUpRight className="w-4 h-4" /><span className="text-sm font-medium">Purchase Predictions</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">23</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">High probability</p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2"><AlertTriangle className="w-4 h-4" /><span className="text-sm font-medium">Churn Alerts</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">8</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Need attention</p>
        </div>
        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2"><Star className="w-4 h-4" /><span className="text-sm font-medium">VIP Predictions</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">5</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Potential VIPs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((prediction) => {
          const Icon = prediction.icon;
          const colors = getColorClasses(prediction.color);
          return (
            <div key={prediction.id} className={`p-4 rounded-xl border ${colors.bg} border-gray-200 dark:border-gray-700`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{prediction.customer}</h3>
                    <span className={`text-sm font-bold ${colors.text}`}>{prediction.probability}%</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{prediction.prediction}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{prediction.timeframe}</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-${prediction.color}-500`} style={{ width: `${prediction.probability}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
