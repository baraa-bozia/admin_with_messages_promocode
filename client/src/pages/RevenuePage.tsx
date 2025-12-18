

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

export interface MonthlyRevenue {
  monthIndex?: number;
  month: string;
  year: string;
  revenue: number;
  orders?: number;
  deliveredOrders?: number;
  pendingOrders?: number;
  cancelledOrders?: number;
  deliveryFeesIncome: number;
}


const RevenuePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { revenueData, orderTrends } = location.state as {
    revenueData: MonthlyRevenue[];
    orderTrends: any[];
  };

  const revenueWithOrders = revenueData.map((rev) => {
    const ordersForMonth = orderTrends.find((o: any) => o.month === rev.month);
        const ordersForYear = orderTrends.find((o: any) => o.year === rev.year);

    return {
      ...rev,
      orders: ordersForMonth?.orders || 0,
      ordersy: ordersForYear?.orders || 0,

      
    };
  });
  const totalRevenue = revenueWithOrders.reduce((sum, item) => sum + item.revenue, 0);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [filteredData, setFilteredData] = useState<MonthlyRevenue | null>(null);

  useEffect(() => {
    const data = revenueWithOrders.find(r => r.month === selectedMonth && Number (r.year) === selectedYear);
    setFilteredData(data || null);
  }, [selectedMonth, selectedYear, revenueWithOrders]);

  const exportToExcel = () => {
    const wsData = revenueWithOrders.map(item => ({
      Month: item.month,
      Revenue: item.revenue,
      "Total Orders": item?.orders || 0,
      "Delivered Orders": item.deliveredOrders || 0,
      "Pending Orders": item.pendingOrders || 0,
      "Returned Orders": item.cancelledOrders || 0,
      "Delivery Fees Income":item.deliveryFeesIncome,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    saveAs(blob, "RevenueData.xlsx");
  };

  // return (
  //   <div className="p-6 max-w-4xl mx-auto">
  //     <div className="flex items-center justify-between mb-8">
  //       <h1 className="text-3xl font-bold">Revenue Details</h1>
  //       <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
  //         <ArrowLeft className="w-4 h-4" />
  //         Back
  //       </Button>
  //     </div>

  //     <div className="flex gap-4 mb-6">
  //       <div>
  //         <label className="block mb-1">Year</label>
  //         <select
  //           value={selectedYear}
  //           onChange={(e) => setSelectedYear(Number(e.target.value))}
  //           className="border rounded p-2"
  //         >
  //           {years.map((y) => <option key={y} value={y}>{y}</option>)}
  //         </select>
  //       </div>
  //       <div>
  //         <label className="block mb-1">Month</label>
  //         <select
  //           value={selectedMonth}
  //           onChange={(e) => setSelectedMonth(e.target.value)}
  //           className="border rounded p-2"
  //         >
  //           {months.map((m) => <option key={m} value={m}>{m}</option>)}
  //         </select>
  //       </div>
  //     </div>
  //  <Card className="mb-8 shadow-lg">
  //       <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
  //          <CardTitle className="text-2xl">Total Revenue</CardTitle>
  //        </CardHeader>
  //        <CardContent className="pt-6">
  //          <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">
  //            ₪{totalRevenue.toFixed(2)}
  //         </p>
  //        </CardContent>
  //      </Card>
  //     {filteredData ? (
  //       <Card className="shadow-lg overflow-hidden">
  //         <CardHeader className="bg-gray-50 dark:bg-gray-900">
  //           <CardTitle className="text-xl">Report for {selectedMonth} {selectedYear}</CardTitle>
  //         </CardHeader>
  //         <CardContent>
          
  //           <Table>
  //             <TableHeader>
  //               <TableRow>
  //                 <TableHead>Metric</TableHead>
  //                 <TableHead>Value</TableHead>
  //               </TableRow>
  //             </TableHeader>
  //             <TableBody>
  //               <TableRow><TableCell>Total Orders</TableCell><TableCell>{filteredData.orders || 0}</TableCell></TableRow>

  //               <TableRow><TableCell>Pending Orders</TableCell><TableCell>{filteredData.pendingOrders || 0}</TableCell></TableRow>
  //               <TableRow><TableCell>Delivered Orders</TableCell><TableCell>{filteredData.deliveredOrders || 0}</TableCell></TableRow>
  //               <TableRow><TableCell>Returned Orders</TableCell><TableCell>{filteredData.cancelledOrders || 0}</TableCell></TableRow>
  //               <TableRow><TableCell>Revenue from Delivered Orders</TableCell><TableCell>₪{filteredData.revenue.toFixed(2)}</TableCell></TableRow>
  //               <TableRow><TableCell>Delivery Fees Income</TableCell><TableCell>₪{(filteredData.deliveredOrders || 0) * 10}</TableCell></TableRow>
  //             </TableBody>
  //           </Table>
  //           <Button onClick={exportToExcel} className="mr-2 mt-6">Export Excel</Button>
  //         </CardContent>
  //       </Card>
  //     ) : (
  //       <Card className="text-center py-12">
  //         <CardContent><p className="text-muted-foreground text-lg">No data for selected month/year.</p></CardContent>
  //       </Card>
  //     )}
  //   </div>
  // );

  return (
  <div className="p-8 max-w-5xl mx-auto bg-background">
    {/* Header مع زر Back أنيق */}
    <div className="flex items-center justify-between mb-10">
      <h1 className="text-4xl font-bold text-foreground">Revenue Details</h1>
      <Button
        variant="outline"
        size="lg"
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 rounded-xl border-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </Button>
    </div>

    {/* <Card className="mb-8 shadow-lg p-4 flex items-center justify-between"> */}
  {/* الهيدر */}
  <div className="mb-8 bg-gradient-to-r from-gray-600 to-gray-800 text-white p-4 rounded">
    <h2 className="text-2xl font-bold">Total Revenue:₪{totalRevenue.toFixed(2)}
</h2>
     {/* <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">
      ₪{totalRevenue.toFixed(2)}
    </p> */}
  </div>

  {/* الرقم */}
  {/* <div className="text-right ml-6">
    <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">
      ₪{totalRevenue.toFixed(2)}
    </p>
  </div> */}
{/* </Card> */}


    <Card className="mb-8 shadow-md">
      <CardContent className="pt-1">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>

 
  

    {filteredData ? (
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-2xl text-center">
            Report for {selectedMonth} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="text-lg font-semibold">Metric</TableHead>
                <TableHead className="text-lg font-semibold text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="py-5 text-lg">Total Orders</TableCell>
                <TableCell className="py-5 text-lg text-right font-bold text-primary">
                  {filteredData.orders || 0}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800 ">
                <TableCell className="py-5 text-lg ">Pending Orders</TableCell>
                <TableCell className="py-5 text-lg text-right font-bold text-red-800">
                  {filteredData.pendingOrders || 0}
                </TableCell>
              </TableRow>
             
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="py-5 text-lg">Returned Orders</TableCell>
                <TableCell className="py-5 text-lg text-right font-bold text-red-800">
                  {filteredData.cancelledOrders || 0}
                </TableCell>
              </TableRow>
               <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="py-5 text-lg">Delivered Orders</TableCell>
                <TableCell className="py-5 text-lg text-right font-bold text-primary">
                  {filteredData.deliveredOrders || 0}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="py-5 text-lg">Revenue from Delivered Orders</TableCell>
                <TableCell className="py-5 text-lg text-right font-bold text-primary">
                  ₪{filteredData.revenue.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="py-5 text-lg">Delivery Fees Income</TableCell>
                <TableCell className="py-5 text-lg text-right font-bold text-primary">
                  ₪{filteredData.deliveryFeesIncome.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* زر التصدير */}
          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={exportToExcel}
              className="px-10 py-6 text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black shadow-xl"
            >
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card className="text-center py-16 shadow-lg">
        <CardContent>
          <p className="text-xl text-muted-foreground">No data available for {selectedMonth} {selectedYear}</p>
        </CardContent>
      </Card>
    )}
  </div>
);
};

export default RevenuePage;
