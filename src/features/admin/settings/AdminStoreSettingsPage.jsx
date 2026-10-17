import { useEffect, useState } from 'react';
import { Clock3, Globe2, Hash, Phone, Save, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card.jsx';
import { useStoreSettings, useUpdateStoreSettings } from '@/features/settings/useStoreSettings.js';
import { getText } from '@/utils/getText.js';

const DEFAULT_SETTINGS = {
  storeName: 'سوق قاسم للفواكه والخضار',
  shortDescription: 'سوق قاسم للفواكه والخضار',
  announcement: 'توصيل سريع للخضار والفواكه الطازجة حتى باب البيت 🌿',
  phone: '03-1234567',
  whatsapp: '972501234567',
  email: 'Sooqkasem@gmail.com',
  address: 'شارع العجمي 22، يافا',
  workingHours: 'يومياً من 7:00 صباحاً حتى 10:00 مساءً',
  instagram: 'https://www.instagram.com/sooq_kasem?igsh=MXFqNXExMml1eWJqeQ==',
  facebook: 'https://www.facebook.com/share/14oJ82p3rq6/?mibextid=wwXIfr',
  minimumOrder: '40',
  orderNumberFormat: 'QS-YYYY-#####',
};

function Field({ id, label, value, onChange, type = 'text', dir }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-[#1A1F16]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        dir={dir}
        className="h-11 w-full min-w-0 rounded-xl border border-[#DDE2D8] bg-white px-3 text-sm text-[#1A1F16] outline-none transition focus:border-[#1D6B36] focus:ring-2 focus:ring-[#1D6B36]/15 sm:h-12 sm:px-4"
      />
    </div>
  );
}

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <Card className="min-w-0 rounded-2xl border border-[#DDE2D8] bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-[#1D6B36] sm:mb-5">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <h2 className="text-sm font-black text-[#1A1F16]">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export function AdminStoreSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const { data: savedSettings, isLoading, isError, refetch } = useStoreSettings();
  const updateSettingsMutation = useUpdateStoreSettings();

  useEffect(() => {
    if (savedSettings) {
      setSettings({
        ...DEFAULT_SETTINGS,
        ...savedSettings,
        storeName: getText(savedSettings.storeName),
        shortDescription: getText(savedSettings.shortDescription),
        announcement: getText(savedSettings.announcement),
        address: getText(savedSettings.address),
        workingHours: getText(savedSettings.workingHours),
        whatsapp: savedSettings.whatsapp || savedSettings.whatsappNumber || DEFAULT_SETTINGS.whatsapp,
        minimumOrder: String(savedSettings.minimumOrder ?? 40),
      });
    }
  }, [savedSettings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await updateSettingsMutation.mutateAsync({
        ...settings,
        minimumOrder: Number(settings.minimumOrder),
      });
      toast.success('تم حفظ إعدادات المتجر بنجاح');
    } catch (error) {
      const validationMessage = error.response?.data?.errors?.[0]?.msg;
      toast.error(validationMessage || 'تعذر حفظ إعدادات المتجر');
    }
  };

  return (
    <div className="min-w-0 animate-fade-in space-y-4 text-start sm:space-y-5" dir="rtl">
      <div>
        <h1 className="text-xl font-black text-[#1A1F16] sm:text-2xl">إعدادات المتجر</h1>
        <p className="mt-1 text-xs font-medium text-[#6B7464]">
          إدارة بيانات المتجر ومعلومات التواصل وإعدادات الطلبات
        </p>
      </div>

      {isError && (
        <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <span>تعذر تحميل الإعدادات المحفوظة.</span>
          <button type="button" onClick={() => refetch()} className="underline">إعادة المحاولة</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="me-auto w-full min-w-0 max-w-4xl space-y-4 sm:space-y-5">
        <SettingsSection icon={Store} title="معلومات المتجر">
          <div className="space-y-4">
            <Field id="storeName" label="اسم المتجر" value={settings.storeName} onChange={handleChange} />
            <Field id="shortDescription" label="الوصف المختصر" value={settings.shortDescription} onChange={handleChange} />
            <Field id="announcement" label="نص شريط الإعلانات" value={settings.announcement} onChange={handleChange} />
          </div>
        </SettingsSection>

        <SettingsSection icon={Phone} title="بيانات التواصل">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Field id="phone" label="رقم الهاتف" value={settings.phone} onChange={handleChange} dir="ltr" />
            <Field id="whatsapp" label="رقم واتساب للطلبات" value={settings.whatsapp} onChange={handleChange} dir="ltr" />
            <div className="sm:col-span-2">
              <Field id="email" label="البريد الإلكتروني" value={settings.email} onChange={handleChange} type="email" dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <Field id="address" label="العنوان" value={settings.address} onChange={handleChange} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection icon={Clock3} title="أوقات العمل">
          <Field id="workingHours" label="ساعات العمل" value={settings.workingHours} onChange={handleChange} />
        </SettingsSection>

        <SettingsSection icon={Globe2} title="روابط التواصل الاجتماعي">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Field id="instagram" label="إنستغرام" value={settings.instagram} onChange={handleChange} type="url" dir="ltr" />
            <Field id="facebook" label="فيسبوك" value={settings.facebook} onChange={handleChange} type="url" dir="ltr" />
          </div>
        </SettingsSection>

        <SettingsSection icon={Hash} title="إعدادات الطلبات">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1A1F16]" htmlFor="currency">العملة</label>
              <input
                id="currency"
                value="EGP"
                disabled
                className="h-11 w-full min-w-0 cursor-not-allowed rounded-xl border border-[#DDE2D8] bg-[#F5F7F3] px-3 text-xs text-[#6B7464] sm:h-12 sm:px-4 sm:text-sm"
              />
              <p className="text-[10px] font-medium text-[#8A9384]">العملة ثابتة ولا يمكن تغييرها</p>
            </div>
            <Field id="minimumOrder" label="الحد الأدنى للطلب (EGP)" value={settings.minimumOrder} onChange={handleChange} type="number" dir="ltr" />
            <div className="sm:col-span-2">
              <Field id="orderNumberFormat" label="تنسيق رقم الطلب" value={settings.orderNumberFormat} onChange={handleChange} dir="ltr" />
              <p className="mt-1.5 text-[10px] font-medium text-[#8A9384]">مثال: QS-YYYY-##### ينتج QS-2026-00154</p>
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end pb-2">
          <button
            type="submit"
            disabled={isLoading || updateSettingsMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D6B36] px-6 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#155A29] disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:min-w-44"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {updateSettingsMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminStoreSettingsPage;
