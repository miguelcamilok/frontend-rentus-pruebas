<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-col">
        <h4>{{ $t('footer.about.title') }}</h4>
        <p>
          {{ $t('footer.about.description') }}
        </p>
      </div>

      <div class="footer-col">
        <h4>{{ $t('footer.quickLinks.title') }}</h4>
        <ul>
          <li>
            <router-link to="/sobre-nosotros">{{ $t('footer.quickLinks.whoWeAre') }}</router-link>
          </li>
          <li><router-link to="/propiedades">{{ $t('footer.quickLinks.properties') }}</router-link></li>
          <li><a href="#">{{ $t('footer.quickLinks.contact') }}</a></li>
          <li><a href="#">{{ $t('footer.quickLinks.faq') }}</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>{{ $t('footer.contact.title') }}</h4>
        <ul>
          <li>
            <img
              src="https://img.icons8.com/ios-glyphs/20/ffffff/new-post.png"
            />
            <a href="#">industriasrentus@gmail.com</a>
          </li>
          <li>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/phone.png" />
            <span>{{ $t('footer.contact.phone') }}</span>
          </li>
          <li>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/marker.png" />
            <span>{{ $t('footer.contact.address') }}</span>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>{{ $t('footer.social.title') }}</h4>
        <div class="social-icons">
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/facebook-new.png"
              alt="Facebook"
          /></a>
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png"
              alt="Instagram"
          /></a>
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/twitterx--v2.png"
              alt="X"
          /></a>
        </div>
      </div>
    </div>

    <hr />

    <div class="footer-bottom">
      <p>{{ $t('footer.bottom.rights') }}</p>
      <div class="footer-links">
        <a href="#">{{ $t('footer.bottom.legal') }}</a>
        <span>|</span>
        <a href="#">{{ $t('footer.bottom.privacy') }}</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import "../assets/css/components/Footer.css";
</style>