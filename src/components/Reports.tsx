import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, DollarSign, FileText, Printer } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useServices } from "@/hooks/useServices";

type ReportDataItem = {
  date?: string;
  month?: string;
  cash: number;
  phonepe: number;
  total: number;
  xerox: number;
  scanning: number;
  net_printing: number;
  spiral_binding: number;
  lamination: number;
  rubber_stamps: number;
};

const Reports = () => {
  const [reportType, setReportType] = useState("daily");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { transactions } = useTransactions();
  const { services } = useServices();

  const handlePrint = () => {
    const printContent = document.getElementById('printable-report');
    if (!printContent) return;

    // Get today's transactions for print
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Create table for today's transactions
    const transactionsTableHTML = todayTransactions.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Time</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Customer</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Payment</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Services</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Cost</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Discount</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa;">Final</th>
          </tr>
        </thead>
        <tbody>
          ${todayTransactions.map(transaction => {
            const service = services.find(s => s.id === transaction.service_id);
            const servicesText = transaction.is_multi_service 
              ? (transaction.notes?.match(/Multi-service: ([^|]+)/)?.[1] || 'Multiple Services')
              : (service?.name || 'Legacy Service');
            
            return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${transaction.time}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  ${transaction.customer_name || '-'}
                  ${transaction.customer_phone ? `<br><small>${transaction.customer_phone}</small>` : ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">${transaction.sales_type}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${servicesText}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${transaction.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₹${transaction.cost}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₹${transaction.estimation}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">₹${transaction.final_cost}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    ` : '<p style="text-align: center; color: #666;">No transactions found for today.</p>';

    // Calculate today's totals
    const todayTotal = todayTransactions.reduce((sum, t) => sum + t.final_cost, 0);
    const todayCash = todayTransactions.filter(t => t.sales_type === 'Cash').reduce((sum, t) => sum + t.final_cost, 0);
    const todayPhonePe = todayTransactions.filter(t => t.sales_type === 'PhonePe').reduce((sum, t) => sum + t.final_cost, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vaishnavi Jumbo Zerox - Daily Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 5px;
            }
            .company-subtitle {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 10px;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 15px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              font-size: 12px;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            .summary-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .summary-title {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 18px;
              font-weight: bold;
              color: #3b82f6;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Vaishnavi Jumbo Zerox</div>
            <div class="company-subtitle">Powered by Sri Murali Krishna Computers</div>
            <div class="report-title">Daily Report - ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
          
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-title">Total Transactions</div>
              <div class="summary-value">${todayTransactions.length}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Total Revenue</div>
              <div class="summary-value">₹${todayTotal.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Cash Sales</div>
              <div class="summary-value">₹${todayCash.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">PhonePe Sales</div>
              <div class="summary-value">₹${todayPhonePe.toLocaleString()}</div>
            </div>
          </div>

          <h3>Today's Transactions</h3>
          ${transactionsTableHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Process transactions for daily report (last 7 days)
  const dailyData = useMemo((): ReportDataItem[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date === date);
      
      const cashTotal = dayTransactions
        .filter(t => t.sales_type === 'Cash')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const phonepeTotal = dayTransactions
        .filter(t => t.sales_type === 'PhonePe')
        .reduce((sum, t) => sum + t.final_cost, 0);

      // Group by service types
      const xerox = dayTransactions
        .filter(t => t.service_type === 'xerox')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const scanning = dayTransactions
        .filter(t => t.service_type === 'scanning')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const net_printing = dayTransactions
        .filter(t => t.service_type === 'net_printing')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const spiral_binding = dayTransactions
        .filter(t => t.service_type === 'spiral_binding')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const lamination = dayTransactions
        .filter(t => t.service_type === 'lamination')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const rubber_stamps = dayTransactions
        .filter(t => t.service_type === 'rubber_stamps')
        .reduce((sum, t) => sum + t.final_cost, 0);

      return {
        date: new Date(date).toLocaleDateString('en-IN'),
        cash: cashTotal,
        phonepe: phonepeTotal,
        total: cashTotal + phonepeTotal,
        xerox,
        scanning,
        net_printing,
        spiral_binding,
        lamination,
        rubber_stamps
      };
    });
  }, [transactions]);

  // Process transactions for monthly report
  const monthlyData = useMemo((): ReportDataItem[] => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === index && 
               transactionDate.getFullYear() === parseInt(selectedYear);
      });
      
      const cashTotal = monthTransactions
        .filter(t => t.sales_type === 'Cash')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const phonepeTotal = monthTransactions
        .filter(t => t.sales_type === 'PhonePe')
        .reduce((sum, t) => sum + t.final_cost, 0);

      // Group by service types
      const xerox = monthTransactions
        .filter(t => t.service_type === 'xerox')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const scanning = monthTransactions
        .filter(t => t.service_type === 'scanning')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const net_printing = monthTransactions
        .filter(t => t.service_type === 'net_printing')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const spiral_binding = monthTransactions
        .filter(t => t.service_type === 'spiral_binding')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const lamination = monthTransactions
        .filter(t => t.service_type === 'lamination')
        .reduce((sum, t) => sum + t.final_cost, 0);
      
      const rubber_stamps = monthTransactions
        .filter(t => t.service_type === 'rubber_stamps')
        .reduce((sum, t) => sum + t.final_cost, 0);

      return {
        month,
        cash: cashTotal,
        phonepe: phonepeTotal,
        total: cashTotal + phonepeTotal,
        xerox,
        scanning,
        net_printing,
        spiral_binding,
        lamination,
        rubber_stamps
      };
    });
  }, [transactions, selectedYear]);

  const currentData = reportType === "daily" ? dailyData : monthlyData;

  const salesTypeData = [
    { name: 'Cash', value: currentData.reduce((sum, item) => sum + item.cash, 0), color: '#22c55e' },
    { name: 'PhonePe', value: currentData.reduce((sum, item) => sum + item.phonepe, 0), color: '#3b82f6' }
  ];

  const serviceTypeData = [
    { name: 'Xerox', value: currentData.reduce((sum, item) => sum + item.xerox, 0), color: '#3b82f6' },
    { name: 'Scanning', value: currentData.reduce((sum, item) => sum + item.scanning, 0), color: '#10b981' },
    { name: 'Net Printing', value: currentData.reduce((sum, item) => sum + item.net_printing, 0), color: '#f59e0b' },
    { name: 'Spiral Binding', value: currentData.reduce((sum, item) => sum + item.spiral_binding, 0), color: '#ef4444' },
    { name: 'Lamination', value: currentData.reduce((sum, item) => sum + item.lamination, 0), color: '#8b5cf6' },
    { name: 'Rubber Stamps', value: currentData.reduce((sum, item) => sum + item.rubber_stamps, 0), color: '#06b6d4' }
  ].filter(item => item.value > 0);

  const totalRevenue = currentData.reduce((sum, item) => sum + item.total, 0);
  const totalTransactions = transactions.filter(t => {
    if (reportType === "daily") {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });
      return last7Days.includes(t.date);
    } else {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === parseInt(selectedYear);
    }
  }).length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

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
          <div className="flex flex-wrap gap-4 items-center justify-between">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Print Today's Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div id="printable-report">
        {/* Summary Cards */}
        <div className="summary-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="summary-title text-sm text-gray-600">Total Revenue</p>
                  <p className="summary-value text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600 no-print" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="summary-title text-sm text-gray-600">Total Transactions</p>
                  <p className="summary-value text-2xl font-bold text-blue-600">{totalTransactions}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600 no-print" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="summary-title text-sm text-gray-600">Average Transaction</p>
                  <p className="summary-value text-2xl font-bold text-orange-600">₹{averageTransaction.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 no-print" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="summary-title text-sm text-gray-600">Report Period</p>
                  <p className="summary-value text-2xl font-bold text-purple-600">
                    {reportType === "daily" ? "7 Days" : "12 Months"}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600 no-print" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Hidden in print */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 no-print">
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
                    <TableHead>Xerox</TableHead>
                    <TableHead>Scanning</TableHead>
                    <TableHead>Net Printing</TableHead>
                    <TableHead>Spiral Binding</TableHead>
                    <TableHead>Lamination</TableHead>
                    <TableHead>Rubber Stamps</TableHead>
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
                      <TableCell>₹{row.xerox}</TableCell>
                      <TableCell>₹{row.scanning}</TableCell>
                      <TableCell>₹{row.net_printing}</TableCell>
                      <TableCell>₹{row.spiral_binding}</TableCell>
                      <TableCell>₹{row.lamination}</TableCell>
                      <TableCell>₹{row.rubber_stamps}</TableCell>
                      <TableCell className="font-semibold">₹{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
