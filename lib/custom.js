document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector("#controls-show")) {
    document
      .querySelector("#controls-show")
      .addEventListener("click", function (evt) {
        evt.preventDefault();
        document.querySelector(".modal__wsad").style = "display: block";
      });
  }

  document.querySelectorAll(".map-show").forEach((item) => {
    item.addEventListener("click", function () {
      document.querySelector(".modal__map").style = "display: block";
    });
  });

  document
    .querySelector("#about-show")
    .addEventListener("click", function (evt) {
      evt.preventDefault();
      document.querySelector("#about_modal").style = "display: block";
    });

  const closeModal = document.querySelectorAll(".close_modal_window");
  closeModal.forEach((item) => {
    item.addEventListener("click", function () {
      item.closest(".modal").style = "display: none";
    });
  });
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
})(jQuery);
