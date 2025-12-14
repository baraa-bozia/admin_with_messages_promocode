// import { useEffect, useState } from 'react';
// import DashboardLayout from '@/components/DashboardLayout';
// import StatCard from '@/components/StatCard';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Users, ShoppingCart, Tag, DollarSign, TrendingUp, Package } from 'lucide-react';
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { usersAPI, ordersAPI, couponsAPI } from '@/lib/api';
// import { toast } from 'sonner';
// //++++++++++++++++++++++++++++++++++++++++++++
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import axios from 'axios';

// import DashboardMessages from '@/components/AdminMessages';

// export default function Dashboard() {

// //+++++++++++++++++++++
// const [usersList, setUsersList] = useState<any[]>([]);
// const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
// const [messageContent, setMessageContent] = useState('');
// const [messages, setMessages] = useState<any[]>([]);



//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalOrders: 0,
//     totalCoupons: 0,
//     totalRevenue: 0,
//     pendingOrders: 0,
//     activeUsers: 0,
//   });
  
//   const [loading, setLoading] = useState(true);

//   // Mock data for charts - in production, this would come from the API
//   const orderTrendsData = [
//     { month: 'Jan', orders: 45 },
//     { month: 'Feb', orders: 52 },
//     { month: 'Mar', orders: 61 },
//     { month: 'Apr', orders: 58 },
//     { month: 'May', orders: 70 },
//     { month: 'Jun', orders: 85 },
//   ];

//   const revenueData = [
//     { month: 'Jan', revenue: 4500 },
//     { month: 'Feb', revenue: 5200 },
//     { month: 'Mar', revenue: 6100 },
//     { month: 'Apr', revenue: 5800 },
//     { month: 'May', revenue: 7000 },
//     { month: 'Jun', revenue: 8500 },
//   ];


// //+++++++++++++++++++++++++++++++++++++++

// const [usersMap, setUsersMap] = useState<{ [key: string]: string }>({});

// useEffect(() => {
//   const fetchUsersAndMessages = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const [usersRes, messagesRes] = await Promise.all([
//         axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` }}),
//         axios.get(`http://localhost:5000/api/messages/user/admin_id`, { headers: { Authorization: `Bearer ${token}` }})
//       ]);

//       const usersArray = usersRes.data.users || [];
//       setUsersList(usersArray);

//       // Map IDs to full names
//       const map: { [key: string]: string } = {};
//       usersArray.forEach(u => {
//         map[u._id] = `${u.firstName} ${u.lastName}`;
//       });
//       setUsersMap(map);

//       setMessages(messagesRes.data.messages || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   fetchUsersAndMessages();
// }, []);










//   useEffect(() => {
//     fetchDashboardData();
    
//     // Set up polling for real-time updates every 30 seconds
//     const interval = setInterval(fetchDashboardData, 30000);
    
//     return () => clearInterval(interval);
//   }, []);
// const fetchDashboardData = async () => {
//   try {
//     setLoading(true);

//     const [usersData, ordersData, couponsData] = await Promise.all([
//       usersAPI.getAll(),
//       ordersAPI.getAll(),
//       couponsAPI.getAll(),
//     ]);

//     // ======= التحقق من هيكل البيانات =======
//     const ordersArray = ordersData.data?.orders || ordersData.data || [];
//     const usersArray = usersData.data?.users || usersData.data || [];
//     const couponsArray = couponsData.data?.coupons || couponsData.data || [];

//     console.log('Orders:', ordersArray);
//     console.log('Users:', usersArray);
//     console.log('Coupons:', couponsArray);

//     // ======= حساب الإحصائيات =======
//     const pendingOrdersCount = ordersArray.filter((order: any) => order.status === 'pending').length;
//     const totalRevenue = ordersArray.reduce((sum: number, order: any) => sum + (order.pricing?.total || 0), 0);
//     const activeUsersCount = usersArray.filter((user: any) => user.isActive).length;

//     setStats({
//       totalUsers: usersArray.length,
//       totalOrders: ordersArray.length,
//       totalCoupons: couponsArray.length,
//       totalRevenue,
//       pendingOrders: pendingOrdersCount,
//       activeUsers: activeUsersCount,
//     });

//   } catch (error: any) {
//     console.error('Dashboard fetch error:', error);
//     toast.error('Failed to fetch dashboard data: ' + (error.response?.data?.message || error.message));
//   } finally {
//     setLoading(false);
//   }
// };



//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center h-96">
//           <div className="text-muted-foreground">Loading dashboard...</div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-8">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
//           <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <StatCard
//             title="Total Users"
//             value={stats.totalUsers}
//             icon={Users}
//             description={`${stats.activeUsers} active users`}
//             trend={{ value: 12, isPositive: true }}
//           />
//           <StatCard
//             title="Total Orders"
//             value={stats.totalOrders}
//             icon={ShoppingCart}
//             description={`${stats.pendingOrders} pending orders`}
//             trend={{ value: 8, isPositive: true }}
//           />
//           <StatCard
//             title="Total Revenue"
//             value={`₪${stats.totalRevenue.toFixed(2)}`}
//             icon={DollarSign}
//             description="All time revenue"
//             trend={{ value: 15, isPositive: true }}
//           />
//           <StatCard
//             title="Active Coupons"
//             value={stats.totalCoupons}
//             icon={Tag}
//             description="Currently available"
//           />
//           <StatCard
//             title="Pending Orders"
//             value={stats.pendingOrders}
//             icon={Package}
//             description="Awaiting processing"
//           />
//           <StatCard
//             title="Growth Rate"
//             value="23%"
//             icon={TrendingUp}
//             description="Monthly growth"
//             trend={{ value: 5, isPositive: true }}
//           />
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <Card className="border-2">
//             <CardHeader>
//               <CardTitle>Order Trends</CardTitle>
//               <CardDescription>Monthly order volume over the last 6 months</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={orderTrendsData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
//                   <YAxis stroke="hsl(var(--muted-foreground))" />
//                   <Tooltip 
//                     contentStyle={{ 
//                       backgroundColor: 'hsl(var(--background))', 
//                       border: '1px solid hsl(var(--border))',
//                       borderRadius: '8px'
//                     }} 
//                   />
//                   <Line 
//                     type="monotone" 
//                     dataKey="orders" 
//                     stroke="hsl(var(--primary))" 
//                     strokeWidth={2}
//                     dot={{ fill: 'hsl(var(--primary))' }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card className="border-2">
//             <CardHeader>
//               <CardTitle>Revenue Overview</CardTitle>
//               <CardDescription>Monthly revenue in NIS over the last 6 months</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={revenueData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
//                   <YAxis stroke="hsl(var(--muted-foreground))" />
//                   <Tooltip 
//                     contentStyle={{ 
//                       backgroundColor: 'hsl(var(--background))', 
//                       border: '1px solid hsl(var(--border))',
//                       borderRadius: '8px'
//                     }} 
//                   />
//                   <Bar 
//                     dataKey="revenue" 
//                     fill="hsl(var(--primary))" 
//                     radius={[8, 8, 0, 0]}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>




              
//             </CardContent>
//           </Card>
//         </div>
// {/* +++++++++++++++++++ */}

// <Card className="border-2 mt-4">
//   <CardHeader>
//     <CardTitle>الرسائل المرسلة</CardTitle>
//     <CardDescription>عرض جميع الرسائل التي تم ارسالها</CardDescription>
//   </CardHeader>
//   <CardContent>
//     {messages.map(msg => (
//       <div key={msg._id} className="border p-2 mb-2 rounded">
//         <p><strong>المحتوى:</strong> {msg.content}</p>
//         <p>
//           <strong>لـ:</strong> {msg.recipients.map((id: string) => usersMap[id] || id).join(', ')}
//         </p>
//         <p>
//           <strong>تم القراءة بواسطة:</strong> {msg.readBy.length > 0 ? msg.readBy.map((id: string) => usersMap[id] || id).join(', ') : 'لا أحد بعد'}
//         </p>
//         <p><strong>التاريخ:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
//       </div>
//     ))}
//   </CardContent>
// </Card>

//         {/* <DashboardMessages /> */}

//       </div>
//     </DashboardLayout>
//   );
// }


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
// import PromoCodes from '@/pages/PromoCodes';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalCoupons: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// const [editingPromoId, setEditingPromoId] = useState<string | null>(null);


  // الرسائل
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<{ [key: string]: string }>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data للcharts
  const orderTrendsData = [
    { month: 'Jan', orders: 45 },
    { month: 'Feb', orders: 52 },
    { month: 'Mar', orders: 61 },
    { month: 'Apr', orders: 58 },
    { month: 'May', orders: 70 },
    { month: 'Jun', orders: 85 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 4500 },
    { month: 'Feb', revenue: 5200 },
    { month: 'Mar', revenue: 6100 },
    { month: 'Apr', revenue: 5800 },
    { month: 'May', revenue: 7000 },
    { month: 'Jun', revenue: 8500 },
  ];

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

      const [usersData, ordersData, couponsData] = await Promise.all([
        usersAPI.getAll(),
        ordersAPI.getAll(),
        couponsAPI.getAll(),
      ]);

      const ordersArray = ordersData.data?.orders || ordersData.data || [];
      const usersArray = usersData.data?.users || usersData.data || [];
      const couponsArray = couponsData.data?.coupons || couponsData.data || [];

      const pendingOrdersCount = ordersArray.filter((order: any) => order.status === 'pending').length;
      const totalRevenue = ordersArray.reduce((sum: number, order: any) => sum + (order.pricing?.total || 0), 0);
      const activeUsersCount = usersArray.filter((user: any) => user.isActive).length;

      setStats({
        totalUsers: usersArray.length,
        totalOrders: ordersArray.length,
        totalCoupons: couponsArray.length,
        totalRevenue,
        pendingOrders: pendingOrdersCount,
        activeUsers: activeUsersCount,
      });
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
//         const payloadBase64 = token.split('.')[1];
// const decoded = JSON.parse(atob(payloadBase64));
// const adminId = decoded.id; // أو decoded.userId حسب اللي موجود في التوكن
        // const [usersRes, messagesRes] = await Promise.all([
                  const [usersRes] = await Promise.all([
// هاي عشان اعمل فيتش لليوزر
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` }  // trick to bypass cache
}),
// axios.get(`http://localhost:5000/api/messages/user/${adminId}`, {
//     headers: { Authorization: `Bearer ${token}` }
//   })
// هاي عشان اعمل فتش للمسج المرسلة من الادمن 
          // axios.get(`http://localhost:5000/api/messages/user/admin_id`, { headers: { Authorization: `Bearer ${token}` }})
        ]);
// setMessages(messagesRes.data.messages || []);

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


  // ======================= Send Message =======================
  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault(); // يمنع الصفحة من الريفريش

    if (!messageContent || selectedUsers.length === 0) {
      alert('Content and recipients are required ');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/messages/send', {
        content: messageContent,
        recipientIds: selectedUsers,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Sent Successfully');

      setMessages(prev => [res.data.message, ...prev]);
      setMessageContent('');
      setSelectedUsers([]);
    } catch (err) {
      console.error(err);
      alert('فشل ارسال الرسالة ');
    }
  };

  // if (loading) {
  //   return (
  //     <DashboardLayout>
  //       <div className="flex items-center justify-center h-96">
  //         <div className="text-muted-foreground">Loading dashboard...</div>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }
const handleDeleteMessage = async (id: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this message?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // بعد الحذف، حدث الـ state بدون الريفريش
    setMessages(prev => prev.filter(msg => msg._id !== id));
    alert("Message deleted successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to delete the message!");
  }
};

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
          <StatCard title="Total Revenue" value={`₪${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} description="All time revenue" trend={{ value: 15, isPositive: true }} />
          <StatCard title="Active Coupons" value={stats.totalCoupons} icon={Tag} description="Currently available" />
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
                <LineChart data={orderTrendsData}>
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
</>
    )}
    </DashboardLayout>
  );
}
