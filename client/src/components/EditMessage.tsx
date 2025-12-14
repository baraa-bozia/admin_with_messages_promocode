import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
      import Select, { StylesConfig, MultiValue } from 'react-select';

interface EditMessageProps {
  message: any;
  usersList: any[];
  usersMap: { [key: string]: string };
  onSave: (updatedMessage: any) => void;
  onClose: () => void;

}

export default function EditMessage({ message, usersList, usersMap, onSave,onClose }: EditMessageProps) {
  const [content, setContent] = useState(message.content);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(message.recipients || []);

  const handleSave = () => {
    onSave({
      ...message,
      content,
      recipients: selectedUsers,
    });
  };

  return (
    <div className="border p-4 rounded mb-4 bg-gray-50">
      <h3 className="font-bold mb-2">Edit Message</h3>

      <div className="mb-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Edit message content"
        />
      </div>

      <div className="mb-2 max-h-40 overflow-y-auto border p-2 rounded">



<Select
  isMulti
  isSearchable
  isClearable
  closeMenuOnSelect={false}
  hideSelectedOptions={false}
  placeholder="Search or select users ..."
  noOptionsMessage={() => "No users found!"}
  loadingMessage={() => "جاري التحميل..."}
  menuPortalTarget={document.body}
  menuPosition="fixed"
  isRtl={true}

  options={usersList
    .filter(user => user.role === 'user') // اختياري: عشان ما يظهرش الأدمن
    .map(user => ({
      value: user._id,
      label: `${user.firstName} ${user.lastName}`
    }))}

  value={selectedUsers.map(id => ({
    value: id,
    label: usersMap[id] || 'جاري التحميل...'
  }))}

  onChange={(selected: MultiValue<any>) => {
    const ids = selected ? selected.map(option => option.value) : [];
    setSelectedUsers(ids);
  }}

  styles={{
    control: (base) => ({
      ...base,
      minHeight: 50,
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '8px',
      backgroundColor: 'white',
      boxShadow: 'none',
      '&:hover': { borderColor: '#9ca3af' },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '8px',
      gap: '8px',
      flexWrap: 'wrap' as const,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '6px 12px',
      fontSize: '15px',
      fontWeight: '500',
    }),
    multiValueLabel: (base) => ({ ...base, color: '#111827' }),
    multiValueRemove: (base) => ({
      ...base,
      cursor: 'pointer',
      ':hover': { backgroundColor: '#fee2e2', color: '#dc2626' },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '16px',
    }),
    input: (base) => ({ ...base, color: '#111827', fontSize: '16px' }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      marginTop: '8px',
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#111827' : isFocused ? '#f3f4f6' : undefined,
      color: isSelected ? 'white' : '#111827',
    }),
  }}
/>
      </div>

      <Button type="button" onClick={handleSave} className="mt-2">Save Changes</Button>
      {/* اضيف كبسة cancel */}
      <button onClick={onClose} style={{ marginLeft: 10 }}>
        Cancel
      </button>
    </div>
  );
}
