import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Member } from '../../types';
import { PEMUDA_BEJI_LOGO, DEFAULT_AVATAR } from '../../assets/logo';
import { formatDateIndo } from '../../utils/formatters';
import { Printer, Download, ShieldCheck } from 'lucide-react';

interface MemberIdCardProps {
  member: Member;
  onVerifyClick?: () => void;
}

export const MemberIdCard: React.FC<MemberIdCardProps> = ({ member, onVerifyClick }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [qrUrl, setQrUrl] = useState<string>('');

  const verificationUrl = `${window.location.origin}/?tab=verify&id=${encodeURIComponent(
    member.nomor_anggota || member.id
  )}`;

  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        verificationUrl,
        {
          width: 80,
          margin: 1,
          color: {
            dark: '#082B66',
            light: '#FFFFFF',
          },
        },
        error => {
          if (error) console.error('Error generating QR Code', error);
        }
      );
    }

    QRCode.toDataURL(verificationUrl, { width: 120, margin: 1 }, (err, url) => {
      if (!err && url) setQrUrl(url);
    });
  }, [verificationUrl, member]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Render simple snapshot via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Navy background
    ctx.fillStyle = '#082B66';
    ctx.fillRect(0, 0, 700, 440);

    // Decorative wave/bands
    ctx.fillStyle = '#061B3A';
    ctx.fillRect(0, 380, 700, 60);

    ctx.fillStyle = '#123C82';
    ctx.fillRect(0, 0, 700, 8);

    // Header text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('PEMUDA BEJI', 110, 52);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px sans-serif';
    ctx.fillText('KARTU ANGGOTA RESMI', 110, 74);

    // Separator line
    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 95);
    ctx.lineTo(670, 95);
    ctx.stroke();

    // Member Info
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('NAMA LENGKAP', 200, 140);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(member.nama, 200, 168);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('NOMOR ANGGOTA', 200, 210);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(member.nomor_anggota, 200, 236);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('STATUS ANGGOTA', 200, 278);
    ctx.fillStyle = member.status === 'AKTIF' ? '#34D399' : '#F87171';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(member.status === 'AKTIF' ? 'ANGGOTA AKTIF' : 'NONAKTIF', 200, 302);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('TANGGAL BERGABUNG', 200, 340);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px sans-serif';
    ctx.fillText(formatDateIndo(member.tanggal_gabung), 200, 362);

    // Draw QR Code from url
    if (qrUrl) {
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(520, 130, 130, 130);
        ctx.drawImage(qrImg, 525, 135, 120, 120);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN VERIFIKASI', 585, 275);
        ctx.textAlign = 'left';

        // Trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `Kartu-Anggota-${member.nomor_anggota}.png`;
        a.click();
      };
      qrImg.src = qrUrl;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Physical-style ID Card Display */}
      <div
        ref={cardElementRef}
        id="printable-card"
        className="w-full max-w-[440px] aspect-[1.586/1] bg-[#082B66] text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-[#123C82] flex flex-col justify-between"
      >
        {/* Subtle Watermark Shield / Geometry */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-8 top-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header of Card */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={PEMUDA_BEJI_LOGO}
              alt="Logo Pemuda Beji"
              className="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow-xs"
            />
            <div>
              <div className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">
                PEMUDA BEJI
              </div>
              <div className="text-[10px] sm:text-[11px] text-white/70 font-medium tracking-wide">
                KARTU ANGGOTA RESMI
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-sm bg-emerald-500/20 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            <span>TERVERIFIKASI</span>
          </div>
        </div>

        {/* Middle Card Content */}
        <div className="flex items-center justify-between gap-3 my-auto py-2">
          {/* Photo & Main Details */}
          <div className="flex items-center gap-3.5">
            <img
              src={member.foto || DEFAULT_AVATAR}
              alt={member.nama}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/40 shadow-sm shrink-0 bg-slate-800"
            />

            <div className="flex flex-col">
              <span className="text-[10px] text-white/60 uppercase font-semibold">Nama Anggota</span>
              <span className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">
                {member.nama}
              </span>

              <span className="text-[10px] text-white/60 uppercase font-semibold mt-1.5">No. Anggota</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                {member.nomor_anggota}
              </span>

              <span className="text-[10px] text-white/60 uppercase font-semibold mt-1.5">Status</span>
              <span
                className={`text-[11px] font-bold ${
                  member.status === 'AKTIF' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {member.status === 'AKTIF' ? 'ANGGOTA AKTIF' : 'NONAKTIF'}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center bg-white p-2 rounded-xl shadow-xs shrink-0">
            <canvas ref={qrCanvasRef} className="w-16 h-16 sm:w-20 sm:h-20" />
            <span className="text-[9px] font-semibold text-[#082B66] mt-1 tracking-tight">
              SCAN VERIFIKASI
            </span>
          </div>
        </div>

        {/* Bottom Footer of Card */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60 font-medium">
          <span>Bergabung: {formatDateIndo(member.tanggal_gabung)}</span>
          <span className="font-mono">beji-tabungan.org</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Cetak Kartu</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download Kartu</span>
        </button>

        {onVerifyClick && (
          <button
            onClick={onVerifyClick}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span>Uji Halaman Verifikasi</span>
          </button>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 max-w-sm">
        QR Code berisi tautan aman untuk memverifikasi keaslian keanggotaan Pemuda Beji secara publik tanpa mengekspos data pribadi.
      </div>
    </div>
  );
};
