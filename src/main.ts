// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faFacebookF, faInstagram, faTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faAlignLeft, faArrowLeft, faBan, faBell, faCar, faChevronDown, faChevronUp, faCircle, faCity, faClipboardList, faCloudUploadAlt, faCog, faExclamationTriangle, faHeading, faHeart as faHeartSolid, faImage, faInfoCircle, faLink, faLock, faPalette, faPeopleGroup, faRoad, faSave, faSignInAlt, faSignOutAlt, faSlidersH, faSort, faSortDown, faSortUp, faThList, faTicket, faToggleOn, faUpload, faUser, faUsers, faWrench } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

import { 
  faCamera, faCheckCircle, faMapMarkerAlt, faPlusCircle, 
  faPen, faEdit, faCheck, faTimes, faHome, faStar, 
  faComments, faEnvelope, faPhone, faCalendar, faPlus,
  faBed, faBath, faRulerCombined, faArrowRight, faTrash,
  faDownload,faEye,faTimesCircle,faBuilding,faStore,
  faTree,faSearch,faDollarSign,faChevronLeft,faChevronRight,
  faSpinner,faImages,faListCheck,faFileAlt,faMap,faCalendarCheck,
  faShareAlt,faClock,faHashtag,faShieldAlt,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faCamera, faCheckCircle, faMapMarkerAlt, faPlusCircle,
  faPen, faEdit, faCheck, faTimes, faHome, faStar,
  faComments, faEnvelope, faPhone, faCalendar, faPlus,
  faBed, faBath, faRulerCombined, faArrowRight, faTrash,
  faFacebookF, faInstagram, faTwitter, faLinkedinIn, faDownload, faEye, faTimesCircle,
  faBuilding, faStore, faTree, faSearch, faDollarSign, faChevronLeft, faChevronRight, 
  faSpinner, faImages, faListCheck, faFileAlt, faMap, faCalendarCheck, faShareAlt,
  faClock, faHashtag, faShieldAlt,   faHeartSolid,faHeartRegular, faUser, faBell, faWrench,
  faSignOutAlt, faClipboardList, faCog, faLock, faPalette, faPeopleGroup, faBan, faUsers, faTicket, 
  faChevronDown, faChevronUp, faSort, faSortUp, faSortDown, faCircle, faInfoCircle, faAlignLeft, faThList,
  faHeading, faCity, faToggleOn, faImage, faSave, faUpload, faCloudUploadAlt, faArrowLeft, faExclamationTriangle,
  faRoad, faCar, faLink, faSlidersH, faSignInAlt
)

const app = createApp(App)
app.use(i18n);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app');

function setFavicon() {
  const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) return;

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  link.href = isDark ? '/src/assets/logo-white.png' : '/src/assets/logo-black.png';
}

setFavicon();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', setFavicon);

router.afterEach((to) => {
  document.title = `RentUs - ${to.meta.title || ''}`;
});