/*overscroll search logic */
const AdWrapperHTML = `
                  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7431909844582259"
                       crossorigin="anonymous"></script>

                  <ins class="adsbygoogle"
                       style="display:block"
                       data-ad-client="ca-pub-7431909844582259"
                       data-ad-slot="8801020295"
                       data-ad-format="auto"
                       data-full-width-responsive="true"></ins>

                  <script>
                       (adsbygoogle = window.adsbygoogle || []).push({});
                  </script>
  `;
document.addEventListener("DOMContentLoaded", function(){
  const header = document.getElementById("search-wrapper");
  const target = document.getElementById("sticky-anchor"); 

  const observerCallback = (entries) => {
    if (!entries[0].isIntersecting) {
      header.classList.add("stuck");
    } else {

      header.classList.remove("stuck");
    }
  };

  const observerOptions = {
    root: null, 
    rootMargin: "0px",
    threshold: 0
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  observer.observe(target);
});
function toggleFooter(elem) {
  var footer = document.getElementById("expand-footer");

  if (elem.classList.contains("flip")) {
    setTimeout(function() {
      footer.style.display = "none";
    }, 400)
    elem.classList.remove("flip");
    document.getElementById('tablebottom').scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  } else {
    footer.style.display = "table";
    elem.classList.add("flip");
    document.getElementById('tablebottom').scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }
}
function expandFooter(elem) {
  var footer = document.getElementById("expand-footer");
  footer.style.display = "table";
  elem.classList.add("flip");
  document.getElementById('tablebottom').scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  });
}