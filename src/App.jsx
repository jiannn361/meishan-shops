import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Navigation, Facebook, Star, Home, Coffee, Gift, User, Filter, Heart, Menu, X, Mountain, Loader2, Camera, Ticket, Tag, Clock, ChevronLeft, ChevronRight, Info, LocateFixed, Globe, Share2, MessageCircle, Map, ExternalLink, CalendarCheck } from 'lucide-react';

// 【安全修正】讀取環境變數
// ⚠️ 重要：請在您的電腦上，將下面這行開頭的 "//" 拿掉，以啟用環境變數讀取功能
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || "";

// 目前為了讓預覽視窗不報錯，先暫時設為空字串 (請在本地端啟用上面那行)
const AIRTABLE_API_KEY = ""; 

// 【網站設定區】
const APP_CONFIG = {
  appName: "Meishan Taiping",
  subTitle: "Meishan, Chiayi",
  
  // 【Airtable 設定區】
  airtableApiKey: AIRTABLE_API_KEY, 
  
  // 請確認這裡有換成您自己的 Base ID (app 開頭那串)
  airtableBaseId: "appkU3kxP74Gq7iXj", 
  airtableTableName: "Table 1", 
  
  // LINE LIFF ID (選填)
  liffId: "2009010332-K14upnUb",

  // 關於我們
  aboutUsText: "歡迎您來到梅山！\n我們致力於推廣梅山在地觀光，\n讓您輕鬆找到最棒的民宿與美食。",
  aboutUsUrl: "https://www.facebook.com/TaipingSuspensionBridge?locale=zh_TW", 

  // Notion 攻略連結 (選填)
  notionUrl: "https://www.notion.so/2a11f9fee71981239a89ebdbb2f25441?source=copy_link", 
};

// 【自定義元件】LINE 圖示
const LineIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 5.58 2 10c0 2.42 1.35 4.58 3.55 5.96-.16.56-.57 1.54-.66 1.83-.09.28-.04.54.26.54.16 0 .36-.04 1.53-.82 2.27-1.5 2.76-1.7 3.32-1.75.66.07 1.33.1 2 .1 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-4.7 10.3c-.22 0-.4-.18-.4-.4V8.3c0-.22.18-.4.4-.4s.4.18.4.4v3.2h2.5c.22 0 .4.18.4.4s-.18.4-.4.4H7.3zm2.8-3.6c0-.22.18-.4.4-.4s.4.18.4.4v3.2c0 .22-.18.4-.4.4s-.4-.18-.4-.4V8.7zm2.4 3.6c-.22 0-.4-.18-.4-.4V8.3c0-.22.18-.4.4-.4s.4.18.4.4v2.7l2-2.9c.07-.12.18-.18.28-.19h.03c.22 0 .4.18.4.4v3.2c0 .22-.18.4-.4.4s-.4-.18-.4-.4V8.9l-2 2.9c-.08.1-.2.17-.3.17h-.01zm5.2 0c-.22 0-.4-.18-.4-.4V8.3c0-.22.18-.4.4-.4h2.5c.22 0 .4.18.4.4s-.18.4-.4.4h-2.1v1h2.1c.22 0 .4.18.4.4s-.18.4-.4.4h-2.1v1h2.1c.22 0 .4.18.4.4s-.18.4-.4.4h-2.5z" />
  </svg>
);

// 【文字美化元件】
const FormattedText = ({ text, className = "" }) => {
  if (!text) return null;
  const strText = Array.isArray(text) ? text.join('\n') : String(text);
  const lines = strText.split(/\||\n|\\n/);
  
  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
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
    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center relative overflow-hidden">
       {/* 模擬圖片中的綠色山形 */}
       <Mountain size={48} className="text-emerald-600 relative z-10" strokeWidth={2} />
    </div>
  </div>
);

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
  
  const [selectedShop, setSelectedShop] = useState(null); 
  const [showFilterModal, setShowFilterModal] = useState(false); 
  const [showUserModal, setShowUserModal] = useState(false); 
  const [filterOpenOnly, setFilterOpenOnly] = useState(false); 

  useEffect(() => {
    document.title = APP_CONFIG.appName;
    const savedFavs = localStorage.getItem('meishan_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    if (APP_CONFIG.liffId) {
      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      script.onload = () => {
        if (window.liff) {
          window.liff.init({ liffId: APP_CONFIG.liffId }).then(() => {
            if (window.liff.isLoggedIn()) {
              window.liff.getProfile().then(profile => setUserProfile(profile));
            }
          }).catch((err) => console.error('LIFF Init failed', err));
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
      alert("您的瀏覽器不支援地理位置功能");
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
        console.error("Error", error);
        alert("無法取得您的位置");
        setLoading(false);
      }
    );
  };

  const villages = [
    { name: '太平村', desc: '雲梯與老街' },
    { name: '太興村', desc: '萬鷺朝鳳' },
    { name: '碧湖/龍眼村', desc: '觀光茶園' }, 
    { name: '瑞里村', desc: '紫色山城' },
    { name: '瑞峰村', desc: '日出與步道' },
    { name: '太和村', desc: '茶園秘境' },
  ];

  const categoryConfig = {
    'all': { label: '全部', icon: <Search size={18}/> },
    'accommodation': { label: '民宿', icon: <Home size={18}/> },
    'food': { label: '美食', icon: <Coffee size={18}/> },
    'gift': { label: '伴手禮', icon: <Gift size={18}/> },
    'attraction': { label: '景點', icon: <Camera size={18}/> },
    'experience': { label: '體驗', icon: <Ticket size={18}/> },
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
        if (new RegExp(`(週|星期)${todayChar}`).test(segment)) { applies = true; priority = 2; }
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
              if (currentTimeVal >= startVal && currentTimeVal < endVal) return true;
           } catch (e) {}
        }
      }
    }
    return false;
  };

  const demoData = [
    {
      id: 1,
      name: "讀取中...",
      village: "太平村",
      categories: ["food"], 
      address: "載入資料中",
      lat: null, lng: null,
      services: [],
      rating: 0,
      reviews: 0,
      images: [],
      tel: "", fbLink: "#", hours: "", description: ""
    }
  ];

  // 轉換 Airtable 欄位 -> App 資料格式
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
        { key: '訂房連結', label: '線上訂房' },
        { key: 'booking_url', label: '訂房' }
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
      village: f['village'] || f['Village'] || f['村落名稱'] || f['村落'] || '太平村',
      categories: categories,
      category: categories[0] || 'food',
      address: f['address'] || f['Address'] || f['地址'] || '',
      lat: parseFloat(f['lat'] || f['Lat'] || f['緯度']) || null,
      lng: parseFloat(f['lng'] || f['Lng'] || f['經度']) || null,
      services: services,
      rating: parseFloat(f['rating'] || f['Rating'] || f['星等'] || 4.5),
      reviews: parseInt(f['reviews'] || f['Reviews'] || f['評論數'] || 0),
      images: images,
      tel: f['tel'] || f['Tel'] || f['Phone'] || f['電話'] || '',
      // 【修正】加入 f['fblink'] 支援全小寫欄位
      fbLink: f['fbLink'] || f['fb link'] || f['fblink'] || f['FB Link'] || f['粉專連結'] || '',
      line_url: f['line_url'] || f['line'] || f['Line'] || f['line link'] || f['官方帳號'] || '',
      google_url: f['google_url'] || f['google_link'] || f['地圖連結'] || f['評論連結'] || '',
      bookings: shopBookings,
      hours: f['hours'] || f['Hours'] || f['營業時間'] || '',
      description: f['description'] || f['Description'] || f['介紹'] || f['店家介紹'] || '暫無詳細介紹，歡迎親自蒞臨體驗！',
    };
  };

  useEffect(() => {
    const fetchAirtableData = async () => {
      // 檢查 API Key
      if (!APP_CONFIG.airtableApiKey) {
        console.error("Airtable API Key 遺失！請在 App.jsx 的 AIRTABLE_API_KEY 變數中填入 Key");
        setShops(demoData);
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
            headers: {
              Authorization: `Bearer ${APP_CONFIG.airtableApiKey}`
            }
          });

          if (!response.ok) {
            throw new Error(`Airtable API Error: ${response.statusText}`);
          }

          const data = await response.json();
          allRecords = [...allRecords, ...data.records];

          if (data.offset) {
            offset = data.offset;
          } else {
            break;
          }
        }

        const processedData = allRecords.map(processAirtableRecord);
        setShops(processedData);
      } catch (error) {
        console.error("Airtable 讀取失敗:", error);
        setShops(demoData);
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
        s.categories.forEach(c => existingCategories.add(c));
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
    let result = shops;
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
      result = result.filter(shop => checkIsOpen(shop.hours) === true);
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
       return (
         <div onClick={onClick} className="w-full h-full cursor-pointer">
            <DefaultShopImage />
         </div>
       );
    }

    if (images.length === 1) {
        return (
            <img 
               src={images[0]} 
               alt="shop" 
               onClick={onClick}
               className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer"
               onError={() => setImgError(true)}
             />
        );
    }

    const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length); };
    const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); };

    return (
      <div className="relative w-full h-full group cursor-pointer" onClick={onClick}>
        <img 
          src={images[currentIndex]} 
          alt={`slide-${currentIndex}`} 
          className="w-full h-full object-cover transition-all duration-500"
          onError={() => setImgError(true)}
        />
        <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
        <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-white font-medium">{currentIndex + 1} / {images.length}</div>
      </div>
    );
  };

  const getHoursStyle = (hours) => {
    if (!hours) return 'bg-gray-50 text-gray-500';
    const h = hours.toLowerCase();
    if (h === 'google') return 'bg-blue-50 text-blue-600';
    if (h === 'fb') return 'bg-indigo-50 text-indigo-600';
    return 'bg-gray-50 text-gray-500';
  };

  const ShopDetailModal = ({ shop, onClose }) => {
    if (!shop) return null;
    const isOpen = checkIsOpen(shop.hours);

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors">
            <X size={20} />
          </button>

          <div className="h-64 relative">
            {shop.images && shop.images.length > 0 ? (
                <img src={shop.images[0]} alt={shop.name} className="w-full h-full object-cover" 
                     onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
            ) : (
                <DefaultShopImage />
            )}
            <div className="hidden w-full h-full absolute inset-0">
                <DefaultShopImage />
            </div>

            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <h3 className="text-2xl font-bold mb-1">{shop.name}</h3>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                   <Star size={16} className="fill-yellow-400" />
                   <span className="font-bold text-lg">{shop.rating}</span>
                </div>
                <a 
                  href={shop.google_url || getGoogleMapLink(shop.name, shop.address)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-white underline decoration-white/50 underline-offset-4 flex items-center gap-1 transition-colors"
                >
                  查看 Google 評論 <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3 items-start">
               <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold self-start ${
                 isOpen === true ? 'bg-green-100 text-green-700' : 
                 isOpen === false ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'
               }`}>
                 <Clock size={14} />
                 {isOpen === true ? '營業中' : isOpen === false ? '休息中' : '詳見公告'}
               </div>
               {shop.hours && (
                 <div className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    <FormattedText text={shop.hours} />
                 </div>
               )}
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1">
                <Info size={14} /> 店家介紹
              </h4>
              <div className="text-sm text-gray-600 text-justify">
                <FormattedText text={shop.description} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>{shop.address}</span>
              </div>
              {shop.tel && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={18} className="text-emerald-600 shrink-0" />
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

            <div className="flex gap-3 pt-2 flex-wrap">
              <a href={getGoogleMapLink(shop.name, shop.address)} target="_blank" rel="noopener noreferrer" 
                 className="flex-1 min-w-[100px] bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-200">
                <Navigation size={18} /> 導航
              </a>
              {shop.tel && (
                <a href={`tel:${shop.tel}`} className="w-12 h-12 flex items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0">
                  <Phone size={20} />
                </a>
              )}
              {shop.fbLink && (
                <a href={shop.fbLink} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0">
                  <Facebook size={20} />
                </a>
              )}
              {/* LINE 按鈕 (使用純文字) */}
              {shop.line_url && (
                <a href={shop.line_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-colors flex-shrink-0">
                  <span className="font-extrabold text-xs">LINE</span>
                </a>
              )}
              
              {/* 多個訂房平台連結 */}
              {shop.bookings && shop.bookings.length > 0 && (
                shop.bookings.map((booking, idx) => (
                  <a 
                    key={idx}
                    href={booking.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 min-w-[120px] px-3 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
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
          <h3 className="text-lg font-bold text-gray-800">快速篩選</h3>
          <button onClick={() => setShowFilterModal(false)}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <span className="font-medium text-gray-700">只顯示營業中</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${filterOpenOnly ? 'bg-emerald-500' : 'bg-gray-300'}`}
                 onClick={(e) => { e.preventDefault(); setFilterOpenOnly(!filterOpenOnly); }}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${filterOpenOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
        <button onClick={() => setShowFilterModal(false)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">
          確認
        </button>
      </div>
    </div>
  );

  const UserModal = () => (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUserModal(false)}></div>
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-emerald-100 shadow-lg mb-4 bg-emerald-50 flex items-center justify-center">
            {userProfile?.pictureUrl ? (
              <img src={userProfile.pictureUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="relative w-full h-full bg-emerald-100 flex items-center justify-center">
                 <Mountain size={40} className="text-emerald-600 relative z-10" strokeWidth={1.5} />
                 <div className="absolute bottom-0 w-full h-1/3 bg-emerald-200/50"></div>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {userProfile?.displayName || "訪客"}
          </h3>
          <p className="text-sm text-gray-500">歡迎來到梅山</p>
        </div>
        <div className="space-y-2">
          {APP_CONFIG.notionUrl && (
            <button className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-left border border-emerald-100" onClick={() => window.open(APP_CONFIG.notionUrl, '_blank')}>
              <span className="flex items-center gap-3 text-emerald-800 font-bold"><Map size={18} /> 周邊步道攻略</span>
              <ChevronRight size={16} className="text-emerald-400" />
            </button>
          )}
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left" onClick={() => {
              if (APP_CONFIG.aboutUsUrl) window.open(APP_CONFIG.aboutUsUrl, '_blank');
              else alert(APP_CONFIG.aboutUsText);
            }}>
            <span className="flex items-center gap-3 text-gray-700"><Info size={18} /> 關於我們</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left" onClick={() => window.open('https://line.me/', '_blank')}>
            <span className="flex items-center gap-3 text-gray-700"><MessageCircle size={18} /> 聯絡客服</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
        {favorites.length > 0 && (
          <button onClick={() => { if(confirm('確定要清空所有收藏嗎？')) { setFavorites([]); localStorage.removeItem('meishan_favorites'); } }} className="w-full text-center text-rose-500 text-sm py-2 hover:bg-rose-50 rounded-lg transition-colors">
            清空收藏紀錄
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-800 font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white min-h-[100dvh] relative shadow-2xl overflow-y-auto pb-32 no-scrollbar">
        {selectedShop && <ShopDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} />}
        {showFilterModal && <FilterModal />}
        {showUserModal && <UserModal />}

        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="absolute inset-0 z-50 flex">
             <div className="w-64 bg-white h-full shadow-2xl p-6 transform transition-transform duration-300 ease-in-out flex flex-col z-20">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Mountain className="text-emerald-600" />
                  切換村落
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                {villages.map((v) => (
                  <button key={v.name} onClick={() => { setSelectedVillage(v.name); setSidebarOpen(false); setCurrentView('home'); setSortBy('default'); }} className={`w-full text-left p-4 rounded-xl flex justify-between items-center transition-all ${ selectedVillage === v.name ? 'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700 font-bold' : 'hover:bg-gray-50 text-gray-600' }`}>
                    <span>{v.name}</span>
                    <span className="text-xs text-gray-400 font-normal">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-white/90 sticky top-0 z-20 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
              <Menu size={20} className="text-gray-700" />
            </button>
            <div>
              <div className="flex items-center gap-1 text-emerald-700 mb-0.5">
                <MapPin size={14} />
                <span className="text-xs font-bold tracking-wide uppercase">{APP_CONFIG.subTitle}</span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                {currentView === 'favorites' ? '我的收藏' : selectedVillage}
                <span className="text-gray-300 text-sm font-normal">/ {currentView === 'favorites' ? '口袋名單' : '探索'}</span>
              </h1>
            </div>
          </div>
          <button onClick={() => setShowUserModal(true)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-emerald-50 flex items-center justify-center">
             {userProfile?.pictureUrl ? (
               <img src={userProfile.pictureUrl} alt="User" className="w-full h-full object-cover" />
             ) : (
               <Mountain size={20} className="text-emerald-600" />
             )}
          </button>
        </div>

        {/* Main Content */}
        {currentView === 'home' && (
          <>
            <div className="px-6 my-4">
              <div className="bg-gray-100 rounded-2xl p-3 flex items-center gap-3 border border-transparent focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-lg transition-all">
                <Search className="text-gray-400" size={20} />
                <input type="text" placeholder={`搜尋${selectedVillage}的美食、民宿...`} className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 flex-1 text-sm font-medium" />
              </div>
            </div>
            <div className="px-6 mb-6">
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {availableCategories.map((catKey) => {
                  const config = categoryConfig[catKey] || { label: catKey, icon: <Tag size={18}/> };
                  return (
                    <button key={catKey} onClick={() => setActiveCategory(catKey)} className={`flex flex-col items-center justify-center min-w-[70px] h-16 rounded-2xl transition-all duration-300 border ${ activeCategory === catKey ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-105' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50 shadow-sm' }`}>
                      <div className="mb-1">{config.icon}</div>
                      <span className="text-[10px] font-medium capitalize">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="px-6 mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              {currentView === 'favorites' ? '收藏清單' : '精選推薦'}
            </h2>
            <div className="flex items-center gap-2">
              {filterOpenOnly && (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1 border border-green-100">
                  <Clock size={12} /> 營業中
                </span>
              )}
              {userLocation && (
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <LocateFixed size={12} /> 距離
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <Star size={12} className="fill-emerald-600" />
                  <span>{processedShops.length} 間</span>
              </div>
            </div>
        </div>

        <div className="px-6 space-y-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <Loader2 size={32} className="animate-spin mb-2 text-emerald-600" />
               <p>正在載入店家資料...</p>
             </div>
          ) : processedShops.length > 0 ? (
            processedShops.map((shop) => {
              const isOpen = checkIsOpen(shop.hours);
              const isFav = favorites.includes(shop.id);
              
              return (
                <div key={shop.id} className="group relative bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow border border-gray-100">
                  <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                    <ImageCarousel images={shop.images} onClick={() => setSelectedShop(shop)} />
                    
                    <button onClick={(e) => { e.preventDefault(); toggleFavorite(shop.id); }} className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10">
                      <Heart size={18} className={isFav ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
                    </button>
                    
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg z-10 pointer-events-none">
                        <span className="text-xs text-white font-medium tracking-wide">{shop.village}</span>
                    </div>

                    {isOpen === 'google' ? (
                       <div className="absolute bottom-3 left-3 bg-blue-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                        <Info size={12} className="text-white" />
                        <span className="text-xs font-bold text-white tracking-wide">Google 資訊</span>
                      </div>
                    ) : isOpen === 'fb' ? (
                      <div className="absolute bottom-3 left-3 bg-indigo-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                       <Facebook size={12} className="text-white" />
                       <span className="text-xs font-bold text-white tracking-wide">粉專公告</span>
                      </div>
                    ) : isOpen === true ? (
                      <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                        </span>
                        <span className="text-xs font-bold text-white tracking-wide">營業中</span>
                      </div>
                    ) : isOpen === false ? (
                       <div className="absolute bottom-3 left-3 bg-gray-600/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
                        <span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                        <span className="text-xs font-bold text-white tracking-wide">休息中</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-5 cursor-pointer" onClick={() => setSelectedShop(shop)}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">{shop.name}</h3>
                      {shop.distance && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            {shop.distance} km
                          </span>
                       )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                           <Star size={10} className="text-yellow-500 fill-yellow-500" />
                           {shop.rating}
                        </div>
                        {shop.hours && (
                          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border max-w-full overflow-hidden ${getHoursStyle(shop.hours).replace('text', 'border-transparent text')}`}>
                            <Clock size={10} className="flex-shrink-0" />
                            <span className="truncate">
                                {shop.hours.toLowerCase() === 'google' ? 'Google 公告' : shop.hours.toLowerCase() === 'fb' ? '粉專公告' : shop.hours.split('|')[0]}
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
                    
                    <div className="flex items-center text-gray-500 text-xs mb-5">
                      <MapPin size={12} className="mr-1 text-emerald-600" />
                      <span className="truncate">{shop.address}</span>
                    </div>

                    {/* 【更新】列表卡片下方的按鈕列，加入 LINE 與 FB */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <a href={getGoogleMapLink(shop.name, shop.address)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-gray-200">
                        <Navigation size={16} />
                        <span className="text-sm">導航</span>
                      </a>
                      {shop.tel && (
                        <a href={`tel:${shop.tel}`} className="w-11 h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center transition-colors border border-emerald-100">
                          <Phone size={18} />
                        </a>
                      )}
                      {shop.line_url && (
                        <a href={shop.line_url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors border border-green-600 shadow-sm">
                          <span className="font-extrabold text-[10px]">LINE</span>
                        </a>
                      )}
                      {shop.fbLink && (
                        <a href={shop.fbLink} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center transition-colors border border-blue-100">
                          <Facebook size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="text-center py-10 text-gray-400">
                <Coffee size={48} className="mx-auto mb-3 opacity-20" />
                <p>
                  {currentView === 'favorites' ? '您還沒有收藏任何店家喔！' : '這個村落暫時沒有符合的店家'}
                </p>
                <button onClick={() => {setCurrentView('home'); setActiveCategory('all');}} className="text-emerald-600 text-sm mt-2 font-medium">
                  {currentView === 'favorites' ? '去探索店家' : '顯示全部'}
                </button>
             </div>
          )}
        </div>

        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto">
             <button onClick={() => { setCurrentView('home'); setSortBy('default'); }} className={`flex flex-col items-center gap-1 group transition-colors ${currentView === 'home' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <Home size={24} />
             </button>
             <button onClick={() => setCurrentView('favorites')} className={`flex flex-col items-center gap-1 group transition-colors ${currentView === 'favorites' ? 'text-rose-500' : 'text-gray-400'}`}>
                <Heart size={24} className={currentView === 'favorites' ? "fill-rose-500" : ""} />
             </button>
             <button onClick={handleGetLocation} className="-mt-10 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 border-[5px] border-white transform hover:scale-105 transition-transform text-white relative">
                {loading && !userLocation ? (<Loader2 size={24} className="animate-spin" />) : (<LocateFixed size={28} />)}
                {userLocation && <div className="absolute top-3 right-4 w-2 h-2 bg-green-300 rounded-full animate-ping"></div>}
             </button>
             <button onClick={() => setShowFilterModal(true)} className={`flex flex-col items-center gap-1 group transition-colors ${filterOpenOnly ? 'text-emerald-600' : 'text-gray-400'}`}>
                <Filter size={24} />
             </button>
             <button onClick={() => setShowUserModal(true)} className="flex flex-col items-center gap-1 group text-gray-400 hover:text-gray-600">
                <User size={24} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}