import { displayOptions } from './Common.js';

export const displayCategory = () => {
  const select = document.querySelector('.category-select');
  $.get("http://localhost:3000/categories").done((data) =>
      displayOptions(data, select)
  );
}

export const addCategory = (category) => {
  $.ajax({
    url:  'http://localhost:3000/categories',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      "newCategory": category,
    })
  });
}

export default { displayCategory, addCategory };
