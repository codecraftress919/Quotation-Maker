import React from 'react';

const Footer = () => {
  return (
    <div
      className="w-full mt-4"
      style={{ backgroundColor: '#0F4C81' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
        {/* Phone */}
        <div className="flex items-center gap-2 text-white text-xs font-medium">
          <span style={{ fontSize: '14px' }}>📞</span>
          <span>+92 307 5284848 | +92 332 5284848</span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-white text-xs font-medium">
          <span style={{ fontSize: '14px' }}>✉️</span>
          <span>qaisershahzad97@gmail.com</span>
        </div>

        {/* Website */}
        
      </div>
    </div>
  );
};

export default Footer;
