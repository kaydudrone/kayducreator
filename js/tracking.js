document.addEventListener('click', function(e) {
  var a = e.target.closest('a');
  if (!a || typeof gtag !== 'function') return;
  var url = a.getAttribute('href') || '';

  // GPX download tracking
  if (/\.gpx(\?|$)/i.test(url)) {
    var trailCard = a.closest('.trail-card');
    var trailName = trailCard && trailCard.querySelector('.trail-name') ? trailCard.querySelector('.trail-name').textContent.trim() : 'unknown';
    gtag('event', 'file_download', {
      file_name: url.split('/').pop(),
      file_extension: 'gpx',
      link_url: url,
      trail_name: trailName
    });
    return;
  }

  // Instagram video button tracking
  if (a.classList.contains('btn-ig')) {
    gtag('event', 'video_click', {
      link_url: url,
      link_text: 'Video'
    });
    return;
  }

  // Social / contact tracking — social buttons + WhatsApp/Email CTA buttons
  var platform = url.indexOf('wa.me') > -1 || url.indexOf('api.whatsapp') > -1 ? 'WhatsApp'
               : url.indexOf('mailto:') === 0 ? 'Email'
               : url.indexOf('instagram') > -1 ? 'Instagram'
               : url.indexOf('tiktok') > -1 ? 'TikTok'
               : url.indexOf('xhslink') > -1 || url.indexOf('xiaohongshu') > -1 ? 'RedNote'
               : url.indexOf('facebook') > -1 ? 'Facebook'
               : url.indexOf('youtube') > -1 ? 'YouTube'
               : null;

  // Fire for any .social-btn, or for WhatsApp/Email links anywhere (e.g. "WhatsApp Me" / "Email Me" CTAs)
  if (a.classList.contains('social-btn') || platform === 'WhatsApp' || platform === 'Email') {
    var label = a.querySelector('span') ? a.querySelector('span').textContent.trim() : a.textContent.trim();
    gtag('event', 'social_click', {
      platform: platform || label || 'unknown',
      link_url: url
    });
  }
});
