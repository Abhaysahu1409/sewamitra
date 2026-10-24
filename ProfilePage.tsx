import { useState, useEffect } from 'react';
import { User, MapPin, Phone, Globe, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n, LANGUAGES } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Card, Button, Input, Select, Avatar, EmptyState } from '@/components/ui';

export function ProfilePage() {
  const { t } = useI18n();
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setArea(profile.area || '');
      setLanguage(profile.language || 'en');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, city, area, language })
      .eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <EmptyState icon={<AlertCircle size={48} />} title="Please log in to view your profile" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('profile')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('editProfile')}</p>

        <Card className="mt-6 p-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <Avatar name={profile.full_name || 'User'} src={profile.avatar_url} size={72} />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{profile.full_name}</h2>
              <p className="text-sm capitalize text-slate-500">{profile.role}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          {saved && (
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Profile saved successfully!
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-11" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-11" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Preferred Language</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="pl-11">
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Area / Locality</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input value={area} onChange={(e) => setArea(e.target.value)} className="pl-11" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving} size="lg">
                <Save size={18} /> {saving ? 'Saving...' : t('save')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
