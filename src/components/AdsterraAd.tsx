import React from 'react';

interface AdsterraAdProps {
  slotId: string;
  width?: number;
  height?: number;
  type: 'sidebar' | 'banner' | 'inline';
}

export const AdsterraAd: React.FC<AdsterraAdProps> = ({ slotId, width = 300, height = 250, type }) => {
  if (!slotId || slotId.includes('ad-') || slotId === 'sidebar-ad' || slotId === 'bottom-banner') {
    return (
      <div className={getStyles(type)} style={{ width, height }}>
        <span className="opacity-50">Adsterra Ad Space ({type})</span>
      </div>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${slotId}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="//www.highperformanceformat.com/${slotId}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={getStyles(type)} style={{ width, height, overflow: 'hidden' }}>
      <iframe
        srcDoc={htmlContent}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{ border: 'none', overflow: 'hidden', width: width, height: height }}
      />
    </div>
  );
};

const getStyles = (type: string) => {
  switch (type) {
    case 'sidebar':
      return 'w-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-xs';
    case 'banner':
      return 'flex items-center justify-center text-gray-500 text-xs overflow-hidden';
    case 'inline':
      return 'w-full max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-xs my-6';
    default:
      return '';
  }
};
