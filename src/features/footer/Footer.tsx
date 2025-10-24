import { Link } from 'react-router-dom';
import logo from '../header/logo.svg'
import instaLogo from './instagram.svg'
import facebookLogo from './facebook.svg'

import './footer.scss'
import LanguageSwitcher from "@/shared/ui/language-switcher/LanguageSwitcher.tsx";
import {useTranslation} from "react-i18next";

export default function Footer() {

    const {t} = useTranslation()

    return <div className="footer">
       <div className="footer__body container">
           <div className="footer__column">
               <img className="footer__logo" src={logo} alt="logo"/>

               <div className="footer__contacts">
                   <Link to="/" >{t('footer.companyName')}</Link>
                   <Link to="/" >{t('footer.address')}</Link>
                   <Link to="/" >{t('footer.city')}</Link>
               </div>
               
               <div className="footer__socials">
                   <Link to="/"><img src={facebookLogo} alt=""/></Link>
                   <Link to="/"><img src={instaLogo} alt=""/></Link>
                   <Link to="/">
    <svg width="28" height="28" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="240" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M38.4343 116.518C83.2538 97.1046 113.091 84.2047 128.073 77.9463C170.716 60.193 179.68 57.1277 185.442 57C186.723 57 189.54 57.2554 191.461 58.7881C192.998 60.0653 193.382 61.7257 193.638 63.0029C193.894 64.2801 194.15 66.9623 193.894 69.0058C191.589 93.2729 181.601 152.153 176.478 179.23C174.301 190.725 170.076 194.556 165.978 194.939C157.014 195.706 150.227 189.064 141.647 183.444C128.073 174.632 120.518 169.14 107.328 160.454C92.0896 150.492 101.95 145 110.658 136.06C112.963 133.761 152.276 97.9986 153.044 94.8056C153.172 94.4224 153.172 92.8898 152.276 92.1234C151.379 91.3571 150.099 91.6126 149.074 91.868C147.666 92.1234 126.152 106.428 84.2782 134.655C78.1315 138.87 72.6251 140.913 67.631 140.785C62.1246 140.658 51.624 137.72 43.6846 135.166C34.0804 132.1 26.397 130.44 27.0373 125.076C27.4215 122.266 31.2631 119.456 38.4343 116.518Z" fill="#172735"/>
    </svg>
</Link>


               </div>

               <LanguageSwitcher />
           </div>

           <div className="footer__column">
               <h5 className="footer__title">{t('footer.company')}</h5>

               <div className="footer__links">
                   <Link to="/" >{t('footer.aboutCompany')}</Link>
                   <Link to="/" >{t('footer.contacts')}</Link>
                   <Link to="/">{t('footer.askAndAnswer')}</Link>
                   <Link to="/">{t('footer.support')}</Link>
               </div>
           </div>

           <div className="footer__column">
               <div className="footer__title">{t('footer.privacyAndPolicy')}</div>

               <div className="footer__links">
                   <Link to="/">{t('footer.termsCookie')}</Link>
                   <Link to="/">{t('footer.terms')}</Link>
                   <Link to="/">{t('footer.privacy')}</Link>
               </div>
           </div>
       </div>

        <div className="footer__bottom container">
            © 2025 Logistica. All rights reserved. Design by nikitich.
        </div>
    </div>
}