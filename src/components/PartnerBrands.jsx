import React from 'react';

// Brand partner images from root /assets/ folder
import footer1 from '../assets/footer1.png';
import footer2 from '../assets/footer2.png';
import footer3 from '../assets/footer3.png';
import footer4 from '../assets/footer4.png';
import footer5 from '../assets/footer5.png';

const brands = [
  { name: 'JinKO Solar',  src: footer5 },
  { name: 'Fronus',       src: footer2 },
  { name: 'Jesko',        src: footer3 },
  { name: 'SolaX Power',  src: footer4 },
  { name: 'Partner',      src: footer1 },
];

const PartnerBrands = () => {
  return (
    <div className="partner-brands-section w-full mt-4 mb-2 border border-slate-300 rounded-lg overflow-hidden bg-white">
      {/* Title Bar */}
      <div
        className="flex items-center gap-3 px-5 py-2"
        style={{ backgroundColor: '#0F4C81' }}
      >
        <div className="flex-1 h-px bg-white/30" />
        <span className="text-white text-xs font-bold tracking-widest uppercase whitespace-nowrap">
          OUR PREMIUM PARTNERS
        </span>
        <div className="flex-1 h-px bg-white/30" />
      </div>

      {/* Logos Row */}
      <div className="flex flex-wrap justify-center items-center gap-6 px-5 py-4">
        {brands.map((brand) => (
          <div key={brand.name} className="flex justify-center items-center">
            <img
              src={brand.src}
              alt={brand.name}
              className="max-h-12 max-w-[100px] object-contain"
              onError={(e) => {
                e.currentTarget.parentElement.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerBrands;