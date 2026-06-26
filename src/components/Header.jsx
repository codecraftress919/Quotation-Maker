import React from 'react';
import headerImg from '../assets/header.png';

const Header = () => {
  return (
    <div className="w-full border-b-2 border-slate-200">
      {/* Two-column header: Logo Left | Contact Info Right */}
      <div className="flex items-stretch justify-between">
        {/* Left: Company Logo Image */}
        <div className="flex items-center py-3 pl-2 pr-6">
          <img
            src={headerImg}
            alt="Abdullah Traders"
            className="h-50 w-auto object-contain"
          />
        </div>

        {/* Right: Contact Details */}
        <div className="flex flex-col justify-center text-right pr-2 py-3 space-y-1.5">
          <div className="flex items-center justify-end gap-2 text-xs text-slate-700">
            <div className="text-right leading-snug">
              <span className="block font-bold">Al-Faiz Electronics,</span>
              <span className="block">Near Railway Station, Main Bazar Kundian,</span>
              <span className="block">Distt Mianwali, Pakistan</span>
            </div>
            <span className="text-slate-400 text-base">📍</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-xs text-slate-700">
            <div className="text-right leading-snug">
              <span className="block">+92 307 5284848 (Whatsapp)</span>
              <span className="block">+92 332 5284848</span>
            </div>
            <span className="text-slate-400 text-base">📞</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-xs text-slate-700">
            <span>qaisershahzad97@gmail.com</span>
            <span className="text-slate-400 text-base">✉️</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Header;
