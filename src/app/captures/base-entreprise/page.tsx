import { CaptureCompanyView } from "@/components/marketing/capture-company-view";
import { CaptureFrame } from "@/components/marketing/capture-frame";

export default function CaptureCompanyPage() {
  return (
    <CaptureFrame section="Base entreprise" variant="app">
      <CaptureCompanyView />
    </CaptureFrame>
  );
}
