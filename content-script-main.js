window.addEventListener('message', receiveMessage);

async function receiveMessage(event) {
  if (event.origin !== 'https://3.basecamp.com') {
    return;
  }
  if (event.data != 'webenable-sort') {
    return;
  }

  // Parse and check url
  const matches = location.href.match(/https:\/\/3.basecamp.com\/(?<customerId>\d+)\/buckets\/(?<projectId>\d+)\/todolists\/(?<todolistId>\d+)/);
  const { customerId, projectId, todolistId } = matches.groups;
  if (!customerId || !projectId || !todolistId) {
    return;
  }

  const items = new Array();

  // Get todolists (possibly multiple groups)
  const todoListElements = document.querySelectorAll('.todolist');
  for (var indexList = 0; indexList < todoListElements.length; indexList++) {
    const todoListId = todoListElements[indexList].getAttributeNode('data-recording-id').value;
    if (!todoListId) {
      continue;
    }

    // Get todos and direct todo children
    const todosElement = todoListElements[indexList].querySelector('.todos');
    const todoElements = todosElement.querySelectorAll('.todos > .todo:not(.completed)');
    for (var indexItem = 0; indexItem < todoElements.length; indexItem++) {
      const itemId = todoElements[indexItem].getAttributeNode('data-recording-id').value;
      if (!itemId) {
        continue;
      }

      // Find date text within each todo item
      const todoDateElement = todoElements[indexItem].getElementsByClassName('todo__date')[0];
      if (!todoDateElement) {
        continue;
      }
      var dateText = todoDateElement.firstElementChild.innerText;

      // Parse date text for two formats, one including and one excluding year
      var match = dateText.match(/(?<dayOfWeek>.+),\s(?<month>.+)\s(?<day>\d+)/);
      var year = new Date().getFullYear();
      if (!match) {
        match = dateText.match(/(?<month>\w+)\s(?<day>\d+),\s(?<year>\d+)/);
        year = match.groups['year'];
      }
      if (!match || !match.groups['month'] || !match.groups['day']) {
        continue;
      }
      var month = new Date(Date.parse(match.groups['month'] + ' 1, 2000')).getMonth();
      var dateDue = new Date(year, month, match.groups['day']);

      items.push({ todoListId, itemId, dateDue });
    }
  }

  // Sort first by todoListId and then by dateDue
  items.sort((a, b) => a.todoListId - b.todoListId || a.dateDue - b.dateDue);

  // Loop through the items and reset position for each change of todoListId
  var position = 0;
  var todoListIdPrev = 0;
  for (var index = 0; index < items.length; index++) {
    if (items[index].todoListId != todoListIdPrev) {
      position = 0;
    }

    // Use Basecamp's library to position
    const bcUrl = `https://3.basecamp.com/${customerId}/buckets/${projectId}/todos/${items[index].itemId}/position?todo[position]=${++position}&todo[parent_id]=${items[index].todoListId}`;
    await BC.fetch(bcUrl, { method: 'PUT' });

    todoListIdPrev = items[index].todoListId;
  }

  // Reload the page now that all's set
  location.reload();
}