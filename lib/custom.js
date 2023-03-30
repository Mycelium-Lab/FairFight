document.addEventListener("DOMContentLoaded", function () {
  try {
    if (document.querySelector("#controls-show")) {
      document
        .querySelector("#controls-show")
        .addEventListener("click", function (evt) {
          evt.preventDefault();
          document.querySelector(".modal__wsad").style = "display: block";
        });
    }
  
    document
      .querySelector("#about-show")
      .addEventListener("click", function (evt) {
        evt.preventDefault();
        document.querySelector("#about_modal").style = "display: block";
      });
  
    document
      .querySelector("#howtobuy-show")
      .addEventListener("click", function (evt) {
        evt.preventDefault();
        document.querySelector("#howtobuy_modal").style = "display: block";
      });
      
  
    const closeModal = document.querySelectorAll(".close_modal_window");
    closeModal.forEach((item) => {
      item.addEventListener("click", function () {
        item.closest(".modal").style = "display: none";
      });
    });
  
    document
      .querySelector("#inventory-show")
      .addEventListener("click", function (evt) {
        evt.preventDefault();
        document.querySelector(".inventory-block").classList.add("active");
      });

    document
      .querySelector(".close_inventory")
      .addEventListener("click", function () {
        document.querySelector(".inventory-block").classList.remove("active");
      });

    document
      .querySelector("#shop-show")
      .addEventListener("click", function (evt) {
        evt.preventDefault();
        document.querySelector("#shop_modal").style.display = 'block';
      });

  } catch (error) {
    
  }
});

(function ($) {
  $(function () {
    $(".inner-block__head").on("click", "button:not(.active)", function () {
      $(this)
        .addClass("active")
        .siblings()
        .removeClass("active")
        .closest(".inner-block")
        .find("div.tabs__content")
        .removeClass("active")
        .eq($(this).index())
        .addClass("active");
    });
  });

  setTimeout(function () {
    $(".map-show").hover(
      function () {
        $(".modal__map").addClass("active");
      },
      function () {
        $(".modal__map").removeClass("active");
      }
    );
  }, 1000);



})(jQuery);