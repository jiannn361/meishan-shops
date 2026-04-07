import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Navigation, Facebook, Star, Home, Coffee, Gift, User, Filter, Heart, Menu, X, Mountain, Loader2, Camera, Ticket, Tag, Clock, ChevronLeft, ChevronRight, Info, LocateFixed, Globe, MessageCircle, Map as MapIcon, ExternalLink, CalendarCheck, Banknote, AlertCircle, Bus, ChevronDown, Play, ArrowRight, Sparkles, Cloud, Bird, Leaf, Flower2, Sunrise, Trees } from 'lucide-react';

// 【安全修正】讀取環境變數
// ⚠️ 註：由於預覽環境限制，目前先以空字串代替。
// 在您的電腦本地或 Vercel 上正式部署時，請修改為： const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || "";
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || "";

// 【網站設定區】
const APP_CONFIG = {
  appName: "Meishan Taiping",
  subTitle: "Meishan, Chiayi",
  airtableApiKey: AIRTABLE_API_KEY, 
  airtableBaseId: "appkU3kxP74Gq7iXj", 
  airtableTableName: "Table 1", 
  liffId: "2009010332-K14upnUb",
  aboutUsUrl: "https://www.facebook.com/TaipingSuspensionBridge?locale=zh_TW", 
  notionUrl: "https://www.notion.so/2a11f9fee71981239a89ebdbb2f25441?source=copy_link", 
  contactLineUrl: "https://line.me/R/ti/p/@your_line_id_here", 
};

// 【多國語言字典 - 系統介面】
const translations = {
  zh: {
    explore: '探索',
    pocketList: '口袋名單',
    myFavorites: '我的收藏',
    searchPlaceholder: '搜尋關鍵字或服務(例如: 茶)...',
    all: '全部',
    accommodation: '民宿',
    food: '美食',
    gift: '伴手禮',
    attraction: '景點',
    experience: '體驗',
    transport: '交通',
    favoritesList: '收藏清單',
    featured: '精選推薦',
    openNow: '營業中',
    openingSoon: '即將營業',
    closingSoon: '即將休息', 
    closed: '休息中',
    checkAnnouncement: '詳見公告',
    byAppointment: '預約制',
    bookNow: '線上預約',
    distance: '距離',
    shopsCount: '間',
    loading: '快到了再等一下...',
    noFavorites: '您的口袋名單還是空的喔！',
    noShops: '這個村落暫時沒有符合的店家',
    goToExplore: '去探索店家',
    showAll: '顯示全部',
    googleInfo: 'Google 資訊',
    fbAnnouncement: '粉專公告',
    navigate: '導航',
    aboutUs: '關於我們',
    contactSupport: '聯絡客服',
    trailGuide: '周邊步道攻略',
    clearFavorites: '清空收藏紀錄',
    quickFilter: '快速篩選',
    onlyOpenNow: '只顯示營業中',
    confirm: '確認',
    shopIntro: '店家介紹',
    googleReviews: '查看 Google 評論',
    paymentMethod: '付款方式',
    notice: '溫馨提醒',
    guest: '訪客',
    welcome: '歡迎來到梅山',
    switchVillage: '切換村落',
    confirmClearFav: '確定要清空所有收藏嗎？',
    langSwitch: 'EN',
    aboutUsText: "歡迎您來到梅山！\n我們致力於推廣梅山在地觀光，\n讓您輕鬆找到最棒的民宿與美食。",
    welcomeTitle: "今天想去哪裡呢?",
    enterVillage: "開始探索"
  },
  en: {
    explore: 'Explore',
    pocketList: 'Pocket List',
    myFavorites: 'Favorites',
    searchPlaceholder: 'Search keyword or services...',
    all: 'All',
    accommodation: 'Stays',
    food: 'Food',
    gift: 'Gifts',
    attraction: 'Spots',
    experience: 'Exp',
    transport: 'Transport',
    favoritesList: 'Favorites',
    featured: 'Featured',
    openNow: 'Open Now',
    openingSoon: 'Opening Soon',
    closingSoon: 'Closing Soon',
    closed: 'Closed',
    checkAnnouncement: 'Check Info',
    byAppointment: 'By Appt',
    bookNow: 'Book Now',
    distance: 'Dist',
    shopsCount: 'shops',
    loading: 'Almost there, please wait...',
    noFavorites: 'You have no favorites yet!',
    noShops: 'Oops, no shops match your criteria.',
    goToExplore: 'Explore Shops',
    showAll: 'Show All',
    googleInfo: 'Google Info',
    fbAnnouncement: 'FB Info',
    navigate: 'Navigate',
    aboutUs: 'About Us',
    contactSupport: 'Support',
    trailGuide: 'Trail Guide',
    clearFavorites: 'Clear Favorites',
    quickFilter: 'Quick Filter',
    onlyOpenNow: 'Open Now Only',
    confirm: 'Apply',
    shopIntro: 'About',
    googleReviews: 'Google Reviews',
    paymentMethod: 'Payment',
    notice: 'Notice',
    guest: 'Guest',
    welcome: 'Welcome to Meishan',
    switchVillage: 'Switch Village',
    confirmClearFav: 'Clear all favorites?',
    langSwitch: '中',
    aboutUsText: "Welcome to Meishan!\nWe are dedicated to promoting local tourism,\nhelping you find the best stays and food.",
    welcomeTitle: "Where to explore?",
    enterVillage: "Enter Village"
  }
};

// ==========================================
// 🎨 村落資料字典 
// ==========================================
const villageData = {
  '太平村': { 
    zh: '太平村', en: 'Taiping', desc_zh: '雲梯與老街', desc_en: 'Sky Bridge & Old Street', 
    color: '#b8caa5', textDark: '#506638', textBadge: '#ffffff',
    bgFile: 'bg-taiping.png', iconFile: 'icon-taiping.png', icon: Cloud,
    animIcon: Cloud, animColor: 'text-gray-400/50', plantPrefix: 'taiping',
    intro: '漫步在雲端上的太平雲梯，俯瞰嘉南平原的壯麗景色，並在充滿歷史韻味的太平老街品嚐在地茶香與美食，感受雲霧繚繞的茶鄉風情。'
  },
  '太興村': { 
    zh: '太興村', en: 'Taixing', desc_zh: '萬鷺朝鳳', desc_en: 'Herons Migration', 
    color: '#ea994d', textDark: '#a35a0f', textBadge: '#ffffff',
    bgFile: 'bg-taixing.png', iconFile: 'icon-taixing.png', icon: Bird,
    animIcon: Bird, animColor: 'text-amber-700/40', plantPrefix: 'taixing',
    intro: '每年秋季限定的「萬鷺朝鳳」奇景令人嘆為觀止。這裡有著豐富的生態與優美的步道，適合喜愛大自然與深度生態旅遊的您。'
  },
  '碧湖/龍眼村': { 
    zh: '碧湖/龍眼村', en: 'Bihu / Longyan', desc_zh: '觀光茶園', desc_en: 'Tea Gardens', 
    color: '#80a4aa', textDark: '#3a595e', textBadge: '#ffffff',
    bgFile: 'bg-bihu.png', iconFile: 'icon-bihu.png', icon: Leaf,
    animIcon: Leaf, animColor: 'text-emerald-600/40', plantPrefix: 'bihu',
    intro: '被群山環繞的翠綠觀光茶園，層層疊疊的茶樹宛如綠色地毯。來到這裡，點一杯好茶，靜靜享受遠離塵囂的寧靜與茶香。'
  },
  '瑞里村': { 
    zh: '瑞里村', en: 'Ruili', desc_zh: '紫色山城', desc_en: 'Purple Mountain Town', 
    color: '#d2cbe3', textDark: '#5a5270', textBadge: '#413a54',
    bgFile: 'bg-ruili.png', iconFile: 'icon-ruili.png', icon: Flower2,
    animIcon: Flower2, animColor: 'text-purple-500/50', plantPrefix: 'ruili',
    intro: '著名的浪漫紫色山城，春季紫藤花盛開時如夢似幻。擁有燕子崖、蝙蝠洞等壯麗的自然地質景觀，是登山健行的絕佳勝地。'
  },
  '瑞峰村': { 
    zh: '瑞峰村', en: 'Ruifeng', desc_zh: '日出與步道', desc_en: 'Sunrise & Trails', 
    color: '#dd785b', textDark: '#8a371c', textBadge: '#ffffff',
    bgFile: 'bg-ruifeng.png', iconFile: 'icon-ruifeng.png', icon: Sunrise,
    animIcon: Sparkles, animColor: 'text-orange-500/50', plantPrefix: 'ruifeng',
    intro: '坐擁絕美的日出勝地與竹坑溪步道，清晨的雲海與壯闊的山林景緻交織。非常適合熱愛早起迎接第一道曙光與親近森林的旅人。'
  },
  '太和村': { 
    zh: '太和村', en: 'Taihe', desc_zh: '茶園秘境', desc_en: 'Hidden Tea Farms', 
    color: '#c4b28e', textDark: '#70603d', textBadge: '#ffffff',
    bgFile: 'bg-taihe.png', iconFile: 'icon-taihe.png', icon: Trees,
    animIcon: Leaf, animColor: 'text-lime-700/40', plantPrefix: 'taihe',
    intro: '隱藏在深山中的茶園秘境，保留了最原始純粹的自然風貌。漫步在茶園小徑，感受山林間最清新的空氣與獨特靜謐。'
  },
};

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ==========================================
// 🐻 專屬吉祥物元件 (Mascot)
// ==========================================
const Mascot = ({ size = 60, className = "", animation = "", imageUrl = null }) => {
  const defaultMascotUrl = "/mascot.png";
  const mascotSrc = imageUrl || defaultMascotUrl;

  let animClass = "";
  if (animation === "spin") animClass = "animate-spin";     
  if (animation === "bounce") animClass = "animate-bounce"; 
  if (animation === "pulse") animClass = "animate-pulse";
  
  if (animation === "run") animClass = "animate-ride";   

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

// 【文字美化元件】
const FormattedText = ({ text, className = "" }) => {
  if (!text) return null;
  const strText = Array.isArray(text) ? text.join('\n') : String(text);
  const lines = strText.split(/\||\n|\\n/);
  
  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
        if (line.trim() === '') {
          return <div key={lineIdx} className="h-3 md:h-4"></div>; 
        }

        const parts = line.split(/([（(].*?[)）])/g);
        return (
          <div key={lineIdx} className="leading-relaxed">
            {parts.map((part, partIdx) => {
              if (part.match(/^[（(].*[)）]$/)) {
                return <span key={partIdx} className="text-xs text-gray-400 font-normal ml-0.5">{part}</span>;
              }
              return <span key={partIdx}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// 【預設商家圖片】 (山形圖示)
const DefaultShopImage = () => (
  <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
      <Mountain size={48} className="text-emerald-600 opacity-80" strokeWidth={1.5} />
    </div>
  </div>
);

// 🍃 飄落物元件 (使用 React 狀態安全切換，防止白畫面當機)
const FallingItem = ({ vData, size, left, animationClass }) => {
  const [imgError, setImgError] = useState(false);
  const plantPrefix = vData.plantPrefix || 'default';
  const AnimIcon = vData.animIcon || Leaf;
  const animColor = vData.animColor || 'text-emerald-500/30';

  return (
    <div className={`absolute top-[-10%] ${left} ${animationClass}`}>
      {!imgError ? (
        <img 
           src={`/fall-${plantPrefix}.png`} 
           alt=""
           style={{ width: size, height: size }}
           className="object-contain drop-shadow-sm opacity-80"
           onError={() => setImgError(true)} 
        />
      ) : (
        <AnimIcon className={animColor} size={size} />
      )}
    </div>
  );
};

// 🌿 植物元件 (安全處理找不到圖檔的狀況)
const PlantImage = ({ prefix, side, className, style }) => {
  const [errorCount, setErrorCount] = useState(0);
  
  if (errorCount >= 2) return null; 
  
  const src = errorCount === 0 ? `/plant-${prefix}-${side}.png` : `/plant-${side}.png`;

  return (
    <img 
       src={src} 
       alt="" 
       className={className} 
       style={style}
       onError={() => setErrorCount(prev => prev + 1)} 
    />
  );
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('太平村');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home'); 
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  
  const [appStarted, setAppStarted] = useState(false); 
  const [landingStep, setLandingStep] = useState('welcome'); 
  const [previewVillage, setPreviewVillage] = useState(null); 
  
  const [selectedShop, setSelectedShop] = useState(null); 
  const [showFilterModal, setShowFilterModal] = useState(false); 
  const [showUserModal, setShowUserModal] = useState(false); 
  const [filterOpenOnly, setFilterOpenOnly] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 

  const currentPrimaryColor = villageData[selectedVillage]?.color || '#059669';
  const currentDarkColor = villageData[selectedVillage]?.textDark || '#047857';
  const currentBadgeColor = villageData[selectedVillage]?.textBadge || '#ffffff';

  const t = (key) => (translations[language] && translations[language][key]) || translations['zh'][key] || key;
  
  const getDynamicText = (shop, fieldName) => {
    if (language === 'en' && shop[`${fieldName}_en`]) {
      return shop[`${fieldName}_en`];
    }
    return shop[fieldName];
  };

  useEffect(() => {
    document.title = APP_CONFIG.appName;
    const savedFavs = localStorage.getItem('meishan_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedLang = localStorage.getItem('meishan_language');
    if (savedLang === 'en' || savedLang === 'zh') setLanguage(savedLang);

    if (APP_CONFIG.liffId) {
      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      script.onload = () => {
        if (window.liff) {
          window.liff.init({ liffId: APP_CONFIG.liffId }).then(() => {
            if (window.liff.isLoggedIn()) {
              window.liff.getProfile().then(profile => setUserProfile(profile));
            }
          }).catch((err) => console.log('LIFF Init failed', err));
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    localStorage.setItem('meishan_language', newLang);
  };

  const toggleFavorite = (shopId) => {
    let newFavs;
    if (favorites.includes(shopId)) {
      newFavs = favorites.filter(id => id !== shopId);
    } else {
      newFavs = [...favorites, shopId];
    }
    setFavorites(newFavs);
    localStorage.setItem('meishan_favorites', JSON.stringify(newFavs));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("您的瀏覽器不支援地理位置功能 / Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setSortBy('distance');
        setCurrentView('home');
        setLoading(false);
      },
      (error) => {
        console.log("Error", error);
        alert("無法取得您的位置 / Cannot get location");
        setLoading(false);
      }
    );
  };

  const categoryConfig = {
    'all': { labelKey: 'all', icon: <Search size={18}/> },
    'accommodation': { labelKey: 'accommodation', icon: <Home size={18}/> },
    'food': { labelKey: 'food', icon: <Coffee size={18}/> },
    'gift': { labelKey: 'gift', icon: <Gift size={18}/> },
    'attraction': { labelKey: 'attraction', icon: <Camera size={18}/> },
    'experience': { labelKey: 'experience', icon: <Ticket size={18}/> },
    'transport': { labelKey: 'transport', icon: <Bus size={18}/> },
    '交通': { labelKey: 'transport', icon: <Bus size={18}/> },
  };

  const checkIsOpen = (hoursString) => {
    if (!hoursString) return null; 
    const now = new Date();
    const currentDay = now.getDay(); 
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    let cleanHours = String(hoursString).replace(/\|/g, ',').replace(/：/g, ':').replace(/～/g, '-').replace(/至/g, '-').trim();
    
    const expandDayRanges = (str) => {
      const dayMap = { '日': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
      const revMap = ['日', '一', '二', '三', '四', '五', '六'];
      return str.replace(/(?:週|星期)([日一二三四五六])\s*(?:-|~)\s*(?:週|星期)([日一二三四五六])/g, (match, startChar, endChar) => {
        let startIdx = dayMap[startChar];
        let endIdx = dayMap[endChar];
        let result = [];
        let curr = startIdx;
        while (true) {
          result.push('週' + revMap[curr]);
          if (curr === endIdx) break;
          curr = (curr + 1) % 7;
        }
        return result.join(' ');
      });
    };

    cleanHours = expandDayRanges(cleanHours);
    
    if (cleanHours.includes('預約制')) return 'appointment';
    if (cleanHours.toLowerCase().includes('google')) return 'google';
    if (cleanHours.toLowerCase().includes('fb') || cleanHours.includes('粉絲專頁')) return 'fb';
    if (cleanHours === '營業中') return true;
    if (cleanHours === '休息中') return false;

    const dayChars = ['日', '一', '二', '三', '四', '五', '六'];
    const todayChar = dayChars[currentDay];
    const isWeekend = currentDay === 0 || currentDay === 6;
    const segments = cleanHours.split(/[,;，；\n]/).map(s => s.trim()).filter(s => s);
    let matchedRanges = [];
    let matchPriority = -1; 

    for (let segment of segments) {
      let applies = false;
      let priority = 0;
      const hasSpecificDay = /(週|星期)[日一二三四五六]/.test(segment);
      const hasWeekday = /平日/.test(segment);
      const hasWeekend = /(假日|週末|六日)/.test(segment);

      if (hasSpecificDay) {
        if (new RegExp(`(週|星期)[日一二三四五六、,，\\s]*${todayChar}`).test(segment)) { 
          applies = true; 
          priority = 2; 
        }
      } else if (hasWeekday) {
        if (!isWeekend) { applies = true; priority = 1; }
      } else if (hasWeekend) {
        if (isWeekend) { applies = true; priority = 1; }
      } else {
        applies = true; priority = 0;
      }

      if (applies) {
        const isClosed = /公休|休息/.test(segment);
        if (priority > matchPriority) {
          matchPriority = priority;
          matchedRanges = isClosed ? [] : [segment]; 
        } else if (priority === matchPriority) {
          if (isClosed) matchedRanges = [];
          else matchedRanges.push(segment);
        }
      }
    }

    if (matchPriority === -1) {
      const hasAnyDayKeywords = /(週|星期|平日|假日|週末)/.test(cleanHours);
      if (hasAnyDayKeywords) return false; 
      matchedRanges = [cleanHours];
    }
    if (matchedRanges.length === 0 && matchPriority > -1) return false; 

    let isOpeningSoon = false;
    let isClosingSoon = false;
    let isOpenNow = false;

    for (let segment of matchedRanges) {
      const times = segment.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g);
      if (times) {
        for (let timeRange of times) {
           const [startStr, endStr] = timeRange.split('-').map(s => s.trim());
           try {
              const [startH, startM] = startStr.split(':').map(Number);
              const [endH, endM] = endStr.split(':').map(Number);
              const startVal = startH * 60 + startM;
              const endVal = endH * 60 + endM;
              
              if (currentTimeVal >= startVal && currentTimeVal < endVal) {
                  isOpenNow = true;
                  if (currentTimeVal >= endVal - 30) {
                      isClosingSoon = true;
                  }
              }
              if (currentTimeVal >= startVal - 30 && currentTimeVal < startVal) {
                  isOpeningSoon = true;
              }
           } catch (e) {}
        }
      }
    }

    if (isClosingSoon) return 'closing_soon';
    if (isOpenNow) return true;
    if (isOpeningSoon) return 'opening_soon';
    return false;
  };

  const processAirtableRecord = (record) => {
    const f = record.fields;
    
    let categories = [];
    const rawCat = f['category'] || f['分類'] || f['Category'] || 'food';
    if (Array.isArray(rawCat)) {
      categories = rawCat;
    } else {
      categories = String(rawCat).split(/[,，/|、]/).map(c => c.trim()).filter(Boolean);
    }

    let images = [];
    const rawImg = f['images'] || f['image'] || f['圖片'] || f['圖片網址'] || f['Images'];
    if (Array.isArray(rawImg)) {
      images = rawImg.map(img => img.url || img);
    } else if (rawImg) {
      images = String(rawImg).split(/[,，]/).map(s => s.trim());
    }

    let trailMapRaw = f['trail_map'] || f['步道簡圖'] || f['Trail Map'] || f['簡圖'];
    let trailMap = '';
    if (Array.isArray(trailMapRaw) && trailMapRaw.length > 0) {
      trailMap = trailMapRaw[0].url || trailMapRaw[0];
    } else if (typeof trailMapRaw === 'string') {
      trailMap = trailMapRaw.split(/[,，]/)[0].trim();
    }

    let services = [];
    const rawSvc = f['services'] || f['服務標籤'] || f['Services'];
    if (Array.isArray(rawSvc)) {
      services = rawSvc;
    } else if (rawSvc) {
      services = String(rawSvc).split(/[,，]/).map(s => s.trim());
    }

    const bookingPlatforms = [
        { key: 'booking', label: 'Booking.com' },
        { key: 'agoda', label: 'Agoda' },
        { key: 'airbnb', label: 'Airbnb' },
        { key: 'asiayo', label: 'AsiaYo' },
        { key: 'klook', label: 'Klook' },
        { key: 'kkday', label: 'KKday' },
        { key: '訂房連結', label: language === 'en' ? 'Book Now' : '線上預約' },
        { key: 'booking_url', label: language === 'en' ? 'Book Now' : '預約' }
    ];
    
    const shopBookings = [];
    bookingPlatforms.forEach(platform => {
        const keys = Object.keys(f);
        const matchedKey = keys.find(k => k.toLowerCase().includes(platform.key));
        if (matchedKey && f[matchedKey]) {
            shopBookings.push({ name: platform.label, url: f[matchedKey] });
        }
    });

    return {
      id: record.id,
      name: f['name'] || f['Name'] || f['店家名稱'] || '未命名店家',
      name_en: f['name_en'] || f['Name_en'] || f['店家名稱_英'] || '',
      village: f['village'] || f['Village'] || f['村落名稱'] || f['村落'] || '太平村',
      categories: categories,
      category: categories[0] || 'food',
      address: f['address'] || f['Address'] || f['地址'] || '',
      address_en: f['address_en'] || f['地址_英'] || '',
      lat: parseFloat(f['lat'] || f['Lat'] || f['緯度']) || null,
      lng: parseFloat(f['lng'] || f['Lng'] || f['經度']) || null,
      services: services,
      trail_map: trailMap,
      rating: (f['rating'] || f['Rating'] || f['星等']) ? parseFloat(f['rating'] || f['Rating'] || f['星等']) : null,
      reviews: parseInt(f['reviews'] || f['Reviews'] || f['評論數'] || 0),
      images: images,
      tel: f['tel'] || f['Tel'] || f['Phone'] || f['電話'] || '',
      fbLink: f['fbLink'] || f['fb link'] || f['fblink'] || f['FB Link'] || f['粉專連結'] || '',
      line_url: f['line_url'] || f['line'] || f['Line'] || f['line link'] || f['官方帳號'] || '',
      google_url: f['google_url'] || f['google_link'] || f['地圖連結'] || f['評論連結'] || '',
      nav_link: f['nav_link'] || f['nav'] || f['navigation'] || f['導航連結'] || f['導航'] || '',
      website: f['website'] || f['Website'] || f['網站'] || f['官網'] || f['官方網站'] || f['網址'] || '',
      payment: f['payment'] || f['付款方式'] || f['支付方式'] || f['付款'] || '',
      payment_en: f['payment_en'] || f['付款方式_英'] || '',
      notice: f['notice'] || f['注意事項'] || f['提醒'] || f['備註'] || '',
      notice_en: f['notice_en'] || f['注意事項_英'] || '',
      bookings: shopBookings,
      hours: f['hours'] || f['Hours'] || f['營業時間'] || '',
      description: f['description'] || f['Description'] || f['介紹'] || f['店家介紹'] || '暫無詳細介紹，歡迎親自蒞臨體驗！',
      description_en: f['description_en'] || f['Description_en'] || f['介紹_英'] || '',
    };
  };

  useEffect(() => {
    const fetchAirtableData = async () => {
      if (!APP_CONFIG.airtableApiKey) {
        console.log("Airtable API Key 未設定");
        setLoading(false);
        return;
      }

      const CACHE_KEY = 'meishan_airtable_data';
      const CACHE_TIME_KEY = 'meishan_airtable_time';
      const CACHE_DURATION = 1000 * 60 * 5; 

      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const now = new Date().getTime();

      if (cachedData && cachedTime && (now - parseInt(cachedTime)) < CACHE_DURATION) {
        setShops(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      setLoading(true);
      let allRecords = [];
      let offset = '';

      try {
        while (true) {
          let url = `https://api.airtable.com/v0/${APP_CONFIG.airtableBaseId}/${encodeURIComponent(APP_CONFIG.airtableTableName)}?view=Grid%20view`;
          if (offset) url += `&offset=${offset}`;

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${APP_CONFIG.airtableApiKey}` }
          });

          if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

          const data = await response.json();
          allRecords = [...allRecords, ...data.records];
          if (data.offset) offset = data.offset; else break;
        }

        const processedShops = allRecords.map(processAirtableRecord);
        setShops(processedShops);

        localStorage.setItem(CACHE_KEY, JSON.stringify(processedShops));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());

      } catch (error) {
        console.log("Airtable 讀取失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirtableData();
  }, []);

  const getGoogleMapLink = (name, address) => {
    const query = encodeURIComponent(`${address} ${name}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getDynamicCategories = () => {
    const existingCategories = new Set();
    shops.forEach(s => {
      if (s.categories) {
        s.categories.forEach(c => {
           if(c !== '活動' && c !== '公告' && c !== 'announcement') {
               existingCategories.add(c);
           }
        });
      }
    });

    const dynamicCats = ['all', ...existingCategories];
    const definedOrder = Object.keys(categoryConfig);
    dynamicCats.sort((a, b) => {
      const idxA = definedOrder.indexOf(a);
      const idxB = definedOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return dynamicCats;
  };

  const getProcessedShops = () => {
    let result = shops.filter(shop => {
        return !shop.categories.includes('活動') && !shop.categories.includes('公告') && !shop.categories.includes('announcement') && shop.category !== 'announcement';
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(shop => {
        const nameMatch = shop.name?.toLowerCase().includes(query) || shop.name_en?.toLowerCase().includes(query);
        const serviceMatch = shop.services?.some(s => s.toLowerCase().includes(query));
        return nameMatch || serviceMatch;
      });
    }

    if (currentView === 'favorites') {
      result = result.filter(shop => favorites.includes(shop.id));
    } else {
      result = result.filter(shop => {
        const villageMatch = shop.village === selectedVillage;
        const categoryMatch = activeCategory === 'all' || (shop.categories && shop.categories.includes(activeCategory));
        return villageMatch && categoryMatch;
      });
    }
    
    if (filterOpenOnly) {
      result = result.filter(shop => {
        const isOpen = checkIsOpen(shop.hours);
        const isAccommodation = shop.categories && shop.categories.includes('accommodation');
        const showAccommodationBadge = isAccommodation && !shop.hours;
        
        return isOpen === true || 
               isOpen === 'opening_soon' || 
               isOpen === 'closing_soon' || 
               isOpen === 'appointment' || 
               showAccommodationBadge;
      });
    }
    
    if (userLocation) {
      result = result.map(shop => ({
        ...shop,
        distance: calculateDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
      }));
    }
    
    if (sortBy === 'distance' && userLocation) {
      result.sort((a, b) => {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });
    }
    return result;
  };

  const processedShops = getProcessedShops();
  const availableCategories = getDynamicCategories();

  const ImageCarousel = ({ images, onClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
      if (!images || images.length <= 1) return;
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4000); 
      return () => clearInterval(interval);
    }, [images?.length]);

    if (!images || images.length === 0 || imgError) {
       return <div onClick={onClick} className="w-full h-full cursor-pointer"><DefaultShopImage /></div>;
    }

    if (images.length === 1) {
        return (
            <img src={images[0]} alt="shop" onClick={onClick}
               className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer"
               onError={() => setImgError(true)} />
        );
    }

    const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length); };
    const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); };

    return (
      <div className="relative w-full h-full group cursor-pointer" onClick={onClick}>
        <img src={images[currentIndex]} alt={`slide-${currentIndex}`} 
             className="w-full h-full object-cover transition-all duration-500" onError={() => setImgError(true)} />
        <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
        <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-white font-medium">{currentIndex + 1} / {images.length}</div>
      </div>
    );
  };

  const ShopDetailModal = ({ shop, onClose }) => {
    const [viewTrailMap, setViewTrailMap] = useState(false);

    if (!shop) return null;
    const isOpen = checkIsOpen(shop.hours);

    const displayName = getDynamicText(shop, 'name');
    const displayDesc = getDynamicText(shop, 'description');
    const displayAddress = getDynamicText(shop, 'address');
    const displayPayment = getDynamicText(shop, 'payment');
    const displayNotice = getDynamicText(shop, 'notice');

    const isAccommodation = shop.categories && shop.categories.includes('accommodation');
    const hasHours = !!shop.hours;
    const showAccommodationBadge = isAccommodation && !hasHours;
    const accBadgeText = shop.bookings && shop.bookings.length > 0 ? t('bookNow') : t('byAppointment');
    
    const hideHoursText = !shop.hours || shop.hours.trim().toLowerCase() === 'google' || shop.hours.trim().toLowerCase() === 'fb' || shop.hours.includes('預約制');

    const shopColor = villageData[shop.village]?.color || '#059669';
    const shopDarkColor = villageData[shop.village]?.textDark || '#047857';

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

        {viewTrailMap && (
           <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setViewTrailMap(false)}>
              <button className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors">
                 <X size={24} />
              </button>
              <h3 className="absolute top-6 left-6 text-white font-bold text-lg drop-shadow-md">步道簡圖</h3>
              <img src={shop.trail_map} alt="步道簡圖" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
           </div>
        )}

        <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors">
            <X size={20} />
          </button>

          <div className="h-64 relative">
            <ImageCarousel images={shop.images} onClick={(e) => e.stopPropagation()} />

            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-4 left-5 right-5 text-white pointer-events-none">
              <h3 className="text-2xl font-bold mb-1 pointer-events-auto">{displayName}</h3>
              <div className="flex items-center gap-3 text-sm pointer-events-auto">
                {shop.rating && (
                  <div className="flex items-center gap-1 text-yellow-400">
                     <Star size={16} className="fill-yellow-400" />
                     <span className="font-bold text-lg">{shop.rating}</span>
                  </div>
                )}
                <a 
                  href={shop.google_url || getGoogleMapLink(shop.name, shop.address)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-white underline decoration-white/50 underline-offset-4 flex items-center gap-1 transition-colors"
                >
                  {t('googleReviews')} <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3 items-start">
               {showAccommodationBadge ? (
                 <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold self-start"
                  style={{ backgroundColor: hexToRgba(shopDarkColor, 0.15), color: shopDarkColor }}
                 >
                   <CalendarCheck size={14} />
                   {accBadgeText}
                 </div>
               ) : isOpen === 'appointment' ? (
                 <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold self-start"
                  style={{ backgroundColor: hexToRgba(shopDarkColor, 0.15), color: shopDarkColor }}
                 >
                   <CalendarCheck size={14} />
                   {t('byAppointment')}
                 </div>
               ) : (
                 <div 
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold self-start`}
                  style={
                    isOpen === true ? { backgroundColor: hexToRgba(shopDarkColor, 0.15), color: shopDarkColor } : 
                    isOpen === 'opening_soon' ? { backgroundColor: '#fef3c7', color: '#b45309' } : 
                    isOpen === 'closing_soon' ? { backgroundColor: '#ffedd5', color: '#c2410c' } : 
                    isOpen === false ? { backgroundColor: '#f3f4f6', color: '#4b5563' } : 
                    { backgroundColor: '#eff6ff', color: '#2563eb' }
                  }
                 >
                   <Clock size={14} />
                   {isOpen === true ? t('openNow') : isOpen === 'opening_soon' ? t('openingSoon') : isOpen === 'closing_soon' ? t('closingSoon') : isOpen === false ? t('closed') : t('checkAnnouncement')}
                 </div>
               )}

               {!hideHoursText && (
                 <div className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    <FormattedText text={shop.hours} />
                 </div>
               )}
            </div>

            {(displayPayment || displayNotice) && (
              <div className="space-y-3">
                {displayPayment && (
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                      <Banknote size={18} />
                    </div>
                    <div className="w-full">
                      <h4 className="text-[13px] font-bold text-amber-800 mb-0.5">{t('paymentMethod')}</h4>
                      <FormattedText text={displayPayment} className="text-sm text-amber-700 font-medium" />
                    </div>
                  </div>
                )}
                {displayNotice && (
                  <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 flex items-start gap-3">
                    <div className="bg-rose-100 p-2 rounded-full text-rose-600 shrink-0">
                      <AlertCircle size={18} />
                    </div>
                    <div className="w-full">
                      <h4 className="text-[13px] font-bold text-rose-800 mb-0.5">{t('notice')}</h4>
                      <FormattedText text={displayNotice} className="text-sm text-rose-700 font-medium" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 rounded-2xl border" style={{ backgroundColor: hexToRgba(shopColor, 0.05), borderColor: hexToRgba(shopColor, 0.15) }}>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-1" style={{ color: shopDarkColor }}>
                <Info size={14} /> {t('shopIntro')}
              </h4>
              <div className="text-sm text-gray-600 text-justify">
                <FormattedText text={displayDesc} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: shopColor }} />
                <span>{displayAddress}</span>
              </div>
              {shop.tel && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={18} className="shrink-0" style={{ color: shopColor }} />
                  <span>{shop.tel}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {shop.services.map((s, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  #{s}
                </span>
              ))}
            </div>

            {shop.trail_map && (
              <button 
                 onClick={() => setViewTrailMap(true)}
                 className="w-full py-3 mb-2 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm transition-transform active:scale-95 mt-4"
                 style={{ backgroundColor: hexToRgba(shopColor, 0.1), color: shopDarkColor, border: `1px solid ${hexToRgba(shopColor, 0.3)}` }}
              >
                 <MapIcon size={18} /> 查看步道簡圖
              </button>
            )}

            <div className="flex gap-3 pt-2 flex-wrap">
              <a 
                href={shop.nav_link || getGoogleMapLink(shop.name, shop.address)} 
                target="_blank" rel="noopener noreferrer" 
                className="flex-1 min-w-[100px] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity font-medium shadow-lg"
                style={{ backgroundColor: shopColor, boxShadow: `0 4px 14px 0 ${hexToRgba(shopColor, 0.4)}` }}
              >
                <Navigation size={18} /> {t('navigate')}
              </a>
              {shop.tel && (
                <a 
                  href={`tel:${shop.tel}`} 
                  className="w-12 h-12 flex items-center justify-center rounded-xl border hover:opacity-80 transition-opacity flex-shrink-0"
                  style={{ backgroundColor: hexToRgba(shopColor, 0.05), borderColor: hexToRgba(shopColor, 0.2), color: shopColor }}
                >
                  <Phone size={20} />
                </a>
              )}
              {shop.fbLink && (
                <a href={shop.fbLink} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0">
                  <Facebook size={20} />
                </a>
              )}
              {shop.line_url && (
                <a href={shop.line_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-colors flex-shrink-0">
                  <span className="font-extrabold text-xs">LINE</span>
                </a>
              )}
              {shop.website && (
                <a href={shop.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors flex-shrink-0">
                  <Globe size={20} />
                </a>
              )}
              
              {shop.bookings && shop.bookings.length > 0 && (
                shop.bookings.map((booking, idx) => (
                  <a 
                    key={idx}
                    href={booking.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 min-w-[120px] px-3 py-3 rounded-xl border text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 font-bold text-sm"
                    style={{ backgroundColor: shopDarkColor, boxShadow: `0 4px 14px 0 ${hexToRgba(shopDarkColor, 0.3)}` }}
                  >
                    <CalendarCheck size={18} />
                    <span>{booking.name}</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterModal = () => (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilterModal(false)}></div>
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-6 animate-slide-up">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">{t('quickFilter')}</h3>
          <button onClick={() => setShowFilterModal(false)}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-opacity-80 transition-colors" style={{ hover: { backgroundColor: hexToRgba(currentPrimaryColor, 0.05) } }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: hexToRgba(currentPrimaryColor, 0.15), color: currentPrimaryColor }}>
                <Clock size={20} />
              </div>
              <span className="font-medium text-gray-700">{t('onlyOpenNow')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${filterOpenOnly ? '' : 'bg-gray-300'}`}
                 style={filterOpenOnly ? { backgroundColor: currentPrimaryColor } : {}}
                 onClick={(e) => { e.preventDefault(); setFilterOpenOnly(!filterOpenOnly); }}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filterOpenOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
        <button 
          onClick={() => setShowFilterModal(false)} 
          className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: currentPrimaryColor }}
        >
          {t('confirm')}
        </button>
      </div>
    </div>
  );

  const UserModal = () => (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUserModal(false)}></div>
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-6 animate-slide-up">
        <div className="text-center">
          <div 
            className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 shadow-lg mb-4 flex items-center justify-center"
            style={{ borderColor: hexToRgba(currentPrimaryColor, 0.2), backgroundColor: hexToRgba(currentPrimaryColor, 0.05) }}
          >
            {userProfile?.pictureUrl ? (
              <img src={userProfile.pictureUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                 <Mountain size={40} className="relative z-10" strokeWidth={1.5} style={{ color: currentPrimaryColor }} />
                 <div className="absolute bottom-0 w-full h-1/3" style={{ backgroundColor: hexToRgba(currentPrimaryColor, 0.2) }}></div>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {userProfile?.displayName || t('guest')}
          </h3>
          <p className="text-sm text-gray-500">{t('welcome')}</p>
        </div>
        <div className="space-y-2">
          {APP_CONFIG.notionUrl && (
            <button 
              className="w-full flex items-center justify-between p-4 hover:opacity-80 rounded-xl transition-colors text-left border" 
              style={{ backgroundColor: hexToRgba(currentPrimaryColor, 0.05), borderColor: hexToRgba(currentPrimaryColor, 0.2) }}
              onClick={() => window.open(APP_CONFIG.notionUrl, '_blank')}
            >
              <span className="flex items-center gap-3 font-bold" style={{ color: currentDarkColor }}><MapIcon size={18} /> {t('trailGuide')}</span>
              <ChevronRight size={16} style={{ color: currentPrimaryColor }} />
            </button>
          )}
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left" onClick={() => {
              if (APP_CONFIG.aboutUsUrl) window.open(APP_CONFIG.aboutUsUrl, '_blank');
              else alert(t('aboutUsText'));
            }}>
            <span className="flex items-center gap-3 text-gray-700"><Info size={18} /> {t('aboutUs')}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left" onClick={() => window.open(APP_CONFIG.contactLineUrl, '_blank')}>
            <span className="flex items-center gap-3 text-gray-700"><MessageCircle size={18} /> {t('contactSupport')}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
        {favorites.length > 0 && (
          <button onClick={() => { if(confirm(t('confirmClearFav'))) { setFavorites([]); localStorage.removeItem('meishan_favorites'); } }} className="w-full text-center text-rose-500 text-sm py-2 hover:bg-rose-50 rounded-lg transition-colors">
            {t('clearFavorites')}
          </button>
        )}
      </div>
    </div>
  );

  // ==========================================
  // 🎮 遊戲風迎賓畫面 (多步驟探索)
  // ==========================================
  if (!appStarted) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 font-sans flex justify-center overflow-hidden">
        <div className="w-full max-w-md relative shadow-2xl overflow-hidden flex flex-col bg-gray-100">
          
          <img 
            src="/bg.png" 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-br', 'from-[#f2cfc9]', 'via-[#d2cbe3]', 'to-[#b4d8d4]');
            }}
          />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0"></div>

          <div className="relative z-10 flex flex-col w-full h-full">
            
            {landingStep === 'welcome' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="flex flex-col items-center space-y-8 p-8 bg-white/60 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/60 w-full text-center transform transition-all hover:scale-105">
                  <Mascot size={120} animation="bounce" className="drop-shadow-xl" />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-600 tracking-widest uppercase">{APP_CONFIG.subTitle}</p>
                  </div>

                  <button 
                    onClick={() => setLandingStep('select')}
                    className="group relative w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-3 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                       Let's GO 出發! <Play size={18} className="fill-white group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {landingStep === 'select' && (
              <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto">
                <div className="flex justify-between items-center mb-6 mt-4">
                   <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm bg-white/50 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/50">{t('welcomeTitle')}</h2>
                   <button onClick={() => setLandingStep('welcome')} className="bg-white/50 p-2 rounded-full backdrop-blur-sm text-gray-700 hover:bg-white/80 transition-colors">
                     <ChevronLeft size={24} />
                   </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pb-10">
                  {Object.keys(villageData).map((vKey) => {
                    const vData = villageData[vKey];
                    return (
                      <button
                        key={vKey}
                        onClick={() => setPreviewVillage(vKey)}
                        className="flex flex-col items-start p-5 rounded-[24px] text-left bg-white/85 backdrop-blur-md shadow-lg border-2 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                        style={{ borderColor: hexToRgba(vData.color, 0.4) }}
                      >
                        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: vData.color }}></div>
                        
                        <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center shadow-sm relative overflow-hidden" style={{ backgroundColor: vData.color, color: vData.textBadge }}>
                           <img 
                             src={`/${vData.iconFile}`} 
                             alt="icon"
                             className="absolute inset-0 w-full h-full object-cover z-10"
                             onError={(e) => { e.target.style.display = 'none'; }} 
                           />
                           <vData.icon size={20} className="relative z-0" />
                        </div>

                        <h3 className="font-extrabold text-lg mb-1" style={{ color: vData.textDark }}>{vData[language] || vKey}</h3>
                        <p className="text-xs font-bold" style={{ color: hexToRgba(vData.textDark, 0.6) }}>{language === 'en' ? vData.desc_en : vData.desc_zh}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {previewVillage && (
               <div className="absolute inset-0 z-50 flex items-end animate-fade-in">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewVillage(null)}></div>
                  <div 
                    className="relative w-full bg-white rounded-t-[40px] p-8 space-y-6 animate-slide-up shadow-2xl flex flex-col"
                    style={{ borderTop: `8px solid ${villageData[previewVillage].color}` }}
                  >
                     <button onClick={() => setPreviewVillage(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 bg-gray-100 rounded-full transition-colors">
                       <X size={20} />
                     </button>
                     
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md relative overflow-hidden" style={{ backgroundColor: hexToRgba(villageData[previewVillage].color, 0.15), color: villageData[previewVillage].textDark }}>
                           <img 
                             src={`/${villageData[previewVillage].iconFile}`} 
                             alt="icon"
                             className="absolute inset-0 w-full h-full object-cover z-10 p-2"
                             onError={(e) => { e.target.style.display = 'none'; }} 
                           />
                           {React.createElement(villageData[previewVillage].icon, { size: 32, className: "relative z-0" })}
                        </div>
                        <div>
                           <h2 className="text-3xl font-extrabold" style={{ color: villageData[previewVillage].textDark }}>{villageData[previewVillage][language] || previewVillage}</h2>
                           <p className="text-sm font-bold text-gray-400 mt-1">{language === 'en' ? villageData[previewVillage].desc_en : villageData[previewVillage].desc_zh}</p>
                        </div>
                     </div>

                     <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <p className="text-sm leading-loose text-gray-600 font-medium">
                           {villageData[previewVillage].intro}
                        </p>
                     </div>

                     <button 
                        onClick={() => {
                          setSelectedVillage(previewVillage);
                          setAppStarted(true); 
                        }}
                        className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-2 group"
                        style={{ backgroundColor: villageData[previewVillage].color, boxShadow: `0 10px 20px -5px ${hexToRgba(villageData[previewVillage].color, 0.5)}` }}
                     >
                        {t('enterVillage')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 核心主畫面
  // ==========================================
  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-800 font-sans flex justify-center overflow-hidden animate-fade-in relative">
      
      {/* 🌟 定義動態生態背景與 Loading 動畫 */}
      <style>
        {`
          @keyframes slowFloat {
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
            100% { transform: translateY(0) scale(1); }
          }
          @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg) translateX(40px); opacity: 0; }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(-3deg); transform-origin: bottom center; }
            50% { transform: rotate(3deg); transform-origin: bottom center; }
          }
          @keyframes swayReverse {
            0%, 100% { transform: rotate(3deg); transform-origin: bottom center; }
            50% { transform: rotate(-3deg); transform-origin: bottom center; }
          }
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes ride {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(1deg); }
          }
          .animate-fall-1 { animation: fall 8s linear infinite; }
          .animate-fall-2 { animation: fall 11s linear infinite 2s; }
          .animate-fall-3 { animation: fall 9s linear infinite 4s; }
          .animate-sway { animation: sway 6s ease-in-out infinite; }
          .animate-sway-reverse { animation: swayReverse 7s ease-in-out infinite; }
          .animate-loading-bar { animation: loadingBar 1.5s infinite linear; }
          .animate-ride { animation: ride 0.3s ease-in-out infinite; }
        `}
      </style>

      {/* 主畫面容器 */}
      <div className="w-full max-w-md bg-gray-50 min-h-[100dvh] relative shadow-2xl overflow-y-auto pb-32 no-scrollbar">
        
        {/* 🌟 背景圖層 (底層 z-0) */}
        {/* 【修正】加上 left-1/2 -translate-x-1/2 確保固定時永遠與畫面置中對齊 */}
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md z-0 pointer-events-none overflow-hidden">
          <img 
            src={`/${villageData[selectedVillage]?.bgFile}`} 
            alt="Village Background" 
            className="w-full h-full object-cover opacity-80"
            style={{ animation: 'slowFloat 20s ease-in-out infinite' }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>

        {/* 🌟 前景動態植物與落葉層 (z-30，浮在店家卡片上方) */}
        {/* 【修正】加上 left-1/2 -translate-x-1/2 確保固定時永遠與畫面置中對齊 */}
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 pointer-events-none overflow-hidden">
          {(() => {
             const vData = villageData[selectedVillage];
             if (!vData) return null;
             
             const plantPrefix = vData.plantPrefix || 'default';

             return (
               <>
                 {/* 🍃 飄落物區塊 (完全防止當機) */}
                 <FallingItem vData={vData} size={24} left="left-[10%]" animationClass="animate-fall-1" />
                 <FallingItem vData={vData} size={32} left="left-[50%]" animationClass="animate-fall-2" />
                 <FallingItem vData={vData} size={20} left="left-[80%]" animationClass="animate-fall-3" />

                 {/* 🌿 左側第一株植物 (往外移 -60px 消除留白，並稍微放大) */}
                 <div className="absolute bottom-[-10px] left-[-60px] animate-sway">
                    <PlantImage prefix={plantPrefix} side="left" className="h-44 object-contain opacity-90 drop-shadow-lg scale-110 origin-bottom-left" />
                 </div>
                 {/* 🌿 左側第二株植物 (水平翻轉，增加滿版層次感) */}
                 <div className="absolute bottom-[-20px] left-[10px] animate-sway-reverse">
                    <PlantImage prefix={plantPrefix} side="left" className="h-32 object-contain opacity-70 drop-shadow-md" style={{ transform: 'scaleX(-1)' }} />
                 </div>

                 {/* 🌿 右側第一株植物 (往外移 -60px 消除留白，並稍微放大) */}
                 <div className="absolute bottom-[-10px] right-[-60px] animate-sway-reverse">
                    <PlantImage prefix={plantPrefix} side="right" className="h-48 object-contain opacity-90 drop-shadow-lg scale-110 origin-bottom-right" />
                 </div>
                 {/* 🌿 右側第二株植物 (水平翻轉，增加滿版層次感) */}
                 <div className="absolute bottom-[-15px] right-[20px] animate-sway">
                    <PlantImage prefix={plantPrefix} side="right" className="h-36 object-contain opacity-70 drop-shadow-md" style={{ transform: 'scaleX(-1)' }} />
                 </div>
               </>
             );
          })()}
        </div>

        {/* 內容層：所有內容包在 z-10 內，確保浮在背景上 */}
        <div className="relative z-10">
          {selectedShop && <ShopDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} />}
          {showFilterModal && <FilterModal />}
          {showUserModal && <UserModal />}

          {/* Sidebar */}
          {isSidebarOpen && (
            <div className="fixed inset-0 w-full max-w-md mx-auto z-50 flex">
               <div className="w-64 bg-white h-full shadow-2xl p-6 transform transition-transform duration-300 ease-in-out flex flex-col z-20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="text-gray-600" />
                    {t('switchVillage')}
                  </h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.keys(villageData).map((vKey) => {
                    const vData = villageData[vKey];
                    const isSelected = selectedVillage === vKey;
                    return (
                      <button 
                        key={vKey} 
                        onClick={() => { setSelectedVillage(vKey); setSidebarOpen(false); setCurrentView('home'); setSortBy('default'); }} 
                        style={isSelected ? { backgroundColor: hexToRgba(vData.color, 0.2), borderLeftColor: vData.color } : {}}
                        className={`w-full text-left p-4 rounded-xl flex justify-between items-center transition-all border-l-4 ${ isSelected ? 'font-bold' : 'border-transparent hover:bg-gray-50 text-gray-600' }`}
                      >
                        <span style={{ color: isSelected ? vData.textDark : '' }}>{vData?.[language] || vKey}</span>
                        <span className="text-xs font-normal" style={{ color: isSelected ? hexToRgba(vData.textDark, 0.7) : '#9ca3af' }}>
                          {language === 'en' ? vData?.desc_en : vData?.desc_zh}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            </div>
          )}

          {/* Header */}
          <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-white/80 sticky top-0 z-20 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                   if (currentView === 'favorites') {
                       setCurrentView('home');
                   } else {
                       setAppStarted(false);       
                       setLandingStep('select');   
                       setPreviewVillage(null);    
                   }
                }}
                className="w-10 h-10 -ml-3 rounded-full flex items-center justify-center transition-colors hover:bg-white/50 active:bg-gray-200"
                style={{ color: currentPrimaryColor }}
              >
                <ChevronLeft size={28} />
              </button>

              <div 
                onClick={() => setSidebarOpen(true)}
                className="group flex flex-col items-start cursor-pointer"
              >
                <div className="flex items-center gap-1 mb-0.5" style={{ color: currentPrimaryColor }}>
                  <MapPin size={14} />
                  <span className="text-xs font-bold tracking-wide uppercase" style={{ color: currentDarkColor }}>{APP_CONFIG.subTitle}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:bg-white/50 px-2 py-1 -ml-2 rounded-lg transition-colors">
                  <h1 className="text-xl font-extrabold text-gray-900">
                    {currentView === 'favorites' ? t('myFavorites') : (villageData[selectedVillage]?.[language] || selectedVillage)}
                  </h1>
                  <ChevronDown size={20} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleLanguage} 
                className="text-sm font-bold px-2 py-1 rounded-lg border hover:opacity-80 transition-opacity bg-white"
                style={{ color: currentPrimaryColor, borderColor: hexToRgba(currentPrimaryColor, 0.2) }}
              >
                {t('langSwitch')}
              </button>
              <button onClick={() => setShowUserModal(true)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center">
                 {userProfile?.pictureUrl ? (
                   <img src={userProfile.pictureUrl} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   <User size={20} style={{ color: currentPrimaryColor }} />
                 )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          {currentView === 'home' && (
            <>
              <div className="px-6 my-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 border border-transparent focus-within:bg-white focus-within:shadow-lg transition-all" style={{ outlineColor: currentPrimaryColor }}>
                  <Search className="text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 flex-1 text-sm font-medium" 
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 p-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                 const announcements = shops.filter(s => 
                   (s.categories.includes('活動') || s.categories.includes('公告') || s.categories.includes('announcement')) && 
                   s.village === selectedVillage
                 );

                 if (announcements.length === 0) return null; 

                 return (
                    <div className="px-6 mb-6 animate-fade-in">
                      <h3 className="text-sm font-bold mb-3 flex items-center gap-1" style={{ color: currentDarkColor }}>
                        <Sparkles size={16} /> 最新消息 & 活動
                      </h3>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x">
                        {announcements.map(ann => {
                           const link = ann.website || ann.fbLink || ann.line_url || ann.nav_link;
                           return (
                             <div key={ann.id} 
                                  onClick={() => link ? window.open(link, '_blank') : null}
                                  className={`snap-center shrink-0 w-full sm:w-[85%] h-32 rounded-2xl overflow-hidden relative shadow-md border ${link ? 'cursor-pointer group' : ''}`}
                                  style={{ borderColor: hexToRgba(currentPrimaryColor, 0.3), backgroundColor: 'rgba(255,255,255,0.9)' }}>
                                
                                {ann.images && ann.images.length > 0 ? (
                                   <img src={ann.images[0]} alt={ann.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                      <span className="text-gray-400 text-sm">尚無圖片</span>
                                   </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-3 left-4 right-4 text-white">
                                   <h4 className="font-bold text-sm truncate">{ann.name}</h4>
                                   {ann.description && <p className="text-xs text-gray-200 truncate mt-0.5">{ann.description}</p>}
                                </div>
                             </div>
                           );
                        })}
                      </div>
                    </div>
                 );
              })()}

              <div className="px-6 mb-6">
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {availableCategories.map((catKey) => {
                    const config = categoryConfig[catKey] || { labelKey: 'all', icon: <Tag size={18}/> };
                    const isActive = activeCategory === catKey;
                    return (
                      <button 
                        key={catKey} 
                        onClick={() => setActiveCategory(catKey)} 
                        className={`flex flex-col items-center justify-center min-w-[70px] h-16 rounded-2xl transition-all duration-300 border ${ 
                          isActive 
                            ? 'transform scale-105 border-transparent' 
                            : 'bg-white/90 backdrop-blur-sm text-gray-400 border-gray-100 hover:bg-white shadow-sm' 
                        }`}
                        style={isActive ? {
                          backgroundColor: currentPrimaryColor,
                          color: currentBadgeColor,
                          boxShadow: `0 10px 15px -3px ${hexToRgba(currentPrimaryColor, 0.4)}`
                        } : {}}
                      >
                        <div className="mb-1">{config.icon}</div>
                        <span className="text-[10px] font-medium capitalize">{t(config.labelKey) || catKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="px-6 mb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 bg-white/50 px-2 rounded-lg backdrop-blur-sm">
                {currentView === 'favorites' ? t('favoritesList') : t('featured')}
              </h2>
              <div className="flex items-center gap-2">
                {filterOpenOnly && (
                  <span className="text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1 border bg-white/80 backdrop-blur-sm"
                        style={{ color: currentDarkColor, borderColor: hexToRgba(currentPrimaryColor, 0.2) }}>
                    <Clock size={12} /> {t('openNow')}
                  </span>
                )}
                {userLocation && (
                  <span className="text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1 bg-white/80 backdrop-blur-sm"
                        style={{ color: currentDarkColor }}>
                    <LocateFixed size={12} /> {t('distance')}
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm"
                     style={{ color: currentDarkColor }}>
                    <Star size={12} style={{ fill: currentDarkColor }} />
                    <span>{processedShops.length} {t('shopsCount')}</span>
                </div>
              </div>
          </div>

          <div className="px-6 space-y-6">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-16 bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-xl mx-2">
                 {/* 🌟 載入中：使用機車/奔跑的吉祥物 */}
                 <Mascot size={80} imageUrl="/mascot-run.png" animation="run" className="mb-2" />
                 
                 <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mt-2 mb-4 relative">
                    <div className="absolute top-0 left-0 h-full w-1/2 rounded-full animate-loading-bar" style={{ backgroundColor: currentPrimaryColor }}></div>
                 </div>

                 <p className="font-bold tracking-widest" style={{ color: currentDarkColor }}>{t('loading')}</p>
               </div>
            ) : processedShops.length > 0 ? (
              processedShops.map((shop) => {
                const isOpen = checkIsOpen(shop.hours);
                const isFav = favorites.includes(shop.id);
                const displayName = getDynamicText(shop, 'name');
                const displayAddress = getDynamicText(shop, 'address');
                
                const isAccommodation = shop.categories && shop.categories.includes('accommodation');
                const hasHours = !!shop.hours;
                const showAccommodationBadge = isAccommodation && !hasHours;
                const accBadgeText = shop.bookings && shop.bookings.length > 0 ? t('bookNow') : t('byAppointment');
                
                const hideCardHours = !shop.hours || shop.hours.trim().toLowerCase() === 'google' || shop.hours.trim().toLowerCase() === 'fb' || shop.hours.includes('預約制');

                const shopCardColor = villageData[shop.village]?.color || '#059669';
                const shopDarkColor = villageData[shop.village]?.textDark || '#047857';

                return (
                  <div key={shop.id} className="group relative bg-white/95 backdrop-blur-md rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow border border-white">
                    <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                      <ImageCarousel images={shop.images} onClick={() => setSelectedShop(shop)} />
                      
                      <button onClick={(e) => { e.preventDefault(); toggleFavorite(shop.id); }} className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10">
                        <Heart size={18} className={isFav ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
                      </button>
                      
                      <div 
                        className="absolute top-3 left-3 px-2 py-1 rounded-lg z-10 pointer-events-none shadow-sm"
                        style={{ 
                          backgroundColor: shopCardColor, 
                          color: villageData[shop.village]?.textBadge || '#ffffff' 
                        }}
                      >
                          <span className="text-xs font-bold tracking-wide">{villageData[shop.village]?.[language] || shop.village}</span>
                      </div>

                      {showAccommodationBadge || isOpen === 'appointment' ? (
                        <div className="absolute bottom-3 left-3 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none" style={{ backgroundColor: hexToRgba(shopDarkColor, 0.95) }}>
                          <CalendarCheck size={12} className="text-white" />
                          <span className="text-xs font-bold text-white tracking-wide">{showAccommodationBadge ? accBadgeText : t('byAppointment')}</span>
                        </div>
                      ) : isOpen === 'google' ? (
                         <div className="absolute bottom-3 left-3 bg-blue-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                          <Info size={12} className="text-white" />
                          <span className="text-xs font-bold text-white tracking-wide">{t('googleInfo')}</span>
                        </div>
                      ) : isOpen === 'fb' ? (
                        <div className="absolute bottom-3 left-3 bg-indigo-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                         <Facebook size={12} className="text-white" />
                         <span className="text-xs font-bold text-white tracking-wide">{t('fbAnnouncement')}</span>
                        </div>
                      ) : isOpen === true ? (
                        <div className="absolute bottom-3 left-3 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none" style={{ backgroundColor: shopDarkColor }}>
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-white"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          <span className="text-xs font-bold text-white tracking-wide">{t('openNow')}</span>
                        </div>
                      ) : isOpen === 'opening_soon' ? (
                        <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          <span className="text-xs font-bold text-white tracking-wide">{t('openingSoon')}</span>
                        </div>
                      ) : isOpen === 'closing_soon' ? (
                        <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-200 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          <span className="text-xs font-bold text-white tracking-wide">{t('closingSoon')}</span>
                        </div>
                      ) : isOpen === false ? (
                         <div className="absolute bottom-3 left-3 bg-gray-600/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                          <span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                          <span className="text-xs font-bold text-white tracking-wide">{t('closed')}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="p-5 cursor-pointer" onClick={() => setSelectedShop(shop)}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{displayName}</h3>
                        {shop.distance && (
                            <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: hexToRgba(shopCardColor, 0.1), color: villageData[shop.village]?.textDark }}>
                              {shop.distance} km
                            </span>
                         )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                          {shop.rating && (
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                               <Star size={10} className="text-yellow-500 fill-yellow-500" />
                               {shop.rating}
                            </div>
                          )}
                          {!hideCardHours && (
                            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border border-gray-100 bg-gray-50 text-gray-500 max-w-full overflow-hidden">
                              <Clock size={10} className="flex-shrink-0" />
                              <span className="truncate">
                                  {shop.hours.trim().toLowerCase() === 'google' ? t('googleInfo') : 
                                   shop.hours.trim().toLowerCase() === 'fb' ? t('fbAnnouncement') : 
                                   shop.hours.split('|')[0]}
                              </span>
                            </div>
                          )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {shop.services.slice(0, 3).map((service, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                            {service}
                          </span>
                        ))}
                        {shop.services.length > 3 && <span className="text-[10px] text-gray-400 px-1 py-1">+{shop.services.length - 3}</span>}
                      </div>
                      
                      <div className="flex items-center text-xs mb-5" style={{ color: villageData[shop.village]?.textDark || '#4b5563' }}>
                        <MapPin size={12} className="mr-1" style={{ color: shopCardColor }} />
                        <span className="truncate">{displayAddress}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
                        <a href={shop.nav_link || getGoogleMapLink(shop.name, shop.address)} target="_blank" rel="noopener noreferrer" 
                           className="flex-1 min-w-[100px] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-lg hover:opacity-90"
                           style={{ backgroundColor: shopCardColor, boxShadow: `0 4px 14px 0 ${hexToRgba(shopCardColor, 0.4)}` }}>
                          <Navigation size={16} />
                          <span className="text-sm">{t('navigate')}</span>
                        </a>
                        {shop.tel && (
                          <a href={`tel:${shop.tel}`} className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors border hover:opacity-80"
                             style={{ backgroundColor: hexToRgba(shopCardColor, 0.05), borderColor: hexToRgba(shopCardColor, 0.2), color: shopCardColor }}>
                            <Phone size={18} />
                          </a>
                        )}
                        {shop.line_url && (
                          <a href={shop.line_url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm">
                            <span className="font-extrabold text-[10px]">LINE</span>
                          </a>
                        )}
                        {shop.fbLink && (
                          <a href={shop.fbLink} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center transition-colors">
                            <Facebook size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
               <div className="text-center py-10 bg-white/60 backdrop-blur-md rounded-3xl border border-white">
                  {/* 🌟 找不到店家：加入灰階 (grayscale) 與半透明效果 */}
                  <Mascot size={72} animation="bounce" className="mx-auto mb-4 opacity-60 grayscale" />
                  <p className="text-gray-500 font-medium">
                    {currentView === 'favorites' ? '您還沒有收藏任何店家喔！' : '這個村落暫時沒有符合的店家'}
                  </p>
                  <button onClick={() => {setCurrentView('home'); setActiveCategory('all');}} className="text-emerald-600 text-sm mt-2 font-bold hover:underline">
                    {currentView === 'favorites' ? '去探索店家' : '顯示全部'}
                  </button>
               </div>
            )}
          </div>
        </div>

        {/* 底層導航列 */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto">
             <button onClick={() => { setCurrentView('home'); setSortBy('default'); }} className={`flex flex-col items-center gap-1 group transition-colors`} style={{ color: currentView === 'home' ? currentPrimaryColor : '#9ca3af' }}>
                <Home size={24} />
             </button>
             <button onClick={() => setCurrentView('favorites')} className={`flex flex-col items-center gap-1 group transition-colors`} style={{ color: currentView === 'favorites' ? '#f43f5e' : '#9ca3af' }}>
                <Heart size={24} className={currentView === 'favorites' ? "fill-rose-500 text-rose-500" : ""} />
             </button>
             
             <button onClick={handleGetLocation} className="-mt-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-[5px] border-white transform hover:scale-105 transition-transform text-white relative"
                     style={{ backgroundColor: currentPrimaryColor, boxShadow: `0 10px 15px -3px ${hexToRgba(currentPrimaryColor, 0.4)}` }}>
                <LocateFixed size={28} />
                {userLocation && <div className="absolute top-3 right-4 w-2 h-2 bg-green-300 rounded-full animate-ping"></div>}
             </button>
             
             <button onClick={() => setShowFilterModal(true)} className={`flex flex-col items-center gap-1 group transition-colors`} style={{ color: filterOpenOnly ? currentPrimaryColor : '#9ca3af' }}>
                <Filter size={24} />
             </button>
             <button onClick={() => setShowUserModal(true)} className="flex flex-col items-center gap-1 group text-gray-400 hover:text-gray-600 transition-colors" style={{ color: showUserModal ? currentPrimaryColor : '#9ca3af' }}>
                <User size={24} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}