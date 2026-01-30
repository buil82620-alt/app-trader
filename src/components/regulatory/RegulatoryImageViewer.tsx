import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function RegulatoryImageViewer() {
  const imageSrc = '/images/photo.jpg';
  const { t } = useAppTranslation();

  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <PhotoProvider
        maskOpacity={0.9}
        overlayRender={(_, props) => (
          <div
            className="photo-view__overlay"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              ...props,
            }}
          />
        )}
      >
        <PhotoView src={imageSrc}>
          <img
            src={imageSrc}
            alt={t('regulatory.imageAlt')}
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-lg cursor-zoom-in"
          />
        </PhotoView>
      </PhotoProvider>
    </div>
  );
}


