import React from 'react';
import headerImg from '../assets/header.png';
import header2Img from '../../assets/header2.png';

const Header = () => {
  return (
    <div className="w-full border-b-2 border-slate-200">
      <div className="flex items-stretch justify-start gap-4">

        {/* Left: header.png */}
        <div className="flex items-center py-1 pl-2">
          <img
            src={headerImg}
            alt="Abdullah Traders Solar"
            className="h-32 w-auto object-contain"
          />
        </div>

        {/* Center: header2.png */}
        <div className="flex items-center py-1">
          <img
            src={header2Img}
            alt="Abdullah Traders Logo"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Right: Contact Details */}
        <div className="flex flex-col justify-center text-right pr-2 py-1 space-y-2 ml-auto">
          <div className="flex items-center justify-end gap-2 text-sm text-slate-700">
            <div className="text-right leading-snug">
              <span className="block font-bold">Al-Faiz Electronics,</span>
              <span className="block">Near Railway Station, Main Bazar Kundian,</span>
              <span className="block">Distt Mianwali, Pakistan</span>
            </div>
            <span className="text-slate-400 text-base">📍</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-slate-700">
            <div className="text-right leading-snug">
              <span className="block">+92 307 5284848 (Whatsapp)</span>
              <span className="block">+92 332 5284848</span>
            </div>
            <span className="text-slate-400 text-base">📞</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-slate-700">
            <span>qaisershahzad97@gmail.com</span>
            <span className="text-slate-400 text-base">✉️</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Header;