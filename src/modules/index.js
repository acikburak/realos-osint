// Her modül: { name, run(email) => { status: 'found'|'not_found'|'info'|'unknown'|'error', data? } }
// Faz 1 — yerel / açık API
import pattern from './pattern.js';
import mx from './mx.js';
import gravatar from './gravatar.js';
import github from './github.js';
import proton from './proton.js';
import duolingo from './duolingo.js';
import gitlab from './gitlab.js';
import website from './website.js';
// Faz 2 — hesap varlığı (ENUM)
import spotify from './spotify.js';
import microsoft from './microsoft.js';
import msteams from './msteams.js';
import amazon from './amazon.js';
import twitter from './twitter.js';
import adobe from './adobe.js';
import replit from './replit.js';
import pinterest from './pinterest.js';
import quora from './quora.js';
import firefox from './firefox.js';
import wordpress from './wordpress.js';
import patreon from './patreon.js';
import tumblr from './tumblr.js';
import etsy from './etsy.js';
import vsco from './vsco.js';
import codecademy from './codecademy.js';
import quizlet from './quizlet.js';
import plex from './plex.js';
import flickr from './flickr.js';
import pandora from './pandora.js';
import walmart from './walmart.js';
import dropbox from './dropbox.js';
// Tarayıcı gerektiren (yavaş) — Instagram, Pinterest, TikTok tek tarayıcıda
import social from './social.js';
// Veri sızıntısı (XposedOrNot)
import breach from './breach.js';
// Aggregatör bağlantı üreteci (elle kullanım)
import links from './links.js';
// Telefon (biçim/ülke analizi)
import phone from './phone.js';
// Kullanıcı adı motoru (Sherlock doğrulanmış 19 site)
import sherlock from './sherlock.js';
// Ek
import crosscheck from './crosscheck.js';

export const modules = [
  pattern, mx, gravatar, github, proton, duolingo, gitlab, website,
  spotify, microsoft, msteams, amazon, twitter, adobe, replit, pinterest, quora,
  firefox, wordpress, patreon, tumblr, etsy, vsco, codecademy, quizlet, plex,
  flickr, pandora, walmart, dropbox,
  social,
  breach,
  sherlock,
  crosscheck,
  links,
  phone,
];

// Modül girdi-türü sınıflaması (çoklu-giriş dağıtımı için)
export const USERNAME_MODULES = new Set(['crosscheck', 'sherlock', 'social']);
export const PHONE_MODULES = new Set(['phone']);
export const LINK_MODULES = new Set(['links']); // her girdi türünde çalışır
// Geri kalan hepsi e-posta modülüdür.

