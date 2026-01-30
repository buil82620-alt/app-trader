import RegulatoryHeader from './RegulatoryHeader';
import RegulatoryImageViewer from './RegulatoryImageViewer';

export default function RegulatoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <RegulatoryHeader />
      <RegulatoryImageViewer />
    </div>
  );
}


