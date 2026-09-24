"use client";

import { LanguageProvider, useLanguage } from "@/components/LanguageContext";
import ScanScreen from "@/components/ScanScreen";
import TracePageShell from "@/components/trace/TracePageShell";

function TraceSearchContent() {
  const { t } = useLanguage();
  return (
    <TracePageShell>
      <div className="trace-page-intro">
        <h1>{t("scan.title")}</h1>
        <p>{t("trace.pageIntro")}</p>
      </div>
      <ScanScreen />
    </TracePageShell>
  );
}

export default function TraceSearchPage() {
  return (
    <LanguageProvider>
      <TraceSearchContent />
    </LanguageProvider>
  );
}
