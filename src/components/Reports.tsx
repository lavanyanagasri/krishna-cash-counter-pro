
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, DollarSign, FileText } from "lucide-react";

const Reports = () => {
  const [reportType, setReportType] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Mock data for demonstration
  const generateMockData = () => {
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-IN'),
        cash: Math.floor(Math.random() * 500) + 100,
        phonepe: Math.floor(Math.random() * 300) + 50,
        black: Math.floor(Math.random() * 200) + 50,
        white: Math.floor(Math.random() * 150) + 30,
        total: 0
      };
    }).reverse();

    dailyData.forEach(day => {
      day.total = day.cash + day.phonepe;
    });

    return dailyData;
  };

  const generateMonthlyData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return months.map(month => ({
      month,
      cash: Math.floor(Math.random() * 15000) + 5000,
      phonepe: Math.floor(Math.random() * 10000) + 3000,
      black: Math.floor(Math.random() * 8000) + 2000,
      white: Math.floor(Math.random() * 5000) + 1000,
      total: 0
    })).map(data => ({
      ...data,
      total: data.cash + data.phonepe
    }));
  };

  const dailyData = generateMockData();
  const monthlyData = generateMonthlyData();
  const currentData = reportType === "daily" ? dailyData : monthlyData;

  const salesTypeData = [
    { name: 'Cash', value: currentData.reduce((sum, item) => sum + item.cash, 0), color: '#22c55e' },
    { name: 'PhonePe', value: currentData.reduce((sum, item) => sum + item.phonepe, 0), color: '#3b82f6' }
  ];

  const xeroxTypeData = [
    { name: 'Black', value: currentData.reduce((sum, item) => sum + item.black, 0), color: '#6b7280' },
    { name: 'White', value: currentData.reduce((sum, item) => sum + item.white, 0), color: '#f97316' }
  ];

  const totalRevenue = currentData.reduce((sum, item) => sum + item.total, 0);
  const totalTransactions = currentData.length * Math.floor(Math.random() * 20) + 50;
  const averageTransaction = totalRevenue / totalTransactions;

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "monthly" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Transaction</p>
                <p className="text-2xl font-bold text-orange-600">₹{averageTransaction.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Report Period</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reportType === "daily" ? "7 Days" : "12 Months"}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={reportType === "daily" ? "date" : "month"} 
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  labelFormatter={(label) => `${reportType === "daily" ? "Date" : "Month"}: ${label}`}
                />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed {reportType === "daily" ? "Daily" : "Monthly"} Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{reportType === "daily" ? "Date" : "Month"}</TableHead>
                  <TableHead>Cash Sales</TableHead>
                  <TableHead>PhonePe Sales</TableHead>
                  <TableHead>Black Xerox</TableHead>
                  <TableHead>White Xerox</TableHead>
                  <TableHead>Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {reportType === "daily" ? row.date : row.month}
                    </TableCell>
                    <TableCell>₹{row.cash}</TableCell>
                    <TableCell>₹{row.phonepe}</TableCell>
                    <TableCell>₹{row.black}</TableCell>
                    <TableCell>₹{row.white}</TableCell>
                    <TableCell className="font-semibold">₹{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
