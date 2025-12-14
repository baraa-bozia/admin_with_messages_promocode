import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [newMessage, setNewMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          const map: Record<string, string> = {};
          data.users.forEach((u: any) => { map[u._id] = u.name || u.email; });
          setUsersMap(map);
        }
      } catch (err) {
        console.error(err);
        toast.error('فشل في جلب المستخدمين');
      }
    };
    fetchUsers();
  }, []);

  // Fetch all messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/messages/admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setMessages(data.messages);
      } catch (err) {
        console.error(err);
        toast.error('فشل في جلب الرسائل');
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || selectedUsers.length === 0) {
      toast.error('يرجى كتابة محتوى واختيار المستخدمين');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage, recipientIds: selectedUsers }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم إرسال الرسالة بنجاح');
        setMessages([data.message, ...messages]);
        setNewMessage('');
        setSelectedUsers([]);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* === Form إرسال رسالة === */}
        <Card className="border-2 mt-4">
          <CardHeader>
            <CardTitle>إرسال رسالة للمستخدمين</CardTitle>
            <CardDescription>اختر المستخدمين واكتب محتوى الرسالة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage}>
              <textarea
                className="border p-2 w-full rounded mb-2"
                placeholder="اكتب محتوى الرسالة هنا..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <select
                multiple
                className="border p-2 w-full rounded mb-2"
                value={selectedUsers}
                onChange={(e) =>
                  setSelectedUsers(Array.from(e.target.selectedOptions, (o) => o.value))
                }
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
              >
                إرسال الرسالة
              </button>
            </form>
          </CardContent>
        </Card>

        {/* === قائمة الرسائل === */}
        <Card className="border-2 mt-4">
          <CardHeader>
            <CardTitle>الرسائل المرسلة</CardTitle>
            <CardDescription>عرض جميع الرسائل التي تم ارسالها</CardDescription>
          </CardHeader>
          <CardContent>
            {messages?.map((msg) => (
              <div key={msg._id} className="border p-2 mb-2 rounded">
                <p><strong>المحتوى:</strong> {msg.content}</p>
                <p>
                  <strong>لـ:</strong> {msg.recipients.map((id) => usersMap[id] || id).join(', ')}
                </p>
                <p>
                  <strong>تم القراءة بواسطة:</strong> {msg.readBy.length > 0 ? msg.readBy.map((id) => usersMap[id] || id).join(', ') : 'لا أحد بعد'}
                </p>
                <p><strong>التاريخ:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
