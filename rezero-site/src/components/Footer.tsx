import { useTranslation } from 'react-i18next'
import './Footer.css'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__logo">
          <span className="footer__logo-re">Re:</span>
          <span className="footer__logo-title">{t('footer.logoTitle')}</span>
        </div>

        <p className="footer__desc">
          {t('footer.author')}<br />
          {t('footer.publisher')}
        </p>

        <nav className="footer__nav">
          <a href="#top" className="footer__nav-link">{t('footer.top')}</a>
          <a href="#story" className="footer__nav-link">{t('footer.story')}</a>
          <a href="#characters" className="footer__nav-link">{t('footer.characters')}</a>
          <a href="#episodes" className="footer__nav-link">{t('footer.episodes')}</a>
          <a href="#world" className="footer__nav-link">{t('footer.world')}</a>
        </nav>

        <div className="footer__divider" />

        <p className="footer__quote">{t('footer.quote')}</p>

        <p className="footer__copy">{t('footer.copy')}</p>
      </div>
    </footer>
  )
}
