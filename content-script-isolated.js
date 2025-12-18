chrome.runtime.onMessage.addListener(request => {
  if (request && request.type == 'page-rendered') {
    // Sort button in menu on todolists page
    if (location.href.includes('todolists')) {
      var sortButton = document.getElementById('webenable-sort-button');
      if (sortButton == null) {
        // Add sort button to menu if not already present
        var editMenuItem = document.querySelector('aside.perma-toolbar .action-sheet__action--edit');
        if (editMenuItem != null) {
          // Insert after edit menu item
          sortButton = createSortButton();
          editMenuItem.insertAdjacentElement('afterend', sortButton);
        }
      }
    }
  }
});

function createSortButton() {
  const menuItem = document.createElement('a');
  menuItem.id = 'webenable-sort-button';
  menuItem.classList.add('action-sheet__action');
  menuItem.classList.add('action-sheet__action--sort-order');
  menuItem.style.cursor = 'pointer';
  menuItem.innerText = 'Sort by due date';

  menuItem.onclick = () => {
    menuItem.style.pointer = 'default';
    menuItem.style.pointerEvents = 'none';
    menuItem.style.opacity = '0.8';
    menuItem.innerText = 'Sorting...';
    menuItem.onclick = null;
    window.postMessage('webenable-sort', '*');
  };

  return menuItem;
}