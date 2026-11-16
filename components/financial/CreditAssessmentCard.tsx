'use client'

import { useLanguage } from '@/components/LanguageContext'
import type { CreditAssessment } from '@/lib/loans/loan-repository.ts'

/** Compact score chip for the application queue. */
export function CreditScoreChip({ credit }: { credit: CreditAssessment }) {
  const { t } = useLanguage()
  return (
    <span
      className={`credit-chip credit-${credit.band}`}
      title={`${t('financial.credit.title')}: ${t('financial.credit.band.' + credit.band)}`}
    >
      <strong>{credit.score}</strong>
      <span>{t('financial.credit.band.' + credit.band)}</span>
    </span>
  )
}

/**
 * The advisory Farm2Fork credit assessment: the score, how much history
 * stands behind it, and every factor with the reason for its points.
 */
export default function CreditAssessmentCard({ credit }: { credit: CreditAssessment }) {
  const { t } = useLanguage()
  return (
    <section className="card credit-card" aria-labelledby="credit-title">
      <h2 id="credit-title" className="card-title">{t('financial.credit.title')}</h2>
      <div className="credit-head">
        <div
          className={`credit-dial credit-${credit.band}`}
          role="img"
          aria-label={`${credit.score} ${t('financial.credit.outOf100')}`}
          style={{ ['--credit-score' as string]: credit.score }}
        >
          <span className="credit-dial-value">{credit.score}</span>
          <span className="credit-dial-max">/100</span>
        </div>
        <div className="credit-head-text">
          <span className={`badge credit-badge credit-${credit.band}`}>
            {t('financial.credit.band.' + credit.band)}
          </span>
          <p className="credit-confidence">
            <strong>{t('financial.credit.confidence.' + credit.confidence)}</strong>
            <span className="text-muted"> · {t('financial.credit.confidenceHint.' + credit.confidence)}</span>
          </p>
        </div>
      </div>

      <ul className="credit-factors">
        {credit.factors.map((factor) => (
          <li key={factor.key}>
            <div className="credit-factor-top">
              <span>{t('financial.credit.factor.' + factor.key)}</span>
              <span className="credit-factor-points">
                {factor.points}/{factor.maxPoints}
              </span>
            </div>
            <div className="credit-bar" aria-hidden="true">
              <span style={{ width: `${(factor.points / factor.maxPoints) * 100}%` }} />
            </div>
            <p className="text-muted text-sm" dir="ltr">{factor.summary}</p>
          </li>
        ))}
      </ul>
      <p className="credit-note text-sm">{t('financial.credit.advisory')}</p>
    </section>
  )
}
