import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Navigation, Facebook, Star, Home, Coffee, Gift, User, Filter, Heart, Menu, X, Mountain, Loader2, Camera, Ticket, Tag, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react';

// 【網站設定區】
const APP_CONFIG = {
  appName: "Meishan Taiping For Fun",      // 網站名稱
  subTitle: "Meishan, Chiayi", // 副標題
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYV7_LgqByXVlVddhypjxItSz4tGX7-hfi77RTurkCI1l6ZdqKJNubbMXUByo-fYBuxvt948fGpZu_/pub?output=csv" 
};

const App = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('太平村');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 設定網頁標題
  useEffect(() => {
    document.title = APP_CONFIG.appName;
  }, []);

  // 時間更新
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 村落資料
  const villages = [
    { name: '太平村', desc: '雲梯與老街' },
    { name: '太興村', desc: '萬鷺朝鳳' },
    { name: '碧湖村', desc: '觀光茶園' }, 
    { name: '瑞里村', desc: '紫色山城' },
    { name: '瑞峰村', desc: '日出與步道' },
    { name: '太和村', desc: '茶園秘境' },
  ];

  // 分類設定檔
  const categoryConfig = {
    'all': { label: '全部', icon: <Search size={18}/> },
    'accommodation': { label: '民宿', icon: <Home size={18}/> },
    'food': { label: '美食', icon: <Coffee size={18}/> },
    'gift': { label: '伴手禮', icon: <Gift size={18}/> },
    'attraction': { label: '景點', icon: <Camera size={18}/> },
    'experience': { label: '體驗', icon: <Ticket size={18}/> },
  };

  // 檢查營業狀態
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

          if (currentTimeVal >= startVal && currentTimeVal < endVal) {
            return true;
          }
        } catch (e) {
          console.error("時間格式解析錯誤", e);
        }
      }
    }
    return false;
  };

  // 範例資料 (當試算表讀取失敗時顯示)
  const demoData = [
    {
      id: 1,
      name: "讀取中或格式錯誤",
      village: "太平村",
      category: "food",
      address: "請檢查試算表格式",
      services: [],
      rating: 0,
      reviews: 0,
      images: ["https://images.unsplash.com/photo-1595856426463-2287f3b8f645?ixlib=rb-4.0.3"],
      tel: "",
      fbLink: "#",
      hours: "" 
    }
  ];

  // 【升級版】CSV 解析器：更強大的容錯能力
  const parseCSV = (text) => {
    // 1. 去除 BOM (Byte Order Mark) 避免第一欄讀取錯誤
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split('\n').filter(l => l.trim());
    
    // 2. 標題標準化：轉小寫、去空白
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = [];
      let inQuote = false;
      let currentVal = '';
      
      for (let char of line) {
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const entry = {};
      headers.forEach((h, i) => {
        let val = values[i] ? values[i].replace(/^"|"$/g, '') : '';
        // 欄位內容處理
        if (h === 'services' || h === '服務標籤') {
          entry[h] = val ? val.split(/,|，/).map(s => s.trim()) : [];
        } else if (h === 'image' || h === 'images' || h === '圖片網址') {
          entry['images'] = val ? val.split(/,|，/).map(s => s.trim()) : [];
        } else {
          entry[h] = val;
        }
      });
      
      // 3. 容錯處理：支援中文標題或英文標題
      return {
        id: index,
        name: entry.name || entry['店家名稱'] || '未命名店家',
        village: entry.village || entry['村落名稱'] || entry['村落'] || '太平村',
        category: entry.category || entry['分類'] || 'food',
        address: entry.address || entry['地址'] || '',
        services: entry.services || entry['服務標籤'] || [],
        rating: 4.5, // 預設評分
        reviews: 100,
        images: entry.images && entry.images.length > 0 ? entry.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3'],
        tel: entry.tel || entry['電話'] || '', 
        fbLink: entry.fblink || entry['粉專連結'] || '',
        hours: entry.hours || entry['營業時間'] || '', 
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
          console.error("讀取試算表失敗", err);
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

  const filteredShops = shops.filter(shop => {
    const villageMatch = shop.village === selectedVillage;
    const categoryMatch = activeCategory === 'all' || shop.category === activeCategory;
    return villageMatch && categoryMatch;
  });

  const availableCategories = getDynamicCategories();

  const ImageCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (images.length <= 1) {
       return (
         <img 
            src={images[0]} 
            alt="shop" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1000&q=80";
            }}
          />
       );
    }

    const nextSlide = (e) => {
      e.preventDefault();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = (e) => {
      e.preventDefault();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="relative w-full h-full group">
        <img 
          src={images[currentIndex]} 
          alt={`slide-${currentIndex}`} 
          className="w-full h-full object-cover transition-all duration-500"
        />
        
        <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft size={20} />
        </button>
        <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-white font-medium">
          {currentIndex + 1} / {images.length}
        </div>
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

  return (
    <div className="min-h-[100dvh] bg-gray-100 text-gray-800 font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white min-h-[100dvh] relative shadow-2xl overflow-y-auto pb-24 no-scrollbar">
        
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="absolute inset-0 z-50 flex">
             <div className="w-64 bg-white h-full shadow-2xl p-6 transform transition-transform duration-300 ease-in-out flex flex-col z-20">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Mountain className="text-orange-500" />
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
                    }}
                    className={`w-full text-left p-4 rounded-xl flex justify-between items-center transition-all ${
                      selectedVillage === v.name 
                        ? 'bg-orange-50 border-l-4 border-orange-500 text-orange-700 font-bold' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-xs text-gray-400 font-normal">{v.desc}</span>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">探索梅山每一處美好</p>
              </div>
            </div>

            <div 
              className="flex-1 bg-black/20 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            ></div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-white/90 sticky top-0 z-20 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Menu size={20} className="text-gray-700" />
            </button>
            <div>
              <div className="flex items-center gap-1 text-orange-600 mb-0.5">
                <MapPin size={14} />
                <span className="text-xs font-bold tracking-wide uppercase">{APP_CONFIG.subTitle}</span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                {selectedVillage} 
                <span className="text-gray-300 text-sm font-normal">/ 探索</span>
              </h1>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
             <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="User" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 my-4">
          <div className="bg-gray-100 rounded-2xl p-3 flex items-center gap-3 border border-transparent focus-within:border-orange-200 focus-within:bg-white focus-within:shadow-lg transition-all">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={`搜尋${selectedVillage}的美食、民宿...`}
              className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 flex-1 text-sm font-medium"
            />
          </div>
        </div>

        {/* Categories */}
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
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 transform scale-105' 
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

        {/* Stats */}
        <div className="px-6 mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">精選推薦</h2>
            <div className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                <Star size={12} className="fill-orange-500" />
                <span>{filteredShops.length} 間好評店家</span>
            </div>
        </div>

        {/* Shops List */}
        <div className="px-6 space-y-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <Loader2 size={32} className="animate-spin mb-2 text-orange-500" />
               <p>正在載入店家資料...</p>
             </div>
          ) : filteredShops.length > 0 ? (
            filteredShops.map((shop) => {
              const isOpen = checkIsOpen(shop.hours);
              
              return (
                <div key={shop.id} className="group relative bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow border border-gray-100">
                  {/* Image Area */}
                  <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                    <ImageCarousel images={shop.images} />
                    
                    <a 
                      href={getGoogleMapLink(shop.name, shop.address)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm hover:bg-white hover:scale-105 transition-all cursor-pointer z-10"
                    >
                      <Star size={12} className="text-orange-400 fill-orange-400" />
                      <span className="text-xs font-bold text-gray-800">{shop.rating}</span>
                    </a>
                    
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg z-10">
                        <span className="text-xs text-white font-medium tracking-wide">{shop.village}</span>
                    </div>

                    {/* Status Badges */}
                    {isOpen === 'google' ? (
                       <div className="absolute bottom-3 left-3 bg-blue-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 animate-fade-in">
                        <Info size={12} className="text-white" />
                        <span className="text-xs font-bold text-white tracking-wide">Google 資訊</span>
                      </div>
                    ) : isOpen === 'fb' ? (
                      <div className="absolute bottom-3 left-3 bg-indigo-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 animate-fade-in">
                       <Facebook size={12} className="text-white" />
                       <span className="text-xs font-bold text-white tracking-wide">粉專公告</span>
                     </div>
                   ) : isOpen === true ? (
                      <div className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10 animate-fade-in">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                        </span>
                        <span className="text-xs font-bold text-white tracking-wide">營業中</span>
                      </div>
                    ) : isOpen === false ? (
                       <div className="absolute bottom-3 left-3 bg-gray-600/90 backdrop-blur-md pl-2 pr-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                        <span className="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                        <span className="text-xs font-bold text-white tracking-wide">休息中</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Content Area */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">{shop.name}</h3>
                    </div>
                    
                    {/* Hours Text */}
                    {shop.hours && (
                      <div className={`flex items-center gap-1.5 text-xs mb-3 px-2 py-1.5 rounded-lg w-fit ${getHoursStyle(shop.hours)}`}>
                        <Clock size={12} className={
                          shop.hours.toLowerCase() === 'google' ? "text-blue-500" : 
                          shop.hours.toLowerCase() === 'fb' ? "text-indigo-500" :
                          "text-gray-400"
                        } />
                        {shop.hours.toLowerCase() === 'google' ? (
                           <span>請查看 Google 地圖公告</span>
                        ) : shop.hours.toLowerCase() === 'fb' ? (
                           <span>請查看粉絲專頁公告</span>
                        ) : (
                           <span>{shop.hours}</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {shop.services.map((service, idx) => (
                        <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-xs mb-5">
                      <MapPin size={12} className="mr-1 text-orange-500" />
                      <span className="truncate">{shop.address}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
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
                          className="w-11 h-11 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center transition-colors border border-orange-100"
                        >
                          <Phone size={18} />
                        </a>
                      )}

                      {shop.fbLink && (
                        <a 
                        href={shop.fbLink}
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
                <p>這個村落暫時沒有符合的店家</p>
                <button onClick={() => setActiveCategory('all')} className="text-orange-500 text-sm mt-2 font-medium">顯示全部</button>
             </div>
          )}
          
          <div className="h-12"></div>
        </div>

        {/* Floating Nav */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto">
             <button className="flex flex-col items-center gap-1 group">
                <Home size={20} className="text-orange-500" />
             </button>
             
             <button className="flex flex-col items-center gap-1 group">
                <Heart size={20} className="text-gray-400 group-hover:text-gray-600" />
             </button>

             <button className="-mt-10 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 border-[5px] border-white transform hover:scale-105 transition-transform text-white">
                <MapPin size={24} className="fill-white/20" />
             </button>

             <button className="flex flex-col items-center gap-1 group">
                <Filter size={20} className="text-gray-400 group-hover:text-gray-600" />
             </button>

             <button className="flex flex-col items-center gap-1 group">
                <User size={20} className="text-gray-400 group-hover:text-gray-600" />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
