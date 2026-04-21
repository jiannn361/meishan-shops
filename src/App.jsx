import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// 【修正】補上 Instagram 與其他缺失的圖示
import { 
  Search, MapPin, Phone, Navigation, Facebook, Instagram, Star, Home, Coffee, Gift, User, 
  Filter, Heart, Menu, X, Mountain, Loader2, Camera, Tag, Clock, ChevronLeft, 
  ChevronRight, Info, LocateFixed, Globe, MessageCircle, Map as MapIcon, 
  ExternalLink, Calendar, Banknote, AlertCircle, Bus, ChevronDown, Play, ArrowRight 
} from 'lucide-react';

// 【網站設定區】
const APP_CONFIG = {
  appName: "Meishan Taiping",
  subTitle: "Meishan, Chiayi",
  airtableApiKey: import.meta.env.VITE_AIRTABLE_API_KEY || ""; 
  airtableBaseId: "appkU3kxP74Gq7iXj", 
  airtableTableName: "Table 1", 
  liffId: "2009010332-K14upnUb",
  aboutUsUrl: "https://www.facebook.com/TaipingSuspensionBridge?locale=zh_TW", 
  notionUrl: "https://www.notion.so/2a11f9fee71981239a89ebdbb2f25441?source=copy_link", 
  contactLineUrl: "https://line.me/R/ti/p/@taiping", 
};

// 特色活動設定
const EVENT_CONFIG = {
  '黃頭鷺': { customImg: '/bird-event.png', color: '#d97706', bg: '#fef3c7', label: '賞鷺點' },
  '紫藤花': { customImg: '/flower-event.png', icon: Star, color: '#9333ea', bg: '#f3e8ff', label: '賞花點' },
  '日出': { customImg: '/sunrise-event.png', icon: Star, color: '#ea580c', bg: '#ffedd5', label: '絕美日出' },
  '雲海': { customImg: '/cloud-event.png', icon: Star, color: '#0284c7', bg: '#e0f2fe', label: '雲海勝地' },
  '螢火蟲': { customImg: '/star-event.png', color: '#ca8a04', bg: '#fef08a', label: '賞螢秘境' }
};

// 【多國語言字典】
const translations = {
  zh: {
    explore: '探索', pocketList: '口袋名單', myFavorites: '我的收藏',
    searchPlaceholder: '搜尋關鍵字或服務...', all: '全部',
    accommodation: '民宿', food: '美食', gift: '伴手禮', attraction: '景點',
    experience: '體驗', transport: '交通', favoritesList: '收藏清單', featured: '精選推薦',
    openNow: '營業中', openingSoon: '即將營業', closingSoon: '即將休息', closed: '休息中',
    checkAnnouncement: '詳見公告', byAppointment: '預約制', bookNow: '預約/預訂',
    distance: '距離', shopsCount: '間', loading: '快到了再等一下...',
    noFavorites: '您的口袋名單還是空的喔！', noShops: '哎呀，找不到符合的店家...',
    goToExplore: '去探索店家', showAll: '顯示全部', googleInfo: 'Google 資訊',
    fbAnnouncement: '粉公告', navigate: '導航', arNavigate: 'AR 找店', aboutUs: '關於我們',
    contactSupport: '聯絡客服', trailGuide: '周邊步道攻略', clearFavorites: '清空收藏紀錄',
    quickFilter: '快速篩選', onlyOpenNow: '只顯示營業中', onlyElevator: '只顯示有電梯/無障礙',
    onlySpecialEvent: '只顯示特色活動地點', confirm: '確認', shopIntro: '店家介紹',
    googleReviews: '查看 Google 評論', paymentMethod: '付款方式', notice: '溫馨提醒',
    guest: '訪客', welcome: '歡迎來到梅山', switchVillage: '切換村落',
    confirmClearFav: '確定要清空所有收藏嗎？', langSwitch: 'EN',
    aboutUsText: "歡迎您來到梅山！\n我們致力於推廣梅山在地觀光，\n讓您輕鬆找到最棒的民宿與美食。",
    welcomeTitle: "今天想去哪裡呢?", enterVillage: "開始探索"
  },
  en: {
    explore: 'Explore', pocketList: 'Pocket List', myFavorites: 'Favorites',
    searchPlaceholder: 'Search...', all: 'All',
    accommodation: 'Stays', food: 'Food', gift: 'Gifts', attraction: 'Spots',
    experience: 'Exp', transport: 'Transport', favoritesList: 'Favorites', featured: 'Featured',
    openNow: 'Open Now', openingSoon: 'Opening Soon', closingSoon: 'Closing Soon', closed: 'Closed',
    checkAnnouncement: 'Check Info', byAppointment: 'By Appt', bookNow: 'Book Now',
    distance: 'Dist', shopsCount: 'shops', loading: 'Almost there...',
    noFavorites: 'No favorites yet!', noShops: 'No shops match your criteria.',
    goToExplore: 'Explore Shops', showAll: 'Show All', googleInfo: 'Google Info',
    fbAnnouncement: 'FB Info', navigate: 'Navigate', arNavigate: 'AR View', aboutUs: 'About Us',
    contactSupport: 'Support', trailGuide: 'Trail Guide', clearFavorites: 'Clear Favorites',
    quickFilter: 'Quick Filter', onlyOpenNow: 'Open Now Only', onlyElevator: 'Elevator Only',
    onlySpecialEvent: 'Special Events Only', confirm: 'Apply', shopIntro: 'About',
    googleReviews: 'Google Reviews', paymentMethod: 'Payment', notice: 'Notice',
    guest: 'Guest', welcome: 'Welcome to Meishan', switchVillage: 'Switch Village',
    confirmClearFav: 'Clear all favorites?', langSwitch: '中',
    aboutUsText: "Welcome to Meishan!",
    welcomeTitle: "Where to explore?", enterVillage: "Enter Village"
  }
};

const villageData = {
  '太平村': { color: '#b8caa5', textDark: '#506638', textBadge: '#ffffff', bgFile: 'bg-taiping.png', iconFile: 'icon-taiping.png', animColor: 'text-gray-400/50', zh: '太平村', en: 'Taiping', desc_zh: '雲梯與老街', desc_en: 'Sky Bridge & Old Street', intro: '漫步在雲端上的太平雲梯，俯瞰嘉南平原的壯麗景色。' },
  '太興村': { color: '#ea994d', textDark: '#a35a0f', textBadge: '#ffffff', bgFile: 'bg-taixing.png', iconFile: 'icon-taixing.png', animColor: 'text-amber-700/40', zh: '太興村', en: 'Taixing', desc_zh: '萬鷺朝鳳', desc_en: 'Herons Migration', intro: '每年秋季限定的「萬鷺朝鳳」奇景令人嘆為觀止。' },
  '碧湖/龍眼村': { color: '#80a4aa', textDark: '#3a595e', textBadge: '#ffffff', bgFile: 'bg-bihu.png', iconFile: 'icon-bihu.png', animColor: 'text-emerald-600/40', zh: '碧湖/龍眼村', en: 'Bihu / Longyan', desc_zh: '觀光茶園', desc_en: 'Tea Gardens', intro: '被群山環繞的翠綠觀光茶園，層層疊疊的茶樹宛如綠色地毯。' },
  '瑞里村': { color: '#d2cbe3', textDark: '#5a5270', textBadge: '#413a54', bgFile: 'bg-ruili.png', iconFile: 'icon-ruili.png', animColor: 'text-purple-500/50', zh: '瑞里村', en: 'Ruili', desc_zh: '紫色山城', desc_en: 'Purple Mountain Town', intro: '著名的浪漫紫色山城，春季紫藤花盛開時如夢似幻。' },
  '瑞峰村': { color: '#dd785b', textDark: '#8a371c', textBadge: '#ffffff', bgFile: 'bg-ruifeng.png', iconFile: 'icon-ruifeng.png', animColor: 'text-orange-500/50', zh: '瑞峰村', en: 'Ruifeng', desc_zh: '日出與步道', desc_en: 'Sunrise & Trails', intro: '坐擁絕美的日出勝地與竹坑溪步道，清晨的雲海與壯闊的山林景緻交織。' },
  '太和村': { color: '#c4b28e', textDark: '#70603d', textBadge: '#ffffff', bgFile: 'bg-taihe.png', iconFile: 'icon-taihe.png', animColor: 'text-lime-700/40', zh: '太和村', en: 'Taihe', desc_zh: '茶園秘境', desc_en: 'Hidden Tea Farms', intro: '隱藏在深山中的茶園秘境，保留了最原始純粹的自然風貌。' },
};

// ==========================================
// 🛠️ 輔助函式 (修正：將 getGoogleMapLink 移至頂部防止白畫面)
// ==========================================
const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getGoogleMapLink = (name, address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((address || '') + ' ' + (name || ''))}`;

const Mascot = ({ size = 60, className = "", animation = "", imageUrl = null }) => {
  const defaultMascotUrl = "/mascot.png";
  const mascotSrc = imageUrl || defaultMascotUrl;
  let animClass = "";
  if (animation === "spin") animClass = "animate-spin";     
  if (animation === "bounce") animClass = "animate-bounce"; 
  if (animation === "pulse") animClass = "animate-pulse";
  if (animation === "ride") animClass = "animate-ride";    

  return (
    <img
      src={mascotSrc}
      alt="Mascot"
      style={{ width: size, height: size }}
      className={`object-contain drop-shadow-md ${animClass} ${className}`}
      onError={(e) => {
        if (e.target.src !== "https://cdn-icons-png.flaticon.com/512/3466/3466395.png") {
            e.target.src = "https://cdn-icons-png.flaticon.com/512/3466/3466395.png";
        }
      }}
    />
  );
};

const FormattedText = ({ text, className = "" }) => {
  if (!text) return null;
  const strText = Array.isArray(text) ? text.join('\n') : String(text);
  const lines = strText.split(/\||\n|\\n/);
  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
        if (line.trim() === '') return <div key={lineIdx} className="h-3"></div>; 
        return <div key={lineIdx} className="leading-relaxed">{line}</div>;
      })}
    </div>
  );
};

const DefaultShopImage = () => (
  <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
    <Mountain size={48} className="text-emerald-600 opacity-20" />
  </div>
);

const ImageCarousel = ({ images, onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => { setCurrentIndex((prev) => (prev + 1) % images.length); }, 4000); 
    return () => clearInterval(interval);
  }, [images?.length]);

  if (!images || images.length === 0) return <div onClick={onClick} className="w-full h-full cursor-pointer"><DefaultShopImage /></div>;

  return (
    <div className="relative w-full h-full group cursor-pointer" onClick={onClick}>
      <img src={images[currentIndex]} alt="shop" className="w-full h-full object-cover transition-all duration-500" />
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 🧭 AR 導航模組
// ==========================================
const ARNavigation = ({ targetShop, userLoc, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setErrorMsg("無法開啟相機，請確認是否給予權限。");
      }
    };
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col items-center">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-0 opacity-60" />
      <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-start">
        <div className="text-white">
          <h2 className="text-2xl font-black">{targetShop?.name}</h2>
          <p className="text-emerald-400 font-bold">AR 導航模式</p>
        </div>
        <button onClick={onClose} className="bg-white/90 p-2.5 rounded-full shadow-md"><X size={20} /></button>
      </div>
      <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
        {errorMsg ? (
          <div className="bg-rose-500 text-white p-4 rounded-xl pointer-events-auto">{errorMsg}</div>
        ) : (
          <div className="flex flex-col items-center">
             <Loader2 size={48} className="text-white animate-spin mb-4" />
             <Mascot size={150} animation="pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🌟 彈窗組件
// ==========================================
const ShopDetailModal = ({ shop, onClose, t, language, setArTargetShop, userLocation, checkIsOpen, getDynamicText }) => {
  if (!shop) return null;
  const isOpen = checkIsOpen(shop.hours);
  const displayName = getDynamicText(shop, 'name');
  const displayDesc = getDynamicText(shop, 'description');
  const displayAddress = getDynamicText(shop, 'address');
  const shopColor = villageData[shop.village]?.color || '#059669';
  const shopDarkColor = villageData[shop.village]?.textDark || '#047857';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full shadow-md text-gray-800"><X size={20} /></button>
        <div className="h-64"><ImageCarousel images={shop.images} /></div>
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <div className="flex items-center gap-2 mt-2">
               <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: hexToRgba(shopColor, 0.1), color: shopDarkColor }}>
                  {isOpen === true ? t('openNow') : isOpen === 'appointment' ? t('byAppointment') : t('closed')}
               </div>
               {shop.rating && <div className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor" />{shop.rating}</div>}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed">
            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: shopDarkColor }}><Info size={16} /> {t('shopIntro')}</h4>
            <FormattedText text={displayDesc} />
          </div>

          <div className="flex flex-wrap gap-2">
            {shop.tel && <a href={`tel:${shop.tel}`} className="p-3 border rounded-xl" style={{ borderColor: hexToRgba(shopColor, 0.2), color: shopColor }}><Phone size={20}/></a>}
            {shop.fbLink && <a href={shop.fbLink} target="_blank" className="p-3 border rounded-xl text-blue-600"><Facebook size={20}/></a>}
            {shop.ig_url && <a href={shop.ig_url} target="_blank" className="p-3 border rounded-xl text-pink-600"><Instagram size={20}/></a>}
          </div>

          <div className="flex gap-3 pb-2">
            <button onClick={() => setArTargetShop(shop)} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Camera size={18} /> AR 找店</button>
            <a href={getGoogleMapLink(shop.name, shop.address)} target="_blank" className="flex-1 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2" style={{ backgroundColor: shopColor }}><Navigation size={18} /> {t('navigate')}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterModal = ({ showFilterModal, setShowFilterModal, filterOpenOnly, setFilterOpenOnly, filterElevator, setFilterElevator, hasAnyEventsInVillage, filterEventOnly, setFilterEventOnly, currentPrimaryColor, t }) => {
  if (!showFilterModal) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilterModal(false)}></div>
      {/* 【修正】增加底部內距 (pb-36) 並設定最大高度與捲動，確保在手機版完整顯示 */}
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl p-6 pb-36 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        <button onClick={() => setShowFilterModal(false)} className="absolute top-4 right-4 z-50 bg-gray-100 p-2 rounded-full text-gray-500"><X size={20} /></button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('quickFilter')}</h3>
        <div className="space-y-4">
          <button onClick={() => setFilterOpenOnly(!filterOpenOnly)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${filterOpenOnly ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
             <div className="flex items-center gap-3"><Clock size={20} className={filterOpenOnly ? 'text-emerald-600' : 'text-gray-400'} /><span className="font-bold">{t('onlyOpenNow')}</span></div>
             <div className={`w-12 h-6 rounded-full relative transition-colors ${filterOpenOnly ? 'bg-emerald-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filterOpenOnly ? 'right-1' : 'left-1'}`}></div></div>
          </button>
          <button onClick={() => setFilterElevator(!filterElevator)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${filterElevator ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
             <div className="flex items-center gap-3"><Star size={20} className={filterElevator ? 'text-blue-600' : 'text-gray-400'} /><span className="font-bold">{t('onlyElevator')}</span></div>
             <div className={`w-12 h-6 rounded-full relative transition-colors ${filterElevator ? 'bg-blue-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filterElevator ? 'right-1' : 'left-1'}`}></div></div>
          </button>
          {hasAnyEventsInVillage && (
            <button onClick={() => setFilterEventOnly(!filterEventOnly)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${filterEventOnly ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
               <div className="flex items-center gap-3"><Tag size={20} className={filterEventOnly ? 'text-orange-600' : 'text-gray-400'} /><span className="font-bold">{t('onlySpecialEvent')}</span></div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${filterEventOnly ? 'bg-orange-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filterEventOnly ? 'right-1' : 'left-1'}`}></div></div>
            </button>
          )}
        </div>
        <button onClick={() => setShowFilterModal(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold mt-4 shadow-xl" style={{ backgroundColor: currentPrimaryColor }}>{t('confirm')}</button>
      </div>
    </div>
  );
};

const UserModal = ({ showUserModal, setShowUserModal, userProfile, t, APP_CONFIG, currentPrimaryColor, currentDarkColor, favorites, setFavorites }) => {
  if (!showUserModal) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUserModal(false)}></div>
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl p-6 pb-24 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
        <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 z-50 bg-gray-100 p-2 rounded-full text-gray-500"><X size={20} /></button>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <User size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold">{t('guest')}</h3>
          <p className="text-sm text-gray-500">{t('welcome')}</p>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl" onClick={() => window.open(APP_CONFIG.aboutUsUrl)}>
            <div className="flex items-center gap-3"><Info size={20} /> {t('aboutUs')}</div>
            <ChevronRight size={16} />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl" onClick={() => window.open(APP_CONFIG.contactLineUrl)}>
            <div className="flex items-center gap-3"><MessageCircle size={20} /> {t('contactSupport')}</div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 主程式 (App)
// ==========================================
export default function App() {
  const [appStarted, setAppStarted] = useState(false);
  const [landingStep, setLandingStep] = useState('welcome');
  const [previewVillage, setPreviewVillage] = useState(null);
  const [language, setLanguage] = useState('zh');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('太平村');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [arTargetShop, setArTargetShop] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);
  const [filterElevator, setFilterElevator] = useState(false);
  const [filterEventOnly, setFilterEventOnly] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const t = (key) => (translations[language]?.[key] || key);
  const currentPrimaryColor = villageData[selectedVillage]?.color || '#059669';
  const currentDarkColor = villageData[selectedVillage]?.textDark || '#047857';

  // 輔助邏輯
  const getDynamicText = (shop, field) => {
    if (!shop) return '';
    return (language === 'en' && shop[`${field}_en`]) ? shop[`${field}_en`] : shop[field];
  };

  const checkIsOpen = (hours) => {
    if (!hours) return null;
    if (hours.includes('預約制')) return 'appointment';
    return true; 
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newList = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('meishan_favorites', JSON.stringify(newList));
      return newList;
    });
  };

  // 資料獲取
  useEffect(() => {
    const mockData = [
      { id: '1', name: '太平雲梯', name_en: 'Taiping Bridge', village: '太平村', categories: ['attraction'], address: '太平老街', rating: 4.9, hours: '09:00-17:30', services: ['景點', '體驗'], images: ['https://images.unsplash.com/photo-1544333323-537706da362d?auto=format&fit=crop&q=80&w=400'], description: '海拔最高的景觀吊橋。' },
      { id: '2', name: '大興客棧', name_en: 'Daxing Inn', village: '太興村', categories: ['accommodation'], address: '太興村', rating: 4.5, hours: '預約制', services: ['電梯', '住宿'], hasElevator: true, images: ['https://images.unsplash.com/photo-1449156001103-f2d004775009?auto=format&fit=crop&q=80&w=400'], description: '溫馨的在地民宿。' }
    ];
    setShops(mockData);
    setLoading(false);
    const saved = localStorage.getItem('meishan_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const processedShops = useMemo(() => {
    let result = shops.filter(s => !s.categories.includes('公告'));
    if (currentView === 'favorites') {
      result = result.filter(s => favorites.includes(s.id));
    } else {
      result = result.filter(s => s.village === selectedVillage);
      if (activeCategory !== 'all') result = result.filter(s => s.categories.includes(activeCategory));
    }
    if (searchQuery) result = result.filter(s => (s.name || '').includes(searchQuery));
    if (filterElevator) result = result.filter(s => s.hasElevator);
    return result;
  }, [shops, selectedVillage, activeCategory, searchQuery, favorites, currentView, filterElevator]);

  const hasAnyEventsInVillage = shops.some(s => s.village === selectedVillage && s.matchedEvents?.length > 0);

  if (!appStarted) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 font-sans flex justify-center overflow-hidden">
        <div className="w-full max-w-md relative shadow-2xl overflow-hidden flex flex-col bg-gray-100">
          <img src="/bg.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gradient-to-br', 'from-[#f2cfc9]', 'via-[#d2cbe3]', 'to-[#b4d8d4]'); }} />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0"></div>
          <div className="relative z-10 flex flex-col w-full h-full">
            {landingStep === 'welcome' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="flex flex-col items-center space-y-8 p-8 bg-white/60 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/60 w-full text-center">
                  <Mascot size={120} animation="bounce" className="drop-shadow-xl" />
                  <div className="space-y-2"><p className="text-sm font-bold text-gray-600 tracking-widest uppercase">{APP_CONFIG.subTitle}</p></div>
                  <button onClick={() => setLandingStep('select')} className="group relative w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 overflow-hidden transition-all active:scale-95">
                    <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">Let's GO 出發! <Play size={18} fill="white" /></span>
                  </button>
                </div>
              </div>
            )}
            {landingStep === 'select' && (
              <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto">
                <div className="flex justify-between items-center mb-6 mt-4">
                  <h2 className="text-2xl font-bold text-gray-900 bg-white/50 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/50">{t('welcomeTitle')}</h2>
                  <button onClick={() => setLandingStep('welcome')} className="bg-white/50 p-2 rounded-full text-gray-700"><ChevronLeft size={24} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-10">
                  {Object.keys(villageData).map((vKey) => (
                    <button key={vKey} onClick={() => setPreviewVillage(vKey)} className="flex flex-col items-start p-5 rounded-[24px] text-left bg-white/85 backdrop-blur-md shadow-lg border-2 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden" style={{ borderColor: hexToRgba(villageData[vKey].color, 0.4) }}>
                      <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center shadow-sm relative overflow-hidden" style={{ backgroundColor: villageData[vKey].color }}>
                        <img src={`/${villageData[vKey].iconFile}`} alt="icon" className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => { e.target.style.display = 'none'; }} />
                        <Mountain size={20} className="text-white opacity-20" />
                      </div>
                      <h3 className="font-extrabold text-lg mb-1" style={{ color: villageData[vKey].textDark }}>{vKey}</h3>
                      <p className="text-xs font-bold opacity-60">{villageData[vKey].desc_zh}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {previewVillage && (
               <div className="absolute inset-0 z-50 flex items-end animate-fade-in">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewVillage(null)}></div>
                  <div className="relative w-full bg-white rounded-t-[40px] p-8 space-y-6 animate-slide-up shadow-2xl flex flex-col" style={{ borderTop: `8px solid ${villageData[previewVillage].color}` }}>
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md overflow-hidden bg-gray-50">
                          <img src={`/${villageData[previewVillage].iconFile}`} alt="icon" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                       </div>
                       <div>
                          <h2 className="text-3xl font-extrabold" style={{ color: villageData[previewVillage].textDark }}>{previewVillage}</h2>
                          <p className="text-sm font-bold text-gray-400 mt-1">{villageData[previewVillage].desc_zh}</p>
                       </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 text-sm leading-relaxed text-gray-600 font-medium">{villageData[previewVillage].intro}</div>
                    <button onClick={() => { setSelectedVillage(previewVillage); setAppStarted(true); setPreviewVillage(null); }} className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all active:scale-95" style={{ backgroundColor: villageData[previewVillage].color }}>
                      {t('enterVillage')} <ArrowRight className="inline-block ml-1" size={20} />
                    </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-800 font-sans flex justify-center overflow-hidden animate-fade-in relative">
      <style>{`@keyframes floatMascot { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -6px); } } .animate-float-mascot { animation: floatMascot 4s ease-in-out infinite; } @keyframes ride { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(1deg); } } .animate-ride { animation: ride 0.4s ease-in-out infinite; }`}</style>
      
      <div className="w-full max-w-md bg-gray-50 min-h-[100dvh] relative shadow-2xl overflow-y-auto pb-48 no-scrollbar">
        <div className="fixed inset-y-0 w-full max-w-md z-0 pointer-events-none overflow-hidden">
          <img src={`/${villageData[selectedVillage]?.bgFile}`} alt="Bg" className="w-full h-full object-cover opacity-80" onError={(e) => e.target.style.display = 'none'} />
        </div>

        <div className="relative z-10">
          <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-white/80 sticky top-0 z-20 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center gap-1">
              <button onClick={() => setAppStarted(false)} className="w-10 h-10 -ml-3 rounded-full flex items-center justify-center text-gray-400"><ChevronLeft size={28} /></button>
              <div onClick={() => setSidebarOpen(true)} className="flex flex-col items-start cursor-pointer">
                <div className="flex items-center gap-1" style={{ color: currentDarkColor }}><MapPin size={14} /><span className="text-[10px] font-bold uppercase">{APP_CONFIG.subTitle}</span></div>
                <h1 className="text-xl font-extrabold flex items-center gap-1">{currentView === 'favorites' ? t('myFavorites') : selectedVillage} <ChevronDown size={20} className="text-gray-400" /></h1>
              </div>
            </div>
            <button onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')} className="text-sm font-bold px-2 py-1 rounded-lg border bg-white" style={{ color: currentPrimaryColor }}>{t('langSwitch')}</button>
          </div>

          <div className="px-6 my-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
              <Search className="text-gray-400" size={20} />
              <input type="text" placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-gray-700 flex-1 text-sm font-medium" />
            </div>
          </div>

          <div className="px-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-800">{currentView === 'favorites' ? t('favoritesList') : t('featured')}</h2>
            {processedShops.length > 0 ? processedShops.map(shop => (
              <div key={shop.id} className="bg-white/95 rounded-[24px] overflow-hidden shadow-sm border border-white" onClick={() => setSelectedShop(shop)}>
                <div className="h-48 w-full relative bg-gray-100">
                  <img src={shop.images[0]} alt="Shop" className="w-full h-full object-cover" />
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(shop.id); }} className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-sm"><Heart size={18} className={favorites.includes(shop.id) ? "fill-rose-500 text-rose-500" : "text-gray-400"} /></button>
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: villageData[shop.village]?.color }}>{shop.village}</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold">{shop.name}</h3><div className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor" />{shop.rating}</div></div>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={12} />{shop.address}</p>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                <Mascot size={72} className="opacity-30 grayscale" />
                <p className="mt-4">{t('noShops')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[85] pointer-events-none">
        <div className="relative flex justify-center pointer-events-none">
          <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 pointer-events-auto z-0 animate-float-mascot">
            <Mascot size={110} className="hover:-translate-y-3 transition-transform cursor-pointer" />
          </div>
          <div className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto relative z-10">
            <button onClick={() => setCurrentView('home')} style={{ color: currentView === 'home' ? currentPrimaryColor : '#ccc' }}><Home size={24}/></button>
            <button onClick={() => setCurrentView('favorites')} style={{ color: currentView === 'favorites' ? '#f43f5e' : '#ccc' }}><Heart size={24} className={currentView === 'favorites' ? 'fill-rose-500' : ''}/></button>
            <button onClick={() => setAppStarted(false)} className="-mt-10 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl border-[5px] border-white" style={{ backgroundColor: currentPrimaryColor }}><LocateFixed size={28}/></button>
            <button onClick={() => setShowFilterModal(true)} style={{ color: filterOpenOnly || filterElevator || filterEventOnly ? currentPrimaryColor : '#ccc' }}><Filter size={24}/></button>
            <button onClick={() => setShowUserModal(true)} style={{ color: showUserModal ? currentPrimaryColor : '#ccc' }}><User size={24}/></button>
          </div>
        </div>
      </div>

      <ShopDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} t={t} language={language} setArTargetShop={setArTargetShop} userLocation={userLocation} checkIsOpen={checkIsOpen} getDynamicText={getDynamicText} />
      <FilterModal showFilterModal={showFilterModal} setShowFilterModal={setShowFilterModal} filterOpenOnly={filterOpenOnly} setFilterOpenOnly={setFilterOpenOnly} filterElevator={filterElevator} setFilterElevator={setFilterElevator} hasAnyEventsInVillage={hasAnyEventsInVillage} filterEventOnly={filterEventOnly} setFilterEventOnly={setFilterEventOnly} currentPrimaryColor={currentPrimaryColor} t={t} />
      <UserModal showUserModal={showUserModal} setShowUserModal={setShowUserModal} t={t} APP_CONFIG={APP_CONFIG} currentPrimaryColor={currentPrimaryColor} />
      {arTargetShop && <ARNavigation targetShop={arTargetShop} onClose={() => setArTargetShop(null)} />}
    </div>
  );
}