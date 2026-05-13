import React from 'react';

const HikeCard = ({
  id,
  status = 'COMPLETED',
  name,
  location,
  difficulty = 'Very Hard',
  permitRequired = true,
  guideNeeded = true,
  distance,
  elevGain,
  peak,
  gpxUrl,
  meetingPointUrl,
  videoUrl
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(29,138,171,0.14)] hover:-translate-y-1 hover:border-[#1d8aab]/20 transition-all duration-250 flex flex-col font-inter">
      {/* Header */}
      <div className="p-[1.3rem_1.3rem_0.9rem]">
        <div className="flex justify-between items-center mb-1">
          <div className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-[#1d8aab]">
            {id}
          </div>
          <div className="font-mono text-[0.55rem] tracking-[0.1em] uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {status}
          </div>
        </div>
        <h3 className="text-[1.15rem] font-bold leading-[1.2] mb-1 font-['Intro_Rust',sans-serif]">{name}</h3>
        <div className="text-gray-500 text-[0.88rem] flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {location}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center gap-1 px-[0.65rem] py-[0.3rem] rounded-full font-mono text-[0.58rem] font-medium tracking-[0.1em] uppercase bg-[#ede9fe] text-[#7c3aed]">
            {difficulty}
          </span>
          {permitRequired && (
            <span className="inline-flex items-center gap-1 px-[0.6rem] py-[0.28rem] rounded-full font-mono text-[0.55rem] tracking-[0.1em] uppercase bg-[#fef9c3] text-[#854d0e] border border-[#fde68a]">
              Permit Required
            </span>
          )}
          {guideNeeded && (
            <span className="inline-flex items-center gap-1 px-[0.6rem] py-[0.28rem] rounded-full font-mono text-[0.55rem] tracking-[0.1em] uppercase bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
              Guide Needed
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex border-y border-gray-200 bg-[#fafaf8]">
        <div className="flex-1 p-[0.75rem_0.6rem] text-center border-r border-gray-200">
          <svg className="mx-auto mb-1 text-[#1d8aab]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
          <span className="block font-mono text-[0.82rem] font-medium text-gray-900 leading-none mb-1">{distance} km</span>
          <span className="block font-mono text-[0.52rem] tracking-[0.1em] uppercase text-gray-500">Distance</span>
        </div>
        <div className="flex-1 p-[0.75rem_0.6rem] text-center border-r border-gray-200">
          <svg className="mx-auto mb-1 text-[#1d8aab]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          <span className="block font-mono text-[0.82rem] font-medium text-gray-900 leading-none mb-1">{elevGain} m</span>
          <span className="block font-mono text-[0.52rem] tracking-[0.1em] uppercase text-gray-500">Elev. Gain</span>
        </div>
        <div className="flex-1 p-[0.75rem_0.6rem] text-center">
          <svg className="mx-auto mb-1 text-[#1d8aab]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>
          <span className="block font-mono text-[0.82rem] font-medium text-gray-900 leading-none mb-1">{peak} m</span>
          <span className="block font-mono text-[0.52rem] tracking-[0.1em] uppercase text-gray-500">Peak</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 p-[0.9rem_1.3rem_1.2rem] mt-auto">
        {gpxUrl && (
          <a href={gpxUrl} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[0.75rem] font-semibold bg-[#1d8aab] text-white border-2 border-[#1d8aab] hover:bg-[#145f76] hover:border-[#145f76] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            GPX
          </a>
        )}
        {meetingPointUrl && (
          <a href={meetingPointUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[0.75rem] font-semibold bg-transparent text-gray-600 border-2 border-gray-200 hover:border-[#1d8aab] hover:text-[#1d8aab] hover:bg-[#e8f6fa] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Meet
          </a>
        )}
        {videoUrl && (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[0.75rem] font-semibold bg-transparent text-[#e1306c] border-2 border-[#e1306c] hover:bg-[#fff0f5] hover:border-[#c13584] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7a5 5 0 0 0-5-5H6a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h12a5 5 0 0 0 5-5V7z"></path><rect x="9.5" y="8" width="6" height="8" rx="1"></rect></svg>
            Video
          </a>
        )}
      </div>
    </div>
  );
};

export default HikeCard;
