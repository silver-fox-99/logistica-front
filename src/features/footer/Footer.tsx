import { Link } from 'react-router-dom';
import logo from '../header/logo.svg'
import instaLogo from './instagram.svg'
import facebookLogo from './facebook.svg'
import linkedinLogo from './linkedin.svg'
import './footer.scss'

export default function Footer() {
    return <div className="footer">
       <div className="footer__body container">
           <div className="footer__column">
               <img className="footer__logo" src={logo} alt="logo"/>

               <div className="footer__contacts">
                   <Link to="/" >Name Company</Link>
                   <Link to="/" >Address</Link>
                   <Link to="/" >City Company</Link>
               </div>
               
               <div className="footer__socials">
                   <Link to="/"><img src={facebookLogo} alt=""/></Link>
                   <Link to="/"><img src={instaLogo} alt=""/></Link>
                   <Link to="/"><img src={linkedinLogo} alt=""/></Link>
               </div>
           </div>

           <div className="footer__column">
               <h5 className="footer__title">Компания</h5>

               <div className="footer__links">
                   <Link to="/" >О компании</Link>
                   <Link to="/" >Контакты</Link>
                   <Link to="/">Вопросы и ответы</Link>
                   <Link to="/">Поддержка</Link>
               </div>
           </div>

           <div className="footer__column">
               <div className="footer__title">Условия и политика</div>

               <div className="footer__links">
                   <Link to="/">Политика cookie</Link>
                   <Link to="/">Условия использования</Link>
                   <Link to="/">Политика конфиденциальности</Link>
               </div>
           </div>
       </div>

        <div className="footer__bottom container">
            © 2025 NameCompany. All rights reserved. Design by nikitich.
        </div>
    </div>
}