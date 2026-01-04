


import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ShoppingCart, Tag, DollarSign, TrendingUp, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usersAPI, ordersAPI, couponsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import EditMessage from '@/components/EditMessage';
import Select, { components, StylesConfig, MultiValue } from 'react-select';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import DashboardProducts from './ShowProd';

export default function Dashboard() {
  interface DashboardStats {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    activeCoupons: number;
    activeUsers: number,
  }
  interface Order {
    createdAt: string;
    pricing?: { total: number };
  }

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<{ [key: string]: string }>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<number>(0);

  const [orderTrends, setOrderTrends] = useState<{ month: string; orders: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);

  const [usersTrend, setUsersTrend] = useState<{ value: number; isPositive: boolean }>({ value: 0, isPositive: true });
  const [ordersTrend, setOrdersTrend] = useState<{ value: number; isPositive: boolean }>({ value: 0, isPositive: true });
  const [revenueTrend, setRevenueTrend] = useState<{ value: number; isPositive: boolean }>({ value: 0, isPositive: true });

  const [outOfStockProducts, setOutOfStockProducts] = useState<any[]>([]);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showAllStock, setShowAllStock] = useState(false);


  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalCoupons: 0,
    totalRevenue: 0,
    // monthlyRevenue: 0,  حذفتها من هون لانه قيمتها مش راجعة من API فعملتها منفصلة 
    pendingOrders: 0,
    activeUsers: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/orders/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Dashboard stats:', res.data.data);
      // const activeCoupons = res.data.filter((user: any) => user.isActive).length;
      // هون رجعت الداتا ما عدا التوتال كوبون لاني حسبتها لحالها تحت 
      const { totalCoupons, ...rest } = res.data.data;
      setStats(rest);
      // setStats(res.data.data);
      // setStats(activeCoupons)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard stats');
    }
    finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardStats();
    fetchStockStats();

  }, []);



  // ======================= Fetch Dashboard Stats =======================
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);


  const fetchDashboardData = async () => {
    try {

      // setLoading(true);
      const couponsData = await couponsAPI.getAll();
      // const couponsArray = couponsData.data?.coupons || [];
      const couponsArray = couponsData.data?.coupons || couponsData.data || [];


      // فلترة الكوبونات اللي ما انتهت صلاحيتها
      const activeCouponsArray = couponsArray.filter((coupon: any) => new Date(coupon.expires) > new Date());

      setActiveCoupons(activeCouponsArray.length);
      const [usersData, ordersData] = await Promise.all([
        usersAPI.getAll(),
        ordersAPI.getAll(),

        // couponsAPI.getAll(),
      ]);
      console.log("ordersData:", ordersData);
      const ordersArray: Order[] = ordersData.data?.orders || [];
      console.log("ordersArray:", ordersArray); // هون بتطبع فاضية لازم ما استخدمها 

      // const ordersArray = ordersData.data?.orders || ordersData.data || [];
      const usersArray = usersData.data?.users || usersData.data || [];
      // const couponsArray = couponsData.data?.coupons || couponsData.data || [];
      // =================== Charts ===================

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); // 0-11
      const monthsToShow = 6;
      const currentYear = currentDate.getFullYear();

      // totalRevenue = All Time (من API)
      // monthlyRevenue = الشهر الحالي (من الفرونت)


      // لحساب الريفينيو لكل شهر بحيث يعرض بالكارد ريفينيو الشهر الحالي 
      const monthlyRev = ordersData.data
        .filter((order: any) => {
          if (!order.Order_Date) return false;

          const [datePart] = order.Order_Date.split(',');
          const [day, month, year] = datePart.split('/').map(Number);
          const orderDate = new Date(year, month - 1, day);

          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear &&
            order.Status === 'delivered'
          );
        })
        .reduce(
          (sum: number, order: any) =>
            sum + (Number(order.Total_Amount) || 0),
          0
        );

      setMonthlyRevenue(monthlyRev);



      const monthName = (monthIndex: number) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[monthIndex];
      };



      // تجهيز بيانات الطلبات حسب آخر 6 أشهر
      const orderTrendsData = Array.from({ length: monthsToShow }, (_, i) => {
        const monthIndex = (currentMonth - (monthsToShow - 1 - i) + 12) % 12;


        const ordersInMonth = ordersData.data.filter((order: any) => {
          const [datePart] = order.Order_Date.split(',');
          const [day, month, year] = datePart.split('/').map(Number);

          const orderDate = new Date(year, month - 1, day); // month - 1 مهم
          return orderDate.getMonth() === monthIndex;
        });


        return { month: monthName(monthIndex), orders: ordersInMonth.length };
      });

      console.log("orderTrendsData:", orderTrendsData);

      setOrderTrends(orderTrendsData);


      const revenueData = Array.from({ length: monthsToShow }, (_, i) => {
        const monthIndex = (currentMonth - (monthsToShow - 1 - i) + 12) % 12;

        // Delivered Orders
        const deliveredOrdersInMonth = ordersData.data.filter((order: any) => {
          const [datePart] = order.Order_Date.split(',');
          const [day, month, year] = datePart.split('/').map(Number);
          const orderDate = new Date(year, month - 1, day);
          return orderDate.getMonth() === monthIndex && order.Status === 'delivered';
        });

        // Pending Orders
        const pendingOrdersInMonth = ordersData.data.filter((order: any) => {
          const [datePart] = order.Order_Date.split(',');
          const [day, month, year] = datePart.split('/').map(Number);
          const orderDate = new Date(year, month - 1, day);
          return orderDate.getMonth() === monthIndex && order.Status === 'pending';
        });
        // Cancelled Orders
        const cancelledOrdersInMonth = ordersData.data.filter((order: any) => {
          const [datePart] = order.Order_Date.split(',');
          const [day, month, year] = datePart.split('/').map(Number);
          const orderDate = new Date(year, month - 1, day);
          return orderDate.getMonth() === monthIndex && order.Status === 'cancelled';
        });

        const deliveryFeesIncome = deliveredOrdersInMonth.reduce(
          (total: number, order: any) => total + (order.Shipping || 0),
          0
        );

        console.log("Total delivery fees income:", deliveryFeesIncome);



        const revenueInMonth = deliveredOrdersInMonth.reduce(
          (sum: number, order: any) => sum + (Number(order.Total_Amount) || 0),
          0
        );
        console.log("pendingggg", pendingOrdersInMonth.length);
        console.log("cancelled", cancelledOrdersInMonth.length);


        return {
          month: monthName(monthIndex),
          year: new Date().getFullYear(), // أضف السنة هنا

          revenue: revenueInMonth,
          deliveredOrders: deliveredOrdersInMonth.length,
          pendingOrders: pendingOrdersInMonth.length, // هاذه عدد الطلبات المعلقة
          cancelledOrders: cancelledOrdersInMonth.length,
          deliveryFeesIncome: deliveryFeesIncome,
        };
      });
      setRevenueData(revenueData);


      const totalRevenue = ordersArray.reduce((sum: number, order: any) => sum + (order.pricing?.total || 0), 0);

      const activeUsersCount = usersArray.filter((user: any) => user.isActive).length;


      // const activeCoupons = usersArray.filter((user: any) => user.isActive).length;
      // هاي ما بتلزم , انا بجيب البيانات من API
      //في setStatsفوق 
      // setStats({
      //   totalUsers: usersArray.length,
      //   totalOrders: ordersArray.length,
      //   totalCoupons: couponsArray.length,
      //   // activeCoupons:couponsArray.length,
      //   totalRevenue,
      //   pendingOrders: pendingOrdersCount,
      //   activeUsers: activeUsersCount,
      // });

      // const activeCoupons = usersArray.filter((coupon: any) => new Date(coupon.expires) > new Date());
      // setTotalCoupons(couponsArray.length);

      //تحديث نسبة المستخدمين مع الشهر السابق 
      const currentMonthUsers = usersArray.filter((u: any) => {
        const createdDate = new Date(u.createdAt);
        return createdDate.getMonth() === new Date().getMonth();
      }).length;

      const lastMonthUsers = usersArray.filter((u: any) => {
        const createdDate = new Date(u.createdAt);
        const lastMonth = (new Date().getMonth() - 1 + 12) % 12;
        return createdDate.getMonth() === lastMonth;
      }).length;

      const usersTrendValue = lastMonthUsers === 0 ? 100 : Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100);
      setUsersTrend({ value: Math.abs(usersTrendValue), isPositive: usersTrendValue >= 0 });


      //تحديث نسبة الاوردر مع الشهر السابق 
      const currentMonthOrders = ordersData.data.filter((order: any) => {
        const [day, month, year] = order.Order_Date.split(',')[0].split('/').map(Number);
        const orderDate = new Date(year, month - 1, day);
        return orderDate.getMonth() === currentMonth;
      }).length;

      const lastMonth = (currentMonth - 1 + 12) % 12;
      const lastMonthOrders = ordersData.data.filter((order: any) => {
        const [day, month, year] = order.Order_Date.split(',')[0].split('/').map(Number);
        const orderDate = new Date(year, month - 1, day);
        return orderDate.getMonth() === lastMonth;
      }).length;

      const trendValue = lastMonthOrders === 0 ? 100 : Math.round(((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100);
      setOrdersTrend({ value: Math.abs(trendValue), isPositive: trendValue >= 0 });


      // تحديث نسبة الارباح مع للشهر السابق 
      const currentMonthRevenue = revenueData.reduce((sum, r) => {
        return r.month === monthName(currentMonth) ? sum + r.revenue : sum;
      }, 0);

      const lastMonthIndex = (currentMonth - 1 + 12) % 12;
      const lastMonthRevenue = revenueData.reduce((sum, r) => {
        return r.month === monthName(lastMonthIndex) ? sum + r.revenue : sum;
      }, 0);

      const revenueTrendValue = lastMonthRevenue === 0 ? 100 : Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
      setRevenueTrend({ value: Math.abs(revenueTrendValue), isPositive: revenueTrendValue >= 0 });



    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to fetch dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ======================= Fetch Users & Messages =======================
  useEffect(() => {
    const fetchUsersAndMessages = async () => {
      try {
        const token = localStorage.getItem('token');

        const [usersRes] = await Promise.all([
          // هاي عشان اعمل فيتش لليوزر
          axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }  // trick to bypass cache
          }),

        ]);

        const usersArray = usersRes.data.data.users || [];
        setUsersList(usersArray);
        // هون طبعت النتيجة الي راجعة من API لحتى اتاكد انه رجعهم
        console.log(usersRes);
        // هون لحتى يجيب فقط المستخدمين , مش الكل مع الادمن
        const users = usersArray.filter((u: { role: string; }) => u.role === 'user');
        setUsersList(users);
        const map: { [key: string]: string } = {};
        users.forEach((u: { _id: string | number; firstName: any; lastName: any; }) => {
          map[u._id] = `${u.firstName} ${u.lastName}`;
        });
        setUsersMap(map);

        // setMessages(messagesRes.data.messages || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsersAndMessages();
  }, []);


  const getMinVariantStock = (product: any): number => {
    if (!product.variants || product.variants.length === 0) return 0;

    const stocks = product.variants.flatMap((variant: any) =>
      variant.options?.map((opt: any) => opt.stock) || []
    );

    return stocks.length ? Math.min(...stocks) : 0;
  };


  const fetchStockStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      const products = res.data?.data?.products || [];

      const outOfStock = products.filter(
        (p: any) => getMinVariantStock(p) === 0
      );
      const lowStock = products.filter((p: any) => {
        const stock = getMinVariantStock(p);
        return stock > 0 && stock <= 5;
      });


      setOutOfStockCount(outOfStock.length);
      setLowStockCount(lowStock.length);

      setOutOfStockProducts(outOfStock);
      setLowStockProducts(lowStock);

    } catch (error) {
      console.error('Failed to fetch stock stats', error);
    }
  };

  useEffect(() => {
    const fetchAdminMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/messages/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages || []);
        console.log('Admin messages:', res.data.messages);

      } catch (err) {
        console.error('Failed to fetch admin messages:', err);
      }
    };

    fetchAdminMessages();
  }, []);

  return (

    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      ) : (
        <>

          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Statistics Cards */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} description={`${stats.activeUsers} active users`} trend={usersTrend}
              />
              <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} description={`${stats.pendingOrders} pending orders`} trend={ordersTrend} />
              <div
                // onClick={() => navigate("/revenue",{ state: { revenueData: revenueData, orderTrends: orderTrends } })}
                onClick={() => navigate("/revenue", {
                  state: { revenueData, orderTrends }
                })}



                style={{ cursor: "pointer" }}
                className="stat-card"
              >
                <StatCard title="Monthly Revenue" value={`₪${monthlyRevenue.toFixed(2)}`} icon={DollarSign} description="Revenue for current month" trend={revenueTrend} />
              </div>
              <StatCard title="Active Coupons" value={activeCoupons} icon={Tag} description="Currently available" />

              {/* <StatCard title="Active Coupons" value={stats.totalCoupons} icon={Tag} description="Currently available" /> */}
              <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Package} description="Awaiting processing" />
              <StatCard title="Growth Rate" value="23%" icon={TrendingUp} description="Monthly growth" trend={{ value: 5, isPositive: true }} />
            </div>


            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Order Trends</CardTitle>
                  <CardDescription>Monthly order volume over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={orderTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue in NIS over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Stock Alert
                </CardTitle>
                <CardDescription className="text-sm">
                  Products that require special attention due to low stock or out-of-stock quantities                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-muted-foreground">
                        <th className="px-5 py-3 text-left font-medium">
                          Product
                        </th>
                        <th className="px-5 py-3 text-center font-medium">
                          Stock
                        </th>
                        <th className="px-5 py-3 text-right font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...outOfStockProducts, ...lowStockProducts]
                        .slice(0, showAllStock ? undefined : 5)
                        .map((product) => {
                          const minStock = getMinVariantStock(product);

                          return (
                            <tr
                              key={product._id}
                              className="border-b last:border-0 hover:bg-muted/20 transition"
                            >
                              <td className="px-5 py-4 font-medium text-foreground">
                                {product.name?.en || product.name}
                              </td>

                              <td className="px-5 py-4 text-center font-semibold">
                                {minStock}
                              </td>

                              <td className="px-5 py-4 text-right">
                                {minStock === 0 ? (
                                  <span className="inline-flex rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                                    Out of stock
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-md bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                                    Low stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                      {outOfStockProducts.length === 0 &&
                        lowStockProducts.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="py-10 text-center text-sm text-muted-foreground"
                            >
                              All products are sufficiently stocked
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                {[...outOfStockProducts, ...lowStockProducts].length > 5 && (
                  <div className="flex justify-start px-5 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-md"
                      onClick={() => setShowAllStock(!showAllStock)}
                    >
                      {showAllStock ? "Show Less" : "Show More"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* <PromoCodes /> */}
          {/* <DashboardProducts/> */}
        </>
      )}
    </DashboardLayout>
  );
}


