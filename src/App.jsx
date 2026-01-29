import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Navigation, Facebook, Star, Home, Coffee, Gift, User, Filter, Heart, Menu, X, Mountain, Loader2, Camera, Ticket, Tag, Clock, ChevronLeft, ChevronRight, Info, LocateFixed, Globe, Share2, MessageCircle, Map } from 'lucide-react';

// 【網站設定區】(由此處控制全站文字)
const APP_CONFIG = {
  appName: "梅山好好玩",
  subTitle: "Meishan, Chiayi",
  // 請將您的 Google 試算表 CSV 連結貼在下方
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYV7_LgqByXVlVddhypjxItSz4tGX7-hfi77RTurkCI1l6ZdqKJNubbMXUByo-fYBuxvt948fGpZu_/pub?output=csv",
  
  // LINE LIFF ID
  liffId: "",

  // 【關於我們 設定】
  aboutUsText: "歡迎您來到梅山！\n我們致力於推廣梅山在地觀光，\n讓您輕鬆找到最棒的民宿與美食。",
  aboutUsUrl: "https://www.facebook.com/TaipingSuspensionBridge?locale=zh_TW", 

  // 【新增】您的 Notion 步道攻略連結 (請貼在這裡)
  notionUrl: "https://www.notion.so/2a11f9fee71981239a89ebdbb2f25441?source=copy_link", 
};

const App = () => {
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
  
  // 新增狀態
  const [selectedShop, setSelectedShop] = useState(null); 
  const [showFilterModal, setShowFilterModal] = useState(false); 
  const [showUserModal, setShowUserModal] = useState(false); 
  
  // 篩選條件
  const [filterOpenOnly, setFilterOpenOnly] = useState(false); 

  // 設定網頁標題
  useEffect(() => {
    document.title = APP_CONFIG.appName;
    const savedFavs = localStorage.getItem('meishan_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    if (APP_CONFIG.liffId) {
      import('https://static.line-scdn.net/liff/edge/2/sdk.js').then(() => {
        if (window.liff) {
          window.liff.init({ liffId: APP_CONFIG.liffId })
            .then(() => {
              if (window.liff.isLoggedIn()) {
                window.liff.getProfile().then(profile => setUserProfile(profile));
              }
            })
            .catch((err) => console.error('LIFF Init failed', err));
        }
      });
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
    { name: '碧湖村', desc: '觀光茶園' }, 
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
    const cleanHours = hoursString.trim();
    const lowerHours = cleanHours.toLowerCase();
    if (lowerHours === 'google') return 'google';
    if (lowerHours === 'fb' || cleanHours === '粉絲專頁') return 'fb';
    if (cleanHours === '營業中') return true;
    if (cleanHours === '休息中') return false;
    if (!/\d{1,2}:\d{2}/.test(cleanHours)) return null; 

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;
    const ranges = cleanHours.split(/,|，/); 

    for (let range of ranges) {
      const times = range.trim().split('-');
      if (times.length === 2) {
        try {
          const [startStr, endStr] = times;
          const [startH, startM] = startStr.split(':').map(Number);
          const [endH, endM] = endStr.split(':').map(Number);
          const startVal = startH * 60 + startM;
          const endVal = endH * 60 + endM;
          if (currentTimeVal >= startVal && currentTimeVal < endVal) return true;
        } catch (e) { console.error(e); }
      }
    }
    return false;
  };

  const demoData = [
    {
      id: 1,
      name: "讀取中...",
      village: "太平村",
      category: "food",
      address: "載入資料中",
      lat: null, lng: null,
      services: [],
      rating: 0,
      reviews: 0,
      images: ["https://images.unsplash.com/photo-1595856426463-2287f3b8f645?ixlib=rb-4.0.3"],
      tel: "", fbLink: "#", hours: "", description: ""
    }
  ];

  const parseCSV = (text) => {
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = [];
      let inQuote = false;
      let currentVal = '';
      for (let char of line) {
        if (char === '"') inQuote = !inQuote;
        else if (char === ',' && !inQuote) {
          values.push(currentVal.trim());
          currentVal = '';
        } else currentVal += char;
      }
      values.push(currentVal.trim());

      const entry = {};
      headers.forEach((h, i) => {
        let val = values[i] ? values[i].replace(/^"|"$/g, '') : '';
        if (h === 'services' || h === '服務標籤') entry[h] = val ? val.split(/,|，/).map(s => s.trim()) : [];
        else if (h === 'image' || h === 'images' || h === '圖片網址') entry['images'] = val ? val.split(/,|，/).map(s => s.trim()) : [];
        else entry[h] = val;
      });
      
      return {
        id: index,
        name: entry.name || entry['店家名稱'] || '未命名店家',
        village: entry.village || entry['村落名稱'] || entry['村落'] || '太平村',
        category: entry.category || entry['分類'] || 'food',
        address: entry.address || entry['地址'] || '',
        lat: parseFloat(entry.lat || entry['緯度']) || null,
        lng: parseFloat(entry.lng || entry['經度']) || null,
        services: entry.services || entry['服務標籤'] || [],
        rating: 4.5,
        reviews: 100,
        images: entry.images && entry.images.length > 0 ? entry.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3'],
        tel: entry.tel || entry['電話'] || '', 
        fbLink: entry.fblink || entry['粉專連結'] || '',
        hours: entry.hours || entry['營業時間'] || '', 
        description: entry.description || entry['介紹'] || entry['店家介紹'] || '暫無詳細介紹，歡迎親自蒞臨體驗！',
      };
    });
  };

  useEffect(() => {
    if (APP_CONFIG.googleSheetUrl) {
      setLoading(true);
      fetch(APP_CONFIG.googleSheetUrl)
        .then(res => res.text())
        .then(text => {
          const parsedData = parseCSV(text);
          setShops(parsedData);
          setLoading(false);
        })
        .catch(err => {
          console.error("讀取失敗", err);
          setShops(demoData);
          setLoading(false);
        });
    } else {
      setShops(demoData);
      setLoading(false);
    }
  }, []);

  const getGoogleMapLink = (name, address) => {
    const query = encodeURIComponent(`${address} ${name}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getDynamicCategories = () => {
    const existingCategories = new Set(shops.map(s => s.category));
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

  // 【核心篩選邏輯】
  const getProcessedShops = () => {
    let result = shops;

    // 1. 基本篩選
    if (currentView === 'favorites') {
      result = result.filter(shop => favorites.includes(shop.id));
    } else {
      result = result.filter(shop => {
        const villageMatch = shop.village === selectedVillage;
        const categoryMatch = activeCategory === 'all' || shop.category === activeCategory;
        return villageMatch && categoryMatch;
      });
    }

    // 2. 漏斗篩選
    if (filterOpenOnly) {
      result = result.filter(shop => checkIsOpen(shop.hours) === true);
    }

    // 4. 計算距離
    if (userLocation) {
      result = result.map(shop => ({
        ...shop,
        distance: calculateDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
      }));
    }

    // 5. 排序
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
    if (images.length <= 1) {
       return (
         <img 
            src={images[0]} 
            alt="shop" 
            onClick={onClick}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1000&q=80"; }}
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

  // 店家詳情 Modal
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
            <img src={shop.images[0]} alt={shop.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <h3 className="text-2xl font-bold mb-1">{shop.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{shop.rating} ({shop.reviews} 評論)</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
               <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                 isOpen === true ? 'bg-green-100 text-green-700' : 
                 isOpen === false ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'
               }`}>
                 <Clock size={14} />
                 {isOpen === true ? '營業中' : isOpen === false ? '休息中' : '詳見公告'}
               </div>
               {shop.hours && <span className="text-xs text-gray-500">{shop.hours}</span>}
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1">
                <Info size={14} /> 店家介紹
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                {shop.description}
              </p>
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

            <div className="flex gap-3 pt-2">
              <a href={getGoogleMapLink(shop.name, shop.address)} target="_blank" rel="noopener noreferrer" 
                 className="flex-1 bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-200">
                <Navigation size={18} /> 導航
              </a>
              {shop.tel && (
                <a href={`tel:${shop.tel}`} className="w-12 h-12 flex items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Phone size={20} />
                </a>
              )}
              {shop.fbLink && (
                <a href={shop.fbLink} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                  <Facebook size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 篩選 Modal
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

  // 使用者 Modal
  const UserModal = () => (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUserModal(false)}></div>
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-emerald-100 shadow-lg mb-4 bg-emerald-50 flex items-center justify-center">
            {userProfile?.pictureUrl ? (
              <img 
                src={userProfile.pictureUrl} 
                alt="User" 
                className="w-full h-full object-cover"
              />
            ) : (
              // Q版山脈預設圖示
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
          {/* Notion 步道攻略按鈕 (如有設定網址才顯示) */}
          {APP_CONFIG.notionUrl && (
            <button 
              className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-left border border-emerald-100" 
              onClick={() => window.open(APP_CONFIG.notionUrl, '_blank')}
            >
              <span className="flex items-center gap-3 text-emerald-800 font-bold"><Map size={18} /> 周邊步道攻略</span>
              <ChevronRight size={16} className="text-emerald-400" />
            </button>
          )}

          {/* 關於我們 按鈕 */}
          <button 
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left" 
            onClick={() => {
              if (APP_CONFIG.aboutUsUrl) {
                window.open(APP_CONFIG.aboutUsUrl, '_blank');
              } else {
                alert(APP_CONFIG.aboutUsText);
              }
            }}
          >
            <span className="flex items-center gap-3 text-gray-700"><Info size={18} /> 關於我們</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left" onClick={() => window.open('https://line.me/', '_blank')}>
            <span className="flex items-center gap-3 text-gray-700"><MessageCircle size={18} /> 聯絡客服</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>

        {favorites.length > 0 && (
          <button 
            onClick={() => {
              if(confirm('確定要清空所有收藏嗎？')) {
                setFavorites([]);
                localStorage.removeItem('meishan_favorites');
              }
            }}
            className="w-full text-center text-rose-500 text-sm py-2 hover:bg-rose-50 rounded-lg transition-colors"
          >
            清空收藏紀錄
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-800 font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white min-h-[100dvh] relative shadow-2xl overflow-y-auto pb-32 no-scrollbar">
        
        {/* Modals */}
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
                  <button
                    key={v.name}
                    onClick={() => {
                      setSelectedVillage(v.name);
                      setSidebarOpen(false);
                      setCurrentView('home'); 
                      setSortBy('default');
                    }}
                    className={`w-full text-left p-4 rounded-xl flex justify-between items-center transition-all ${
                      selectedVillage === v.name 
                        ? 'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700 font-bold' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
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
          
          <button 
            onClick={() => setShowUserModal(true)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-emerald-50 flex items-center justify-center"
          >
             {userProfile?.pictureUrl ? (
               <img 
                 src={userProfile.pictureUrl} 
                 alt="User" 
                 className="w-full h-full object-cover"
               />
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
                <input 
                  type="text" 
                  placeholder={`搜尋${selectedVillage}的美食、民宿...`}
                  className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 flex-1 text-sm font-medium"
                />
              </div>
            </div>

            <div className="px-6 mb-6">
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {availableCategories.map((catKey) => {
                  const config = categoryConfig[catKey] || { label: catKey, icon: <Tag size={18}/> };
                  return (
                    <button
                      key={catKey}
                      onClick={() => setActiveCategory(catKey)}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-16 rounded-2xl transition-all duration-300 border ${
                        activeCategory === catKey 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-105' 
                          : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50 shadow-sm'
                      }`}
                    >
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
                    
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavorite(shop.id); }}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"
                    >
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
                          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${getHoursStyle(shop.hours).replace('text', 'border-transparent text')}`}>
                            <Clock size={10} />
                            {shop.hours.toLowerCase() === 'google' ? 'Google 公告' : shop.hours.toLowerCase() === 'fb' ? '粉專公告' : shop.hours}
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

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <a 
                        href={getGoogleMapLink(shop.name, shop.address)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-gray-200"
                      >
                        <Navigation size={16} />
                        <span className="text-sm">導航</span>
                      </a>
                      
                      {shop.tel && (
                        <a 
                          href={`tel:${shop.tel}`}
                          className="w-11 h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center transition-colors border border-emerald-100"
                        >
                          <Phone size={18} />
                        </a>
                      )}

                      {shop.fbLink && (
                        <a 
                        href={shop.fbLink}
                        target="_blank" rel="noopener noreferrer"
                        className="w-11 h-11 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center transition-colors border border-blue-100"
                      >
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
                  {currentView === 'favorites' 
                    ? '您還沒有收藏任何店家喔！' 
                    : '這個村落暫時沒有符合的店家'}
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

             {/* 漏斗 (Filter) */}
             <button onClick={() => setShowFilterModal(true)} className={`flex flex-col items-center gap-1 group transition-colors ${filterOpenOnly ? 'text-emerald-600' : 'text-gray-400'}`}>
                <Filter size={24} />
             </button>

             {/* 人像 (User) */}
             <button onClick={() => setShowUserModal(true)} className="flex flex-col items-center gap-1 group text-gray-400 hover:text-gray-600">
                <User size={24} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
