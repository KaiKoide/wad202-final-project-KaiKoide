export const displayOptions = (data, select) => {
  data.forEach(element => {
    const option = document.createElement('option');
    if ('name' in element) {
      option.text = element.name;
      option.value = element.name;
      option.id = element.id;
    } else {
      option.text = element.username;
      option.value = element.username;
      option.id = element.id;
    }

    select.appendChild(option);
  });
};

export default {displayOptions};