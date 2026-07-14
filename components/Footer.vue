<template>
  <footer class="bg-apple-offwhite pt-24 pb-12 border-t border-apple-lightgray relative overflow-hidden">
    <div class="container mx-auto px-6 max-w-7xl relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
        <!-- Brand Info -->
        <div class="col-span-1 lg:col-span-2">
          <NuxtLink to="/" class="flex items-center gap-3 mb-6 group">
            <span class="text-3xl font-bold tracking-tight text-apple-black group-hover:text-apple-gray transition-colors">SHOP</span>
          </NuxtLink>
          <div class="text-apple-gray text-sm leading-relaxed max-w-md space-y-1">
            <p class="font-semibold text-apple-black text-base mb-3">PT Imani Prima</p>
            <p class="flex items-start gap-2">
              <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>Graha STR, 2nd Floor<br>Jalan Ampera Raya No. 11<br>Jakarta Selatan, 12550</span>
            </p>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-apple-black font-semibold mb-6 tracking-wide text-xs">Quick Links</h4>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/" class="text-apple-gray hover:text-apple-blue transition-colors duration-300 text-sm">
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/shop" class="text-apple-gray hover:text-apple-blue transition-colors duration-300 text-sm">
                Shop
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy-policy" class="text-apple-gray hover:text-apple-blue transition-colors duration-300 text-sm">
                Privacy Policy
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div>
          <h4 class="text-apple-black font-semibold mb-6 tracking-wide text-xs uppercase">Contact Us</h4>
          <p class="text-sm text-apple-gray leading-relaxed mb-4">
            Have questions about our products or need technical support? Our team is here to help you.
          </p>
          <a href="mailto:info@imaniprima.co.id" class="inline-flex items-center gap-2 text-apple-blue hover:text-apple-bluehover font-medium text-sm transition-colors group">
            <svg class="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Email Support
          </a>
        </div>
      </div>

      <!-- Copyright Bar -->
      <div class="pt-8 border-t border-apple-lightgray flex flex-col md:flex-row items-center justify-center">
        <p class="text-xs text-apple-gray font-medium">
          Copyright &copy; 2026 <span class="text-apple-black">Imani Prima Shop</span> | Powered by Imani Prima
        </p>
      </div>
    </div>
  </footer>
</template>
