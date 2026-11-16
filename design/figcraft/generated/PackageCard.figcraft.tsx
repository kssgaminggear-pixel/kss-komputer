// Package Card as React + Tailwind CSS v4. Theme: variable.export {format: "tailwind"}.
export function PackageCard() {
  return (
    <div className="relative w-full min-h-[440px] flex flex-col gap-3 p-5 items-start rounded-[6px] bg-[#FFFFFF] border border-[#E4E4E7]">
      <p className="w-full max-w-[380px] text-[#C2410C] font-['Inter'] text-[10px] font-bold tracking-[1px]">AMD RYZEN  ┬╖  1080P  ┬╖  GARANSI 2 TAHUN</p>
      <p className="w-full max-w-[380px] text-[#18181B] font-['Inter'] text-[24px] font-bold leading-[1.2]">KSS E-Sports Champion 1080p</p>
      <p className="w-full max-w-[380px] text-[#71717A] font-['Inter'] text-[12px] font-normal leading-[1.5]">Pilihan utama untuk Valorant, CS2, dan Dota 2. Performa 1080p tinggi dengan Ryzen 5 5600 dan RX 6600 8GB.</p>
      <div className="w-full max-w-[380px] min-h-[22px] flex flex-row gap-[6px] items-start">
        <div className="flex flex-row py-1 px-[7px] justify-center items-center rounded-[2px] bg-[#F4F4F5] border border-[#E4E4E7]">
          <p className="text-[#52525B] font-['Inter'] text-[9px] font-bold">AM4</p>
        </div>
        <div className="flex flex-row py-1 px-[7px] justify-center items-center rounded-[2px] bg-[#F4F4F5] border border-[#E4E4E7]">
          <p className="text-[#52525B] font-['Inter'] text-[9px] font-bold">DDR4</p>
        </div>
        <div className="flex flex-row py-1 px-[7px] justify-center items-center rounded-[2px] bg-[#FFF7ED] border border-[#FED7AA]">
          <p className="text-[#C2410C] font-['Inter'] text-[9px] font-bold">350W</p>
        </div>
      </div>
      <div className="w-full max-w-[380px] min-h-[94px] flex flex-col gap-[6px] py-[10px] px-3 items-start rounded-[4px] bg-[#FAFAFA] border border-[#F4F4F5]">
        <p className="w-full max-w-[356px] text-[#3F3F46] font-['Inter'] text-[10px] font-bold">VALORANT                                      ~280 FPS</p>
        <div className="w-full max-w-[356px] min-h-[5px] flex flex-row items-start bg-[#E4E4E7]">
          <div className="w-full max-w-[312px] h-[5px] bg-[#F97316]"></div>
        </div>
        <p className="w-full max-w-[356px] text-[#3F3F46] font-['Inter'] text-[10px] font-bold">COUNTER-STRIKE 2                          ~165 FPS</p>
        <div className="w-full max-w-[356px] min-h-[5px] flex flex-row items-start bg-[#E4E4E7]">
          <div className="w-full max-w-[220px] h-[5px] bg-[#F97316]"></div>
        </div>
      </div>
      <div className="w-full max-w-[380px] h-[1px] bg-[#E4E4E7]"></div>
      <div className="w-full max-w-[380px] min-h-[44px] flex flex-row justify-between items-center">
        <p className="text-[#18181B] font-['Inter'] text-[24px] font-bold">Rp 9.440.000</p>
        <p className="text-[#047857] font-['Inter'] text-[9px] font-bold">TERMASUK RAKIT</p>
      </div>
      <div className="w-full max-w-[380px] min-h-[40px] flex flex-row justify-center items-center rounded-[4px] bg-[#EA580C]">
        <p className="text-[#FFFFFF] font-['Inter'] text-[11px] font-bold">KUSTOMISASI PAKET</p>
      </div>
    </div>
  );
}
