

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import Select, { components,StylesConfig, MultiValue } from 'react-select';

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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { couponsAPI, promoCodesAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Loader2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// interface Coupon {
//   _id: string;
//   code: string;
//   type: 'percentage' | 'fixed' | 'shipping';
//   value: number;
//   minOrder: number;
//   expires: string;
//   description: string;
//   createdAt: string;
// }
interface User {
  _id: string;
  name: string;
  firstName:string;
  lastName:string;
  email: string;
    role: string; 

}

interface Promo {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'shipping' ;
  discountValue: number;
  assignedTo: User[];
  usedBy?: User;
  expiresAt: string;
  createdAt: string;
    description: string;
      minOrder: number;


}

export default function PromoCodes() {
  // const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Promo[]>([]);
  // const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<Promo | null>(null);


  const [promoCodes, setPromoCodes] = useState<Promo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [code, setCode] = useState('');
    const [description, setDescription] = useState('');

      const [minOrder, setminOrder] = useState('');

  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'shipping'>('percentage');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usersMap, setUsersMap] = useState<{ [key: string]: string }>({});
// const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
const [editingPromoId, setEditingPromoId] = useState<Promo | null>(null);

  const fetchPromoCodes = async () => {
    try {
              const token = localStorage.getItem('token');

      const res = await axios.get('http://localhost:5000/api/promo',{
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromoCodes(Array.isArray(res.data.data) ? res.data.data : []);
      console.log('promoooooooo:',res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load promo codes');
    }
  };

    const fetchUsers = async () => {
    try {
                const token = localStorage.getItem('token');

//     //   const res = await axios.get('/api/promo/users');
//     const res=axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` }  // trick to bypass cache
// }),
        
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

 const usersArray = usersRes.data.data.users || [];
        setUsers(usersArray);
        // هون طبعت النتيجة الي راجعة من API لحتى اتاكد انه رجعهم
console.log(usersRes);
// هون لحتى يجيب فقط المستخدمين , مش الكل مع الادمن
const users = usersArray.filter((u: { role: string; }) => u.role === 'user');
      setUsers(users);
        const map: { [key: string]: string } = {};
        users.forEach((u: { _id: string | number; firstName: any; lastName: any; }) => {
          map[u._id] = `${u.firstName} ${u.lastName}`;
        });
        setUsersMap(map);
    } catch (err) {
      console.error(err);
      setUsers([]);
      setError('Failed to load users');
    }
  };



  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'shipping',
    discountValue: 0,
    minOrder: 0,
    expiresAt: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
    fetchUsers();
  }, []);

  
  useEffect(() => {
  const query = searchQuery.toLowerCase();

  if (!query) {
    setFilteredCoupons(promoCodes);
    return;
  }

  setFilteredCoupons(
    promoCodes.filter((coupon) => {
      const code = coupon.code?.toLowerCase() || '';
      const description = coupon.description?.toLowerCase() || '';
      const type = coupon.discountType?.toLowerCase() || '';

      return (
        code.includes(query) ||
        description.includes(query) ||
        type.includes(query)
      );
    })
  );
}, [searchQuery, promoCodes]);





  const handleOpenDialog = (coupon?: Promo) => {
  if (coupon) {
    setEditingPromoId(coupon);

    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrder: coupon.minOrder,
      expiresAt: coupon.expiresAt
        ? format(new Date(coupon.expiresAt), 'yyyy-MM-dd')
        : '',
      description: coupon.description,
    });

    setSelectedUsers(coupon.assignedTo?.map(u => u._id) || []);
  } else {
    setEditingPromoId(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrder: 0,
      expiresAt: '',
      description: '',
    });
    setSelectedUsers([]);
  }

  setIsDialogOpen(true);
};


  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPromoId(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrder: 0,
      expiresAt: '',
      description: '',
    });
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const token = localStorage.getItem('token');

    const payload = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue:
        formData.discountType === 'shipping'
          ? 0
          : formData.discountValue,
      minOrder: formData.minOrder,
      expiresAt: formData.expiresAt,
      description: formData.description,
      assignedTo: selectedUsers,
    };

    if (editingPromoId) {
      // ✏️ EDIT
      await axios.put(
        `http://localhost:5000/api/promo/${editingPromoId._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Promo code updated successfully');
    } else {
      // ➕ CREATE
      await axios.post(
        'http://localhost:5000/api/promo',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Promo code created successfully');
    }

    handleCloseDialog();
    fetchPromoCodes();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save promo code');
  } finally {
    setSubmitting(false);
  }
};


  
  const handleDelete = async () => {
    if (!deletingPromo) return;

    try {
      await promoCodesAPI.delete(deletingPromo._id);
      toast.success('Promo Code deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingPromo(null);
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      percentage: { variant: 'default', label: 'Percentage' },
      fixed: { variant: 'secondary', label: 'Fixed Amount' },
      shipping: { variant: 'outline', label: 'Free Shipping' },
    };
    const config = variants[type] || { variant: 'outline', label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
<div className="space-y-6">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">promoCodes Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage discount promoCodes</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Button>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>All promoCodes</CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promoCodes by code, type, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>discountType</TableHead>
                  <TableHead>discountValue</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  <TableHead>Users</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No coupons found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons?.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                      <TableCell>{getTypeBadge(coupon.discountType)}</TableCell>
                      <TableCell>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : 
                         coupon.discountType === 'fixed' ? `₪${coupon.discountValue}` : 
                         'Free Shipping'}
                      </TableCell>
                      <TableCell>₪{coupon.minOrder}</TableCell>
                      <TableCell>
                        {/* {format(new Date(coupon.expiresAt), 'MMM dd, yyyy')} */}
                          {coupon.expiresAt && !isNaN(new Date(coupon.expiresAt).getTime())
    ? format(new Date(coupon.expiresAt), 'MMM dd, yyyy')
    : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isExpired(coupon.expiresAt) ? 'destructive' : 'default'}>
                          {isExpired(coupon.expiresAt) ? 'Expired' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingPromo(coupon);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
               
<TableCell>
  <div className="flex flex-wrap gap-2">
    {coupon.assignedTo.map(user => (
      <div
        key={user._id}
        className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm"
      >
        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
          {user.firstName[0]}
          {user.lastName[0]}
        </div>
        <span>{user.firstName} {user.lastName}</span>
      </div>
    ))}
  </div>
</TableCell>



                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>  {editingPromoId ? 'Edit Promo Code' : 'Create New Promo Code'}
</DialogTitle>
            <DialogDescription>
              {editingPromoId
                ? 'Update coupon details and settings'
                : 'Add a new discount coupon to the system'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SUMMER2024"
                  required
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Coupon Type</Label>
                <Selectt
                  value={formData.discountType}
                  onValueChange={(value: 'percentage' | 'fixed' | 'shipping') =>
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Selectt>
              </div>

              {formData.discountType !== 'shipping' && (
                <div className="space-y-2">
                  <Label htmlFor="value">
                    {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₪)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimum Order Amount (₪)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrder: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Expiration Date</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the coupon offer"
                  required
                  rows={3}
                />
              </div>

        <Select
  isMulti
  options={users.map(user => ({
    value: user._id,
    label: `${user.firstName} ${user.lastName}`
  }))}
  value={selectedUsers.map(id => ({
    value: id,
    label: usersMap[id] || 'تحميل...'
  }))}
  // onChange={(selectedOptions: any[]) => {
  //   const ids = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
  //   setSelectedUsers(ids);
  // }}
   onChange={(selectedOptions: { value: string; label: string }[] | null) => {
    const ids = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setSelectedUsers(ids);
  }}
  placeholder="Search or select users ..."
  isSearchable
  isClearable
  closeMenuOnSelect={false}
  hideSelectedOptions={false}
  noOptionsMessage={() => "No users found!"}
  // formatOptionLabel={({ label }) => (
    formatOptionLabel={(option: { value: string; label: string }) => (

    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
        {option.label.split(' ').map(n => n[0]).join('').toUpperCase()}
      </div>
      <span>{option.label}</span>
    </div>
  )}

           
                className="react-select-container"
  classNamePrefix="react-select"
  styles={{
    control: (base) => ({
      ...base,
      minHeight: 40,
      marginTop:'20px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '8px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#9ca3af' },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '8px',
      gap: '8px',
      flexWrap: 'wrap',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '6px 10px',
      fontSize: '15px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#111827',
      fontWeight: '500',
    }),
    multiValueRemove: (base) => ({
      ...base,
      cursor: 'pointer',
      borderRadius: '0 8px 8px 0',
      ':hover': {
        backgroundColor: '#e5e7eb',
        color: '#dc2626',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '16px',
    }),
    input: (base) => ({
      ...base,
      fontSize: '16px',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      marginTop: '8px',
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#111827' : isFocused ? '#f3f4f6' : 'white',
      color: isSelected ? 'white' : '#111827',
      ':active': { backgroundColor: '#111827' },
    }),
  }}
/>

            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingPromoId ? (
                  'Update Coupon'
                ) : (
                  'Create Coupon'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the coupon code "{deletingPromo?.code}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingPromo(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>

    {/* <select
          multiple
          value={selectedUsers}
          onChange={(e) =>
            setSelectedUsers(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          style={{ marginRight: 10, width: 200, height: 80 }}
        >
          {Array.isArray(users) &&
            users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
        </select>  */}


          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
