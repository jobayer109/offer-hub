'use client';

import { useEffect, useState } from 'react';
import { api, apiFormData } from '@/lib/api/client';
import { resolveImageUrl } from '@/lib/utils/image';
import { getToken } from '@/lib/api/auth';
import { FormAlert } from '@/components/ui/form-alert';
import { Trash2, Plus, Loader2, Image as ImageIcon, Link as LinkIcon, ArrowUpDown, Upload, Pencil, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editSortOrder, setEditSortOrder] = useState('0');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      const token = getToken()!;
      const data = await api<{ banners: Banner[] }>('/admin/banners', { token });
      setBanners(data.banners);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!title.trim() || !linkUrl.trim() || !imageFile) {
      setAlert({ type: 'error', message: 'সব ফিল্ড পূরণ করুন এবং একটি ছবি নির্বাচন করুন।' });
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken()!;

      const formData = new FormData();
      formData.append('images', imageFile);
      const uploadRes = await apiFormData<{ urls: string[] }>('/upload/images', formData, token);
      const image_url = uploadRes.urls[0];

      await api('/admin/banners', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: title.trim(),
          image_url,
          link_url: linkUrl.trim(),
          sort_order: parseInt(sortOrder, 10) || 0,
        }),
      });

      setAlert({ type: 'success', message: 'ব্যানার সফলভাবে তৈরি হয়েছে!' });
      setTitle('');
      setLinkUrl('');
      setSortOrder('0');
      setImageFile(null);
      setImagePreview(null);
      fetchBanners();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'ব্যানার তৈরি করতে ব্যর্থ।' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই ব্যানারটি মুছে ফেলতে চান?')) return;
    try {
      const token = getToken()!;
      await api(`/admin/banners/${id}`, { method: 'DELETE', token });
      setAlert({ type: 'success', message: 'ব্যানার মুছে ফেলা হয়েছে।' });
      fetchBanners();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'ব্যানার মুছতে ব্যর্থ।' });
    }
  };

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setEditTitle(banner.title);
    setEditLinkUrl(banner.link_url);
    setEditSortOrder(String(banner.sort_order));
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditImageFile(null);
  };

  const handleEditSave = async (id: string) => {
    setEditSaving(true);
    try {
      const token = getToken()!;
      let image_url: string | undefined;

      if (editImageFile) {
        const formData = new FormData();
        formData.append('images', editImageFile);
        const uploadRes = await apiFormData<{ urls: string[] }>('/upload/images', formData, token);
        image_url = uploadRes.urls[0];
      }

      await api(`/admin/banners/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({
          title: editTitle.trim(),
          link_url: editLinkUrl.trim(),
          sort_order: parseInt(editSortOrder, 10) || 0,
          ...(image_url ? { image_url } : {}),
        }),
      });

      setAlert({ type: 'success', message: 'ব্যানার আপডেট হয়েছে!' });
      setEditingId(null);
      fetchBanners();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'আপডেট করতে ব্যর্থ।' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const token = getToken()!;
      await api(`/admin/banners/${id}/toggle`, { method: 'PUT', token });
      fetchBanners();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'ব্যানার টগল করতে ব্যর্থ।' });
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ব্যানার ব্যবস্থাপনা</h1>
          <p className="text-sm text-muted-foreground">হোমপেজ ব্যানার যোগ ও পরিচালনা করুন</p>
        </div>
      </div>

      {alert && (
        <FormAlert
          type={alert.type}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      )}

      {/* Add Banner Form */}
      <div className="bg-white border rounded-lg p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          নতুন ব্যানার যোগ করুন
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5 text-gray-700">
                <ImageIcon className="h-3.5 w-3.5" />
                শিরোনাম
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ব্যানারের শিরোনাম"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5 text-gray-700">
                <LinkIcon className="h-3.5 w-3.5" />
                লিংক URL
              </label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5 text-gray-700">
                <Upload className="h-3.5 w-3.5" />
                ব্যানার ছবি
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5 text-gray-700">
                <ArrowUpDown className="h-3.5 w-3.5" />
                সর্ট অর্ডার
              </label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">কম নম্বর = বেশি অগ্রাধিকার</p>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {submitting ? 'আপলোড হচ্ছে...' : 'ব্যানার যোগ করুন'}
          </Button>
        </form>
      </div>

      {/* Banner List */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">সব ব্যানার</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-16 bg-muted rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white border rounded-lg flex flex-col items-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">কোনো ব্যানার নেই</h3>
            <p className="text-sm text-muted-foreground">উপরের ফর্ম থেকে নতুন ব্যানার যোগ করুন</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white border rounded-lg overflow-hidden">
                {editingId === banner.id ? (
                  /* Edit mode */
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">ব্যানার এডিট</p>
                      <button onClick={cancelEdit} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">শিরোনাম</label>
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-9" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">লিংক</label>
                        <Input value={editLinkUrl} onChange={(e) => setEditLinkUrl(e.target.value)} className="h-9" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">ছবি পরিবর্তন (ঐচ্ছিক)</label>
                        <Input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} className="h-9" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">সর্ট অর্ডার</label>
                        <Input type="number" value={editSortOrder} onChange={(e) => setEditSortOrder(e.target.value)} className="h-9" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={cancelEdit} className="gap-1">
                        <X className="h-3.5 w-3.5" /> বাতিল
                      </Button>
                      <Button size="sm" onClick={() => handleEditSave(banner.id)} disabled={editSaving} className="gap-1 bg-green-500 hover:bg-green-600">
                        {editSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        সেভ করুন
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-full sm:w-36 h-20 rounded-lg overflow-hidden border shrink-0">
                      <img src={resolveImageUrl(banner.image_url)} alt={banner.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{banner.title}</p>
                      <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-blue-600 truncate block mt-0.5">
                        {banner.link_url}
                      </a>
                      <span className="text-xs text-muted-foreground mt-1 block">অর্ডার: {banner.sort_order}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggle(banner.id)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${banner.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${banner.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-xs font-medium min-w-[52px] ${banner.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                        {banner.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>

                      <Button variant="outline" size="sm" onClick={() => startEdit(banner)} className="gap-1">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(banner.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
