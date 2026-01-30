import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function AboutUs() {
  const { t } = useAppTranslation();

  return (
    <div className="bg-gray-900 px-4 py-8">
      {/* Title */}
      <h2 className="text-white text-2xl font-bold mb-6">
        {t('home.aboutTitle')}
      </h2>

      {/* First Paragraph */}
      <p className="text-white text-sm leading-relaxed mb-6">
        {t('home.aboutParagraph1')}
      </p>

      {/* Illustration */}
      <div className="my-8">
        <div className="overflow-hidden rounded-2xl">
          <img
            src="/images/about-us.jpg"
            alt="About us illustration"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Second Paragraph */}
      <p className="text-white text-sm leading-relaxed mt-6">
        {t('home.aboutParagraph2')}
      </p>
    </div>
  );
}
