import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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
          <Link to="/" className="footer__nav-link">{t('footer.top')}</Link>
          <Link to="/" className="footer__nav-link">{t('footer.story')}</Link>
          <Link to="/characters" className="footer__nav-link">{t('footer.characters')}</Link>
          <Link to="/episodes" className="footer__nav-link">{t('footer.episodes')}</Link>
          <Link to="/world" className="footer__nav-link">{t('footer.world')}</Link>
        </nav>

        <div className="footer__divider" />

        <p className="footer__quote">{t('footer.quote')}</p>

        <p className="footer__copy">{t('footer.copy')}</p>
      </div>
    </footer>
  )
}
