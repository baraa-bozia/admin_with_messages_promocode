import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Selectt,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ordersAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Eye, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Order {
  Order_ID: string;
  Order_Number: string;
  Customer_Name: string;
  Customer_Email: string;
  Customer_Phone: string;
  Status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  Payment_Method: 'visa' | 'cash';
  Payment_Status: 'pending' | 'paid' | 'refunded';
  Items_Count: number;
  Subtotal: number;
  Shipping: number;
  Discount: number;
  Points_Used: number;
  Total_Amount: number;
  Currency: string;
  Order_Date: string;
  Estimated_Delivery: string;
  Tracking_Number: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fullOrder, setFullOrder] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (isDetailsDialogOpen && selectedOrder) {
      const fetchFullOrder = async () => {
        setLoadingDetails(true);
        try {
          // هاد بضيفه لما اضيف /admin/:orderId بالباك اند 
          // وبعلق السطر اللي تحته
          const res = await ordersAPI.getAdminOrderById(selectedOrder.Order_ID);

          // const res = await ordersAPI.getById(selectedOrder.Order_ID);
          // setFullOrder(res.data.order);
          setFullOrder(res.data?.order || res.order);

        } catch (err) {
          toast.error('Failed to load order details');
          console.log(selectedOrder.Order_ID);
console.log(err);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchFullOrder();
    }
  }, [isDetailsDialogOpen, selectedOrder]);

// useEffect(() => {
//   if (isDetailsDialogOpen && selectedOrder) {
//     const fetchFullOrder = async () => {
//       setLoadingDetails(true);
//       try {
//         const res = await ordersAPI.getById(selectedOrder.Order_ID);

//         // افحص مكان وجود الـ order في الـ response
//         const orderData = res.data?.order || res?.data?.order || res?.order;

//         if (!orderData) {
//           throw new Error('Order not found or access denied');
//         }

//         setFullOrder(orderData);

//       } catch (err) {
//         toast.error('Failed to load order details');
//         console.log('Order fetch error:', err);
//       } finally {
//         setLoadingDetails(false);
//       }
//     };

//     fetchFullOrder();
//   }
// }, [isDetailsDialogOpen, selectedOrder]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.Status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((o) =>
        o.Order_Number.toLowerCase().includes(q) ||
        o.Customer_Email.toLowerCase().includes(q) ||
        o.Customer_Name.toLowerCase().includes(q) ||
        o.Customer_Phone.includes(q)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll();
      const data = res.data || res;
      console.log(data)
      setOrders(data);
      setFilteredOrders(data);
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Assuming you have this endpoint
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Status updated successfully');
      fetchOrders();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    try {
      await ordersAPI.delete(deletingOrder.Order_ID);
      toast.success('Order deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error('Failed to delete order');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      shipped: { variant: 'default', label: 'Shipped' },
      delivered: { variant: 'outline', label: 'Delivered' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = map[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">View and manage all customer orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Selectt value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Selectt>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.Order_ID}>
                        <TableCell className="font-medium">{order.Order_Number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.Customer_Name}</div>
                            <div className="text-sm text-muted-foreground">{order.Customer_Email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.Items_Count}</TableCell>
                        <TableCell className="font-medium">
                          {order.Total_Amount.toFixed(2)} {order.Currency}
                        </TableCell>
                        <TableCell>
                          <Selectt
                            value={order.Status}
                            onValueChange={(v) => handleStatusUpdate(order.Order_ID, v)}
                          >
                            <SelectTrigger className="w-36">
                              {getStatusBadge(order.Status)}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Selectt>
                        </TableCell>
                        <TableCell>{order.Order_Date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingOrder(order);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details — {selectedOrder?.Order_Number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-3">Customer</h3>
                    <div className="text-sm space-y-2">
                      <p><span className="text-muted-foreground">Name:</span> {selectedOrder.Customer_Name}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedOrder.Customer_Email}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.Customer_Phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Order Info</h3>
                    <div className="text-sm space-y-2">
                      <p><span className="text-muted-foreground">Date:</span> {selectedOrder.Order_Date}</p>
                      <p><span className="text-muted-foreground">Est. Delivery:</span> {selectedOrder.Estimated_Delivery}</p>
                      <p><span className="text-muted-foreground">Tracking:</span> {selectedOrder.Tracking_Number}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  {loadingDetails ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : fullOrder?.items?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>External Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fullOrder.items.map((item: any) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                            </TableCell>
                            <TableCell className="max-w-md truncate" title={item.name}>{item.name}</TableCell>
                            <TableCell>{item.color || 'N/A'}</TableCell>
                            <TableCell>{item.size || 'N/A'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price.toFixed(2)} {selectedOrder.Currency}</TableCell>
                            <TableCell>{item.total.toFixed(2)} {selectedOrder.Currency}</TableCell>
                            <TableCell>
                              {item.externalUrl ? (
                                <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View on Shein
                                </a>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">No items found</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Pricing</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> {selectedOrder.Subtotal.toFixed(2)} {selectedOrder.Currency}</div>
                    <div className="flex justify-between"><span>Shipping:</span> {selectedOrder.Shipping.toFixed(2)} {selectedOrder.Currency}</div>
                    {selectedOrder.Discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span> -{selectedOrder.Discount.toFixed(2)}</div>}
                    {selectedOrder.Points_Used > 0 && <div className="flex justify-between text-blue-600"><span>Points Used:</span> -{selectedOrder.Points_Used}</div>}
                    <div className="flex justify-between font-bold text-lg pt-3 border-t">
                      <span>Total:</span> {selectedOrder.Total_Amount.toFixed(2)} {selectedOrder.Currency}
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>{' '}
                    <Badge variant="outline">{selectedOrder.Payment_Method}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Status:</span>{' '}
                    <Badge variant={selectedOrder.Payment_Status === 'paid' ? 'default' : 'secondary'}>
                      {selectedOrder.Payment_Status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete order <strong>{deletingOrder?.Order_Number}</strong>?
                <br />
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}