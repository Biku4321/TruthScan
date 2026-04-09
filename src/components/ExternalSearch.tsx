"use client";
import { ExternalLink, Search } from "lucide-react";

interface ExternalSearchProps {
  imageUrl: string;
}

export default function ExternalSearch({ imageUrl }: ExternalSearchProps) {
  // Encode the URL so it can be passed as a query parameter
  const encodedUrl = encodeURIComponent(imageUrl);

  // Search Engine Patterns
  const engines = [
    {
      name: "Google Lens",
      url: `https://lens.google.com/upload?url=${encodedUrl}`,
      color: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-white"
    },
    {
      name: "TinEye",
      url: `https://www.tineye.com/search?url=${encodedUrl}`,
      color: "bg-gray-200 hover:bg-gray-300",
      textColor: "text-gray-800"
    },
    {
      name: "Bing Visual",
      url: `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIHMP&sbisrc=UrlPaste&q=imgurl:${encodedUrl}`,
      color: "bg-teal-600 hover:bg-teal-700",
      textColor: "text-white"
    },
    {
      name: "Yandex",
      url: `https://yandex.com/images/search?rpt=imageview&url=${encodedUrl}`,
      color: "bg-red-600 hover:bg-red-700",
      textColor: "text-white"
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <h4 className="text-gray-900 font-bold text-sm mb-1 flex items-center gap-2">
        <Search size={16} className="text-blue-600" />
        External Context Check
      </h4>
      <p className="text-gray-500 text-xs mb-4">
        Is this an old photo reused out of context? Check external databases:
      </p>

      <div className="grid grid-cols-2 gap-3">
        {engines.map((engine) => (
          <a
            key={engine.name}
            href={engine.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${engine.color} ${engine.textColor}`}
          >
            {engine.name} <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </div>
  );
}