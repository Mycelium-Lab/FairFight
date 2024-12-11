let isDesktop = window.innerWidth > 1024



document.addEventListener("DOMContentLoaded", function () {
  const telegramBtn = document.querySelector('#telegram-btn');
  const discordBtn = document.querySelector('#discord-btn');
  const twitterBtn = document.querySelector('#twiter-btn');
  if (telegramBtn) {
    telegramBtn.addEventListener('click', () => {
      window.open('https://t.me/fairfights_bot', '_blank');
    });
  }
  if (discordBtn) {
    discordBtn.addEventListener('click', () => {
      window.open('https://discord.gg/32NHPDbv3P', '_blank');
    });
  }
  if (twitterBtn) {
    twitterBtn.addEventListener('click', () => {
      window.open('https://x.com/FairProtocol', '_blank');
    });
  }
  const popup = document.querySelector('.play-to-play-popup');
  if (popup) {
    const closeBtn = popup.querySelector('.play-to-play-popup__close');
    const slides = popup.querySelectorAll('.play-to-play-popup__content');
    const nextBtns = popup.querySelectorAll('.play-to-play-popup__btn');
    const points = popup.querySelectorAll('.play-to-play-popup__slide-points span');
    let currentSlide = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'block' : 'none';
        points[i].classList.toggle('active', i === index);
      });

      popup.classList.remove('second-slide', 'third-slide');

      if (index === 1) {
        popup.classList.add('second-slide');
      } else if (index === 2) {
        popup.classList.add('third-slide');
      }
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    showSlide(currentSlide);

    nextBtns.forEach((btn) => {
      btn.addEventListener('click', nextSlide);
    });

    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  }

  // --TEST--
  // --TEST-- ЭТО ДЛЯ ТЕСТА, УДАЛИТЬ КОГДА ДАТА БУДЕТ ПРИХОДИТ ИЗ БЕКА
  const testSimpleBars = document.querySelectorAll('.simple-bar')
  testSimpleBars.forEach(bar => {
    new SimpleBar(bar, { });    
  });
  // --TEST--

  document.querySelectorAll(".custom-select").forEach((customSelect) => {
    const selected = customSelect.querySelector(".select-selected");
    const items = customSelect.querySelector(".select-items-wrapper");
    const arrow = customSelect.querySelector(".arrow");
  
    selected.addEventListener("click", function () {
      
        items.classList.toggle("select-hide");
        arrow.classList.toggle("rotate");
    });
  
    const options = items.querySelectorAll("span");
    options.forEach((option) => {
        option.addEventListener("click", function () {
            selected.innerText = this.innerText;
            selected.setAttribute('data-value', option.getAttribute('data-value'))
            items.classList.add("select-hide");
            arrow.classList.remove("rotate");
        });
    });
  });
  
  document.addEventListener("click", function (e) {
    const openSelects = document.querySelectorAll(".custom-select .select-items-wrapper:not(.select-hide)");
    openSelects.forEach((openSelect) => {
        const customSelect = openSelect.closest(".custom-select");
        const arrow = customSelect.querySelector(".arrow");
  
        if (!customSelect.contains(e.target)) {
            openSelect.classList.add("select-hide");
            arrow.classList.remove("rotate");
        }
    });
  });
  
  try {
    /*if (document.querySelector("#controls-show")) {
      document
          .querySelector("#controls-show")
          .addEventListener("click", function (evt) {
            evt.preventDefault();
            document.querySelector(".modal__wsad").style = "display: flex";
          });
    }*/

    document
        .querySelector("#about-show")
        .addEventListener("click", function (evt) {
          evt.preventDefault();
          document.querySelector("#about_modal").style = "display: flex";
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
      const isOpengames = $(this).is("#opengames-btn"); // Проверка, какая кнопка нажата
      
      // Добавляем класс active к нажатой кнопке и убираем с других
      $(this)
        .addClass("active")
        .siblings()
        .removeClass("active");

      // Сброс активных классов у всех табов
      // $(".tabs__content").removeClass("active");

      // // Если нажата кнопка Open Games
      // if (isOpengames) {
      //   $("#opengames, #opengames-f2p-evm").addClass("active");
      // } 
      // // Если нажата кнопка Past Games
      // else {
      //   $("#pastgames, #pastgames-f2p-evm").addClass("active");
      // }
    });
  });
})(jQuery);


// custom

window.addEventListener('load', () => {
  const btnP2PEvm = document.querySelector('#p2p-btn-evm')
  const btnF2PEvm = document.querySelector('#f2p-btn-evm')
  const newGameBtn = document.querySelector('#btn_modal_window')
  const newGameBtnF2P = document.querySelector('#btn_modal_window-f2p-evm')
  const openGames = document.querySelector('#opengames')
  const pastGames = document.querySelector('#pastgames')
  const openGamesEmpty = document.querySelector('#opengames-empty')
  const openGamesF2PEvm = document.querySelector('#opengames-f2p-evm')
  const pastGamesF2PEvm = document.querySelector('#pastgames-f2p-evm')
  const openGamesEmptyF2PEvm = document.querySelector('#opengames-empty-f2p-evm')
  const createGameBtn = document.querySelector('#createGame')
  const createGameBtnF2P = document.querySelector('#createGame-f2p-evm')
  if (btnP2PEvm) {
    btnP2PEvm.addEventListener('click', () => {
      newGameBtn.style.display = ''
      openGames.style.display = ''
      pastGames.style.display = ''
      openGamesEmpty.style.display = 'none'
      openGamesF2PEvm.style.display = 'none'
      pastGamesF2PEvm.style.display = 'none'
      openGamesEmptyF2PEvm.style.display = 'none'
      newGameBtnF2P.style.display = 'none'
    })
  }
  if (btnF2PEvm) {
    btnF2PEvm.addEventListener('click', () => {
      newGameBtn.style.display = 'none'
      openGames.style.display = 'none'
      pastGames.style.display = 'none'
      openGamesEmpty.style.display = 'none'
      openGamesF2PEvm.style.display = ''
      pastGamesF2PEvm.style.display = ''
      openGamesEmptyF2PEvm.style.display = 'none'
      newGameBtnF2P.style.display = ''
    })
  }
  const btnOpenShop = document.querySelector('#shop-show')
  const btnOpenNftShop = document.querySelector('#nft-shop-btn')
  const btnOpenNftShopMobile = document.querySelector('#menu-nft-shop-btn')
  if (btnOpenShop) btnOpenShop.addEventListener('click', toggleNftShopModal);
  if (btnOpenNftShop) btnOpenNftShop.addEventListener('click', toggleNftShopModal);
  if (btnOpenNftShopMobile) btnOpenNftShopMobile.addEventListener('click', toggleNftShopModal);
  const btnOpenCharactersModalShop = document.querySelectorAll('.new-characters-btn')
  const btnOpenTryLuckModalShop = document.querySelectorAll('.try-luck-btn')
  const nftShopCharactersList = document.querySelector('#nft-shop-characters-list')
  const nftShopWeaponsList = document.querySelector('#nft-shop-weapons-list')
  const nftShopArmorsList = document.querySelector('#nft-shop-armors-list')
  const nftShopBootsList = document.querySelector('#nft-shop-boots-list')
  const nftBoxesBootsList = document.querySelector('#nft-shop-boxes-list')
  const rarityFilter = document.querySelector('#rarity-filter')
  btnOpenCharactersModalShop.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleNftShopModal()    
      nftShopCharactersList.style.display = isDesktop ? 'block' : 'flex'
      rarityFilter.style.display = 'none'
      nftShopWeaponsList.style.display = 'none'
      nftShopArmorsList.style.display = 'none'
      nftShopBootsList.style.display = 'none'
      nftBoxesBootsList.style.display = 'none'
      document.querySelector('#nft-shop-2__tab-1').checked = true
    })    
  });
  btnOpenTryLuckModalShop.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleNftShopModal()
      nftShopCharactersList.style.display = 'none'
      rarityFilter.style.display = 'none'
      nftShopWeaponsList.style.display = 'none'
      nftShopArmorsList.style.display = 'none'
      nftShopBootsList.style.display = 'none'
      nftBoxesBootsList.style.display = isDesktop ? 'block' : 'flex'
      document.querySelector('#nft-shop-2__tab-5').checked = true
    })
  })

  const btnCloseNftShop = document.querySelector('.nft-shop-modal__btn-close')
  btnCloseNftShop.addEventListener('click', toggleNftShopModal)

  // const charactersTabNftShop = document.querySelector('#nft-shop__tab-1')
  // charactersTabNftShop.addEventListener('change', () => toggleTabInNftShopModal('characters'))

  // const weaponsTabNftShop = document.querySelector('#nft-shop__tab-2')
  // weaponsTabNftShop.addEventListener('change', () => toggleTabInNftShopModal('weapons'))

  // const armorTabNftShop = document.querySelector('#nft-shop__tab-3')
  // armorTabNftShop.addEventListener('change', () => toggleTabInNftShopModal('armor'))

  // const bootsTabNftShop = document.querySelector('#nft-shop__tab-4')
  // bootsTabNftShop.addEventListener('change', () => toggleTabInNftShopModal('boots'))

  const dropdownListNftShopBtn = document.querySelector('.dropdown-list__btn')
  dropdownListNftShopBtn.addEventListener('click', toggleDropdownList)

  const dropdownListNftShopItems = document.querySelectorAll('.dropdown-list-nft-shop-items')
  dropdownListNftShopItems.forEach(item => {
    item.addEventListener('click', () => {
      dropdownListNftShopBtn.firstElementChild.innerText = item.innerText
      toggleDropdownList()
    })
  })

  const dropdownListOverlay = document.querySelector('.dropdown-list__overlay')
  dropdownListOverlay.addEventListener('click', toggleDropdownList)

  const inventoryBtnOpen = document.querySelector('#inventory-btn')
  const inventoryBtnOpenMobile = document.querySelector('#menu-inventory-btn')
  const inventoryBtnOpenTon = document.querySelector('#menu-inventory-btn-ton')
  inventoryBtnOpen.addEventListener('click', toggleInventoryModal)
  inventoryBtnOpenMobile.addEventListener('click', toggleInventoryModal)
  if (inventoryBtnOpenTon) inventoryBtnOpenTon.addEventListener('click', toggleInventoryModal);

  const inventoryBtnClose = document.querySelector('.inventory-modal__btn-close')
  inventoryBtnClose.addEventListener('click', toggleInventoryModal)

  const inventoryBtnClose2 = document.querySelector('#inventory-close')
  inventoryBtnClose2.addEventListener('click', toggleInventoryModal)

  try {
    const dressingBtnOpen = document.getElementsByClassName('tryon')
    dressingBtnOpen.addEventListener('click', toggleDressingModal)
    const dressingBtnClose = document.querySelector('.dressing-modal__btn-close')
    dressingBtnClose.addEventListener('click', toggleDressingModal)
  } catch (error) {
    
  }

  const goToInventoryBtn = document.querySelector('#go-to-inventory-btn')
  goToInventoryBtn.addEventListener('click', () => {
    toggleNftShopModal()
    toggleInventoryModal()
    // toggleDressingModal()
    document.getElementById('new-success-modal').style.display = 'none'
  })
  // let weaponCharacterSlot = null

  // const inventorySlots = document.querySelectorAll('.item-list__slot')
  // inventorySlots.forEach(slot => {
  //   slot.addEventListener('dragstart', (e) => {
  //     checkAvailableSlots('weapon')
  //     e.dataTransfer.setData('itemSrc', slot.firstElementChild.src)
  //   })

  //   slot.addEventListener('dragend', () => clearColorsSlots())

  //   slot.addEventListener('dropenter', (e) => e.preventDefault())
  //   slot.addEventListener('dragover', (e) => e.preventDefault())

  //   slot.addEventListener('drop', (e) => {
  //     clearColorsSlots()
  //     weaponCharacterSlot.remove()
  //   })

  //   slot.addEventListener('click', () => {
  //       document.body.style.overflow = 'hidden'
  //       toggleModalItemDetail(slot.firstElementChild.src)
  //   })
  // })

  // const characterSlots = document.querySelectorAll('.slot-wrap__slot')
  // characterSlots.forEach(slot => {
  //   slot.addEventListener('drop', (e) => {
  //     if (slot.firstElementChild) slot.firstElementChild.remove()

  //     if (slot.classList.contains('weapon-slot')) {
  //       const characterSlotItem = document.createElement('div')
  //       characterSlotItem.className = 'character-slot__item'
  //       slot.appendChild(characterSlotItem)

  //       const iconItem = document.createElement('img')
  //       iconItem.src = e.dataTransfer.getData('itemSrc')
  //       characterSlotItem.appendChild(iconItem)

  //       weaponCharacterSlot = characterSlotItem
  //     }

  //     clearColorsSlots()
  //   })

  //   slot.addEventListener('dropenter', (e) => e.preventDefault())
  //   slot.addEventListener('dragover', (e) => e.preventDefault())

  //   slot.addEventListener('dragstart', (e) => {
  //     checkAvailableSlots('weapon')
  //     if (slot.firstElementChild) {
  //       e.dataTransfer.setData('itemSrc', slot.firstElementChild.firstElementChild.src)
  //     }
  //   })

  //   slot.addEventListener('dragend', () => clearColorsSlots())

  //   slot.addEventListener('click', () => {
  //     if (slot.firstElementChild) {
  //       toggleModalItemDetail(slot.firstElementChild.firstElementChild.src)
  //     }
  //   })
  // })

  // const itemDetailModalBtnClose = document.querySelector('#btn-close-item-detail-modal')
  // itemDetailModalBtnClose.addEventListener('click', () => {
  //   toggleModalItemDetail()
  // })

  const buyNowBtn = document.querySelectorAll('.buy-now-btn')
  buyNowBtn.forEach(btn => {
    btn.addEventListener('click', toggleMessageModal)
  })

  const messageModalBtnClose = document.querySelectorAll('.message-modal__btn-close')
  messageModalBtnClose.forEach(btn => {
    btn.addEventListener('click', toggleMessageModal)
  })
})

function toggleMessageModal() {
  const messageModalOverlay = document.querySelector('.wrapper__message-modal-overlay')
  messageModalOverlay.classList.toggle('wrapper__message-modal-overlay_active')
}

function toggleModalItemDetail(imgSrc = '') {
  const itemModalOverlay = document.querySelector('.wrapper__item-modal-overlay')
  itemModalOverlay.classList.toggle('wrapper__item-modal-overlay_active')

  const imgItemModal = document.querySelector('.item-modal-img-wrap')
  imgItemModal.firstElementChild.src = imgSrc

  const backgoundImageIcon = document.querySelector('.body__background-icon')
  backgoundImageIcon.firstElementChild.src = imgSrc
}

// function checkAvailableSlots(type) {
//   const characterSlots = document.querySelectorAll('.slot-wrap__slot')

//   if (type === 'weapon') {
//     characterSlots.forEach(slot => {
//       if (slot.classList.contains('weapon-slot')) {
//         slot.classList.add('available-slot')
//       }
//       else {
//         slot.classList.add('dont-available-slot')
//       }
//     })
//   }
// }

function clearColorsSlots() {
  const characterSlots = document.querySelectorAll('.slot-wrap__slot')

  characterSlots.forEach(slot => {
    slot.classList.remove('available-slot')
    slot.classList.remove('dont-available-slot')
  })
}

function toggleNftShopModal() {
  const nftShopModal = document.querySelector('.wrapper__nft-shop-modal-overlay')
  nftShopModal.classList.toggle('wrapper__nft-shop-modal-overlay_active')

  if (nftShopModal.classList.contains('wrapper__nft-shop-modal-overlay_active')) {
    document.body.style.overflow = 'hidden'
  }
  else {
    document.body.style.overflow = 'auto'
  }
}

// function toggleTabInNftShopModal(tab) {
//   const activeNftShopModalRightTitle = document.querySelector('.nft-shop-modal__right-title_active')
//   activeNftShopModalRightTitle.classList.remove('nft-shop-modal__right-title_active')

//   const activeItemIcon = document.querySelectorAll('.slot__item-icon_active')
//   activeItemIcon.forEach(icon => icon.classList.remove('slot__item-icon_active'))

//   const activeHeaderItemDetail = document.querySelectorAll('.item-detail__header_active')
//   activeHeaderItemDetail.forEach(header => header.classList.remove('item-detail__header_active'))

//   const activeDescriptionItemDetail = document.querySelectorAll('.item-detail__description_active')
//   activeDescriptionItemDetail.forEach(description => description.classList.remove('item-detail__description_active'))

//   if (tab === 'characters') {
//     const rightTitleCharacters = document.querySelector('.nft-shop-modal__right-title-characters')
//     rightTitleCharacters.classList.add('nft-shop-modal__right-title_active')

//     const characters = document.querySelectorAll('.slot__character')
//     characters.forEach(character => {
//       character.classList.add('slot__item-icon_active')
//     })

//     const headerCharacters = document.querySelectorAll('.item-detail__header-characters')
//     headerCharacters.forEach(character => {
//       character.classList.add('item-detail__header_active')
//     })

//     const descriptionCharacters = document.querySelector('.item-detail__description-characters')
//     descriptionCharacters.classList.add('item-detail__description_active')
//   }
//   else if (tab === 'weapons') {
//     const rightTitleWeapons = document.querySelector('.nft-shop-modal__right-title-weapons')
//     rightTitleWeapons.classList.add('nft-shop-modal__right-title_active')

//     const weapons = document.querySelectorAll('.slot__weapon')
//     weapons.forEach(weapon => {
//       weapon.classList.add('slot__item-icon_active')
//     })

//     const headerWeapons = document.querySelectorAll('.item-detail__header-weapons')
//     headerWeapons.forEach(weapon => {
//       weapon.classList.add('item-detail__header_active')
//     })

//     const descriptionWeapons = document.querySelector('.item-detail__description-weapons')
//     descriptionWeapons.classList.add('item-detail__description_active')
//   }
//   else if (tab === 'armor') {
//     const rightTitleArmor = document.querySelector('.nft-shop-modal__right-title-armor')
//     rightTitleArmor.classList.add('nft-shop-modal__right-title_active')

//     const armors = document.querySelectorAll('.slot__armor')
//     armors.forEach(armor => {
//       armor.classList.add('slot__item-icon_active')
//     })

//     const headerArmors = document.querySelectorAll('.item-detail__header-armor')
//     headerArmors.forEach(armor => {
//       armor.classList.add('item-detail__header_active')
//     })

//     const descriptionArmor = document.querySelector('.item-detail__description-armor')
//     descriptionArmor.classList.add('item-detail__description_active')
//   }
//   else {
//     const rightTitleBoots = document.querySelector('.nft-shop-modal__right-title-boots')
//     rightTitleBoots.classList.add('nft-shop-modal__right-title_active')

//     const boots = document.querySelectorAll('.slot__boots')
//     boots.forEach(boot => {
//       boot.classList.add('slot__item-icon_active')
//     })

//     const headerBoots = document.querySelectorAll('.item-detail__header-boots')
//     headerBoots.forEach(boots => {
//       boots.classList.add('item-detail__header_active')
//     })

//     const descriptionBoots = document.querySelector('.item-detail__description-boots')
//     descriptionBoots.classList.add('item-detail__description_active')
//   }
// }

function toggleDropdownList() {
  const dropdownListOverlay = document.querySelector('.dropdown-list__overlay')
  const dropdownListNftShop = document.querySelector('.dropdown-list__list')
  dropdownListNftShop.classList.toggle('dropdown-list__list_active')
  dropdownListOverlay.classList.toggle('dropdown-list__overlay_active')
}

function toggleInventoryModal() {
  const inventoryModalOverlay = document.getElementById('inventory-modal')
  inventoryModalOverlay.classList.toggle('modal-overlay_active')

  if (inventoryModalOverlay.classList.contains('modal-overlay_active')) {
    document.body.style.overflow = 'hidden'
  }
  else {
    document.body.style.overflow = 'auto'
  }
}

function toggleDressingModal() {
  const dressingModalOverlay = document.querySelector('.wrapper__dressing-modal-overlay')
  dressingModalOverlay.classList.toggle('wrapper__dressing-modal-overlay_active')

  if (dressingModalOverlay.classList.contains('wrapper__dressing-modal-overlay_active')) {
    document.body.style.overflow = 'hidden'
  }
  else {
    document.body.style.overflow = 'auto'
  }
}
