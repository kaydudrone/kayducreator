document.addEventListener('click', function(e) {
  // GPX download tracking
  var gpxLink = e.target.closest('a[href$=".gpx"]');
  if (gpxLink) {
    var url = gpxLink.getAttribute('href');
    var trailCard = gpxLink.closest('.trail-card');
    var trailName = trailCard && trailCard.querySelector('.trail-name') ? trailCard.querySelector('.trail-name').textContent.trim() : 'unknown';
    gtag('event', 'file_download', {
      file_name: url.split('/').pop(),
      file_extension: 'gpx',
      link_url: url,
      trail_name: trailName
    });
  }
  // Instagram video button tracking
  var videoLink = e.target.closest('a.btn-ig');
  if (videoLink) {
    var videoUrl = videoLink.getAttribute('href');
    gtag('event', 'video_click', {
      link_url: videoUrl,
      link_text: 'Video'
    });
  }
  // Social / contact button tracking
  var socialLink = e.target.closest('a.social-btn');
  if (socialLink) {
    var socialUrl = socialLink.getAttribute('href');
    var socialText = socialLink.querySelector('span') ? socialLink.querySelector('span').textContent.trim() : 'unknown';
    var platform = socialUrl.includes('wa.me') ? 'WhatsApp'
                 : socialUrl.includes('mailto') ? 'Email'
                 : socialUrl.includes('instagram') ? 'Instagram'
                 : socialUrl.includes('tiktok') ? 'TikTok'
                 : socialUrl.includes('xhslink') ? 'RedNote'
                 : socialUrl.includes('facebook') ? 'Facebook'
                 : socialUrl.includes('youtube') ? 'YouTube'
                 : socialText;
    gtag('event', 'social_click', {
      platform: platform,
      link_url: socialUrl
    });
  }
});
