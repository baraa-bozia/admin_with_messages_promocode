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
import Select, { components,StylesConfig, MultiValue } from 'react-select';
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


  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalCoupons: 0, //activeCoupons هي نفسها 
    // activeCoupons:0,
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
    }, []);
  const [loading, setLoading] = useState(true);
const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<{ [key: string]: string }>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  // const [totalCoupons, setTotalCoupons] = useState([]);
  // const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
const [activeCoupons, setActiveCoupons] = useState<number>(0);

const [orderTrends, setOrderTrends] = useState<{ month: string; orders: number }[]>([]);
const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);


  // ======================= Fetch Dashboard Stats =======================
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  
  const fetchDashboardData = async () => {
    try {

      // setLoading(true);
          if (!stats.totalUsers) setLoading(true); //استخدمته لحل مشكلة التحديث
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

    // const ordersData = await ordersAPI.getAll();
    // const ordersArray = ordersData.data?.orders || [];
    


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

// //revenue in chart
// const revenueData = Array.from({ length: monthsToShow }, (_, i) => {
//   const monthIndex = (currentMonth - (monthsToShow - 1 - i) + 12) % 12;

//   const revenueInMonth = ordersData.data
//     .filter((order: any) => {
//       const [datePart] = order.Order_Date.split(',');
//       const [day, month, year] = datePart.split('/').map(Number);

//       const orderDate = new Date(year, month - 1, day);
//        return (
//         orderDate.getMonth() === monthIndex &&
//         order.Status === 'delivered' 
//       );
//     })
//     .reduce(
//       (sum: number, order: { Total_Amount: number }) =>
//         sum + (Number(order.Total_Amount) || 0),
//       0
//     );

//   return {
//     month: monthName(monthIndex),
//     revenue: revenueInMonth
//   };
// });

// console.log("revenueData:", revenueData);
// setRevenueData(revenueData);






// const revenueData = Array.from({ length: monthsToShow }, (_, i) => {
//   const monthIndex =
//     (currentMonth - (monthsToShow - 1 - i) + 12) % 12;

//   const ordersInMonth = ordersData.data.filter((order: any) => {
//     const [datePart] = order.Order_Date.split(",");
//     const [day, month, year] = datePart.split("/").map(Number);
//     const orderDate = new Date(year, month - 1, day);

//     return orderDate.getMonth() === monthIndex;
//   });

//   const deliveredOrders = ordersInMonth.filter(
//     (o: any) => o.Status === "delivered"
//   );

//   const pendingOrders = ordersInMonth.filter(
//     (o: any) => o.Status === "pending"
//   );

//   const revenue = deliveredOrders.reduce(
//     (sum: number, order: any) =>
//       sum + (Number(order.Total_Amount) || 0),
//     0
//   );
// console.log(
//   "Statuses:",
//   ordersInMonth.map((o: any) => o.Status)
// );
//   return {
//     month: monthName(monthIndex),
//     revenue,
//     totalOrders: ordersInMonth.length,
//     deliveredOrders: deliveredOrders.length,
//     pendingOrders: pendingOrders.length,
//   };
// });

// setRevenueData(revenueData);

// const buildMonthlyStats = (orders: any[], monthsToShow = 6) => {
//   const now = new Date();
//   const currentMonth = now.getMonth();
//   const currentYear = now.getFullYear();

//   const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

//   return Array.from({ length: monthsToShow }, (_, i) => {
//     const monthIndex = (currentMonth - (monthsToShow - 1 - i) + 12) % 12;

//     const ordersInMonth = orders.filter((o) => {
//       if (!o.Order_Date) return false;

//       const [datePart] = o.Order_Date.split(',');
//       const [day, month, year] = datePart.split('/').map(Number);
//       const d = new Date(year, month - 1, day);

//       return (
//         d.getMonth() === monthIndex &&
//         d.getFullYear() === currentYear
//       );
//     });

//     const delivered = ordersInMonth.filter(
//       o => o.Status?.toLowerCase().trim() === "delivered"
//     );

//     const pending = ordersInMonth.filter(
//       o => o.Status?.toLowerCase().trim() === "pending"
//     );

//     return {
//       month: months[monthIndex],
//       totalOrders: ordersInMonth.length,
//       deliveredOrders: delivered.length,
//       pendingOrders: pending.length,
//       revenue: delivered.reduce(
//         (sum, o) => sum + (Number(o.Total_Amount) || 0),
//         0
//       )
//     };
//   });
// };
// const monthlyStats = buildMonthlyStats(ordersData.data);

// setRevenueData(
//   monthlyStats.map(m => ({
//     month: m.month,
//     revenue: m.revenue,
//     deliveredOrders: m.deliveredOrders,
//     pendingOrders: m.pendingOrders,
//     totalOrders: m.totalOrders
//   }))
// );




// هاااااااااااااااااااااااااااااااد الصح 
// revenue + delivered orders in chart
// const revenueData = Array.from({ length: monthsToShow }, (_, i) => {
//   const monthIndex = (currentMonth - (monthsToShow - 1 - i) + 12) % 12;

//   // فلترة الأوردرز اللي بالشهر الحالي وتم توصيلها
//   const deliveredOrdersInMonth = ordersData.data.filter((order: any) => {
//     const [datePart] = order.Order_Date.split(',');
//     const [day, month, year] = datePart.split('/').map(Number);
//     const orderDate = new Date(year, month - 1, day);
//     return orderDate.getMonth() === monthIndex && order.Status === 'delivered';
//   });

//   const revenueInMonth = deliveredOrdersInMonth.reduce(
//     (sum: number, order: any) => sum + (Number(order.Total_Amount) || 0),
//     0
//   );
  

//   return {
//     month: monthName(monthIndex),
//     revenue: revenueInMonth,
//     deliveredOrders: deliveredOrdersInMonth.length, // عدد الأوردرز اللي تم توصيلها
//   };
// });

// console.log("revenueData with deliveredOrders:", revenueData);
// setRevenueData(revenueData);


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
      console.log("pendingggg",pendingOrdersInMonth.length);
            console.log("cancelled",cancelledOrdersInMonth.length);


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



      // const pendingOrdersCount = ordersData.data.filter((order: any) => order.Status === 'pending').length;
      // console.log("pending",pendingOrdersCount);
      const totalRevenue = ordersArray.reduce((sum: number, order: any) => sum + (order.pricing?.total || 0), 0);
    
      const activeUsersCount = usersArray.filter((user: any) => user.isActive).length;


      // const totalRevenue = ordersData.data.reduce((sum: number, order: any) => sum + (order.Total_Amount || 0), 0);
      // console.log("total",totalRevenue);
      //++++
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
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` }  // trick to bypass cache
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
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} description={`${stats.activeUsers} active users`} trend={{ value: 12, isPositive: true }} />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} description={`${stats.pendingOrders} pending orders`} trend={{ value: 8, isPositive: true }} />
           <div
      // onClick={() => navigate("/revenue",{ state: { revenueData: revenueData, orderTrends: orderTrends } })}
            onClick={() =>  navigate("/revenue", {
  state: { revenueData ,orderTrends}
})}

     

      style={{ cursor: "pointer" }}
      className="stat-card"
    >
          <StatCard title="Monthly Revenue" value={`₪${monthlyRevenue.toFixed(2)}`} icon={DollarSign} description="Revenue for current month" trend={{ value: 15, isPositive: true }}  />
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

       
      </div>
        {/* <PromoCodes /> */}
        {/* <DashboardProducts/> */}
</>
    )}
    </DashboardLayout>
  );
}

